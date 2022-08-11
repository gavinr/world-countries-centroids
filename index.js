const fs = require("fs");
const featureLayer = require("@esri/arcgis-rest-feature-service");
const turf = require("@turf/turf");
const Papa = require("papaparse");

// https://www.arcgis.com/home/item.html?id=2b93b06dc0dc4e809d3c8db5cb96ba69
const COUNTRIES_POLYGONS_FEATURE_SERVICE_URL =
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0";

const crossesMeridian = (coordinates) => {
  let atLeastOnePositive = false;
  let atLeastOneNegative = false;

  coordinates.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach((point) => {
        if (point[0] > 0.0) {
          atLeastOnePositive = true;
        } else {
          atLeastOneNegative = true;
        }
      });
    });
  });
  return atLeastOnePositive && atLeastOneNegative;
};

const crossesAntiMeridian = (coordinates) => {
  let atLeastOneNearAntiMeridian = false;

  coordinates.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach((point) => {
        if (point[0] > 179.0 || point[0] < -179.0) {
          atLeastOneNearAntiMeridian = true;
        }
      });
    });
  });
  return crossesMeridian(coordinates) && atLeastOneNearAntiMeridian;
};

const convertCoords = (coordinates) => {
  const retCoordinates = coordinates.map((polygon) => {
    return polygon.map((ring) => {
      return ring.map((point) => {
        if (point[0] > 0.0) {
          return [-180.0 - (180.0 - point[0]), point[1]];
        } else {
          return point;
        }
      });
    });
  });

  return retCoordinates;
};

const convertGeometry = (coordinates) => {
  let workingCoordinates = [...coordinates];

  if (crossesAntiMeridian(workingCoordinates)) {
    workingCoordinates = convertCoords(workingCoordinates);
  }

  return workingCoordinates;
};

const main = async () => {
  try {
    const result = await featureLayer.queryFeatures({
      url: COUNTRIES_POLYGONS_FEATURE_SERVICE_URL,
      where: "1=1",
      outSR: "4326",
      outFields: "COUNTRY,ISO,COUNTRYAFF,AFF_ISO",
      f: "geojson",
    });

    const geoJsonFeatures = result.features.map((feature) => {
      let multiPolygonCoordinates;
      if (feature.geometry.type === "Polygon") {
        multiPolygonCoordinates = [feature.geometry.coordinates];
        feature.geometry.type = "MultiPolygon";
      } else {
        // find largest ring in multipolygon
        let runningLargestArea = 0.0;
        feature.geometry.coordinates.forEach((ring) => {
          console.log('checking area of ', ring);
          const area = turf.area(turf.polygon(ring));
          if(area > runningLargestArea) {
            runningLargestArea = area;
            multiPolygonCoordinates = [ring];
          }
        })
      }

      // The geometry will only get "converted" by the convertGeometry()
      // function if it intersects the antimeridian. If it does, it will convert
      // all the positive values to negative (ex: 179.0 to -181.0)
      const convertedGeometry = convertGeometry(multiPolygonCoordinates);
      const convertedFeature = Object.assign({}, feature);
      convertedFeature.geometry.coordinates = convertedGeometry;
      const movedCenterOfMass = turf.centerOfMass(convertedFeature);

      // If the center of mass is "out of bounds", correct it:
      if (movedCenterOfMass.geometry.coordinates[0] < -180.0) {
        movedCenterOfMass.geometry.coordinates[0] =
          movedCenterOfMass.geometry.coordinates[0] + 360.0;
      }

      const retData = Object.assign({}, feature);
      retData.geometry = movedCenterOfMass.geometry;
      return retData;
    });

    // Build up the GeoJson and CSV files:
    const geoJson = {
      type: "FeatureCollection",
      features: geoJsonFeatures,
    };
    const csv = Papa.unparse(
      geoJson.features.map((feature) => {
        return Object.assign(
          {
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
          },
          feature.properties
        );
      })
    );

    // Write the GeoJson and CSV files:
    await fs.writeFile(
      "dist/countries.geojson",
      JSON.stringify(geoJson),
      "utf8",
      () => {
        console.log("done: geojson");
      }
    );
    await fs.writeFile("dist/countries.csv", csv, "utf8", () => {
      console.log("done: csv");
    });
  } catch (e) {
    console.log(e);
  }
};

main();

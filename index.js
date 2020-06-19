require("cross-fetch/polyfill");
require("isomorphic-form-data");
const fs = require("fs");
const featureLayer = require("@esri/arcgis-rest-feature-layer");
const turf = require("@turf/turf");
const Papa = require("papaparse");

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

const moveGeometry = (coordinates) => {
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
      // due to the "antimeridian" problem, we need to move each feature so the west-most point is at -180
      // then calculate the center of mass,
      // then move the center of mass back based on the offset.
      // if(feature.properties.COUNTRY == "United States") {
      let multiPolygonCoordinates = feature.geometry.coordinates;
      if (feature.geometry.type === "Polygon") {
        multiPolygonCoordinates = [feature.geometry.coordinates];
        feature.geometry.type = "MultiPolygon";
      }

      const movedGeometry = moveGeometry(multiPolygonCoordinates);

      const movedFeature = Object.assign({}, feature);
      movedFeature.geometry.coordinates = movedGeometry;
      const movedCenterOfMass = turf.centerOfMass(movedFeature);

      if (movedCenterOfMass[0] < -180.0) {
        movedCenterOfMass[0] = movedCenterOfMass[0] + 360.0;
      }

      const retData = Object.assign({}, feature);
      retData.geometry = movedCenterOfMass.geometry;
      return retData;
    });

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

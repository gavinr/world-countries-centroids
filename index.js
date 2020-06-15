require("cross-fetch/polyfill");
require("isomorphic-form-data");
const fs = require("fs");
const featureLayer = require("@esri/arcgis-rest-feature-layer");
const turf = require("@turf/turf");
const Papa = require("papaparse");

const COUNTRIES_POLYGONS_FEATURE_SERVICE_URL =
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0";

const main = async () => {
  try {
    const result = await featureLayer.queryFeatures({
      url: COUNTRIES_POLYGONS_FEATURE_SERVICE_URL,
      where: "1=1",
      outSR: "4326",
      outFields: "COUNTRY,ISO,COUNTRYAFF,AFF_ISO",
      f: "geojson",
    });

    console.log("result", result.features[0].attributes);
    console.log("result", result.features[0].geometry);
    const geoJsonFeatures = result.features.map((feature) => {
      const retData = Object.assign({}, feature);
      const centerOfMass = turf.centerOfMass(feature);
      retData.geometry = centerOfMass.geometry;
      return retData;
    });

    // console.log("geoJson:", geoJsonFeatures);
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
        console.log("done0");
      }
    );
    await fs.writeFile("dist/countries.csv", csv, "utf8", () => {
      console.log("done1");
    });
  } catch (e) {
    console.log(e);
  }
};

main();

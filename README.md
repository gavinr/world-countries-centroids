# World Countries - Centroids

Centroids of world countries in CSV, GeoJson, etc

<p align="center">
  <a href="https://gavinr.github.io/geojson-viewer/?silent=true&url=https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v1/dist/countries.geojson"><img src="https://github.com/gavinr/world-countries-centroids/blob/master/countries.png?raw=true" alt="Map of the country centroids" /></a>
</p>


## Background/Problems

- _There is no generally accepted definition of geographic center, and no completely satisfactory method for determining it._ ([USGS](https://pubs.er.usgs.gov/publication/70039437))
- _The geographic center of a region is a fundamental geographic concept, and yet there is no commonly accepted method for its determination._ ([Peter A. Rogerson](https://www.tandfonline.com/doi/full/10.1080/00330124.2015.1062707))

Version 1.0 has been updated to use the centroid of the largest land mass. This way large countries with many disparate areas (like USA, New Zealand, Chile, Portugal) have more rational center points.

## Schema

- `longitude`
- `latitude`
- `COUNTRY` - country name
- `ISO` - country ISO code
- `COUNTRYAFF` - country affiliated
- `AFF_ISO` - country affiliated ISO code

## Data Usage

There are multiple ways to access the data.

### Download

Go to the [releases page](https://github.com/gavinr/world-countries-centroids/releases) to download, then check the [dist folder](https://github.com/gavinr/world-countries-centroids/tree/master/dist) for the data files.

### REST API (ArcGIS Feature Service)

The data is also published to an [ArcGIS Online hosted feature service](https://arcgis.com/home/item.html?id=782028ffbbfc47799f80e738f81c568d). The REST endpoint to [query](https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer-.htm) is:

```
https://services9.arcgis.com/l9yXFvhjz46ekkZV/arcgis/rest/services/Countries_Centroids/FeatureServer/0/query
```

For example, get the center point of Mexico:

<https://services9.arcgis.com/l9yXFvhjz46ekkZV/arcgis/rest/services/Countries_Centroids/FeatureServer/0/query?where=ISO+%3D+%27MX%27&outFields=*&f=pgeojson>

... or for USA and territories: <https://services9.arcgis.com/l9yXFvhjz46ekkZV/ArcGIS/rest/services/Countries_Centroids/FeatureServer/0/query?where=AFF_ISO%3D%27US%27&outFields=*&f=pgeojson> ([Preview](https://gavinr.github.io/geojson-viewer/?url=https://services9.arcgis.com/l9yXFvhjz46ekkZV/ArcGIS/rest/services/Countries_Centroids/FeatureServer/0/query?where=AFF_ISO%3D%27US%27&outFields=*&f=pgeojson))

### REST call - all data

Use JSDelivr to get all the data as CSV or GeoJSON:

- <https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v1/dist/countries.geojson> ([Preview](https://gavinr.github.io/geojson-viewer/?url=https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v1/dist/countries.geojson))
- <https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v1/dist/countries.csv>

### NPM

<https://www.npmjs.com/package/world-countries-centroids>

## License

See [LICENSE](LICENSE) file.

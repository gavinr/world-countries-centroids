# World Countries - Centroids

Centroids of world countries in CSV, GeoJson, etc

## Background/Problems

- _There is no generally accepted definition of geographic center, and no completely satisfactory method for determining it._ ([USGS](https://pubs.er.usgs.gov/publication/70039437))
- _The geographic center of a region is a fundamental geographic concept, and yet there is no commonly accepted method for its determination._ ([Peter A. Rogerson](https://www.tandfonline.com/doi/full/10.1080/00330124.2015.1062707))

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

You may [download](https://github.com/gavinr/world-countries-centroids/archive/refs/heads/master.zip) the data and check the [dist folder](https://github.com/gavinr/world-countries-centroids/tree/master/dist) for data.

### ArcGIS Feature Service

The data is also published to an [ArcGIS Online hosted feature service](https://arcgis.com/home/item.html?id=782028ffbbfc47799f80e738f81c568d). The REST endpoint to [query](https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer-.htm) is:

```
https://services9.arcgis.com/l9yXFvhjz46ekkZV/arcgis/rest/services/Countries_Centroids/FeatureServer/0/query
```

For example, get the center point of Mexico:

https://services9.arcgis.com/l9yXFvhjz46ekkZV/arcgis/rest/services/Countries_Centroids/FeatureServer/0/query?where=ISO+%3D+%27MX%27&outFields=*&f=pgeojson

### REST call - all data

Use JSDelivr to get all the data as CSV or GeoJSON:

- https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v0.2.0/dist/countries.geojson
- https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v0.2.0/dist/countries.csv

### NPM

https://www.npmjs.com/package/world-countries-centroids

## License 

See [LICENSE](LICENSE) file.
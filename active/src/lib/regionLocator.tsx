import * as turf from '@turf/turf';

// 👇 Load your local simplified GeoJSON file (renamed to .json for Expo compatibility)
const countries = require('../../assets/geo/usstates.json') as CountriesGeoJSON;

// Define the type of the GeoJSON file
interface CountryFeature extends GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> {
  properties: {
    NAME?: string;
    [key: string]: any;
  };
}

interface CountriesGeoJSON extends GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, { [key: string]: any }> {
  features: CountryFeature[];
}

/**
 * Finds the country name that contains the given polygon.
 * Uses the polygon's center of mass to determine the country.
 */
export function getCountryFromPolygon(polygon: GeoJSON.Feature): string | null {
  const geojson = countries as CountriesGeoJSON;
  const center = turf.centerOfMass(polygon);

  for (const feature of geojson.features) {
    if (!feature.geometry || (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')) continue;

    if (turf.booleanPointInPolygon(center, feature)) {
      return feature.properties?.name || null;
    }
  }

  return null;
}


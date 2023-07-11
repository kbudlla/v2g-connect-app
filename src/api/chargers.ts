import { ChargingStation, ChargingStations } from 'utils/chargingStations';

import Supercluster from 'supercluster';

// If we include cluster here, we can use it as a discriminated union
type ChargingStationGeoJSONProperties = {
  cluster: false;
  chargingStation: ChargingStation;
};

export type ChargingStationGeoJSONFeatures =
  | Supercluster.ClusterFeature<Record<string, never>>
  | Supercluster.PointFeature<ChargingStationGeoJSONProperties>;

// Static Supercluster instance
const clusterIndex = new Supercluster<ChargingStationGeoJSONProperties, Record<string, never>>({
  radius: 50,
  maxZoom: 16,
});
clusterIndex.load(
  ChargingStations.map((cs) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [cs.location.lat, cs.location.lng],
    },
    properties: {
      cluster: false,
      chargingStation: cs,
    },
  })),
);

export const getClusteredChargingStations = async (
  bbox: [number, number, number, number],
  zoom: number,
): Promise<ChargingStationGeoJSONFeatures[]> => {
  const clusters = clusterIndex.getClusters(bbox, zoom);
  clusters.sort((a, b) => {
    // If both are clusters, sort by size
    if (a.properties.cluster && b.properties.cluster) {
      return a.properties.point_count - b.properties.point_count;
    }
    // Prefer stations over clusters
    if (a.properties.cluster) return -1;
    if (b.properties.cluster) return 1;

    // stations are considered equal
    return 0;
  });
  return await Promise.resolve(clusters);
};

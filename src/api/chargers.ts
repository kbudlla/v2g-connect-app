import chargingStations from 'assets/data/chargingStationsBNE.json';
import Supercluster from 'supercluster';

// Typing
type ChargingStation = {
  operator: string;
  location: ChargingStationLocation;
  commissioningDate: string;
  totalCapacity: string;
  type: string;
  chargerCount: number;
  chargerInfo: ChargingStationChargerInfo[];
};
type ChargingStationLocation = {
  street: string;
  number: string;
  supplement: string;
  city: string;
  district: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
};

type ChargingStationConnectorType =
  | 'Type2'
  | 'CCS'
  | 'CHAdeMO'
  | 'Schuko'
  | 'CEE'
  | 'CEE3Pin'
  | 'CEE5Pin'
  | 'Tesla'
  | 'Type2Tesla';

type ChargingStationChargerInfo = {
  capacity: number;
  connectorTypes: ChargingStationConnectorType[];
  publicKey: string;
};

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
  (chargingStations as ChargingStation[]).map((cs) => ({
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

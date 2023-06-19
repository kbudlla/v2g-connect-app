import React, { useCallback, useState } from 'react';

import { ChargingStationGeoJSONFeatures, getClusteredChargingStations } from 'api/chargers';

import './ChargerMap.scss';

import ChargerMapMarker from './ChargerMapMarker';

import { Map, MapProps, Marker } from 'pigeon-maps';
import { osm } from 'pigeon-maps/providers';

type Args<T> = T extends (args: infer RT) => any ? RT : never;
type BoundsChangedOptions = Args<MapProps['onBoundsChanged']>;

export default function ChargerMap() {
  const [markers, setMarkers] = useState<ChargingStationGeoJSONFeatures[]>([]);
  const handleBoundsChanged = useCallback(async (options: BoundsChangedOptions) => {
    const clusters = await getClusteredChargingStations([...options.bounds.sw, ...options.bounds.ne], options.zoom);

    setMarkers(clusters);
  }, []);

  return (
    <Map provider={osm} defaultCenter={[48.149631, 11.567892]} defaultZoom={11} onBoundsChanged={handleBoundsChanged}>
      {markers.map((markerGeoJSON, index) => (
        <Marker key={markerGeoJSON.id ?? index} anchor={markerGeoJSON.geometry.coordinates as [number, number]}>
          <ChargerMapMarker {...markerGeoJSON.properties} />
        </Marker>
      ))}
    </Map>
  );
}

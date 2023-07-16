import React, { useCallback, useRef, useState } from 'react';

import { ChargingStationGeoJSONFeatures, getClusteredChargingStations } from 'api/chargers';

import { useResponsiveDimensions } from 'utils/hooks';

import ChargerMapMarker from './ChargerMapMarker';

import { Map, MapProps, Marker } from 'pigeon-maps';
import { osm } from 'pigeon-maps/providers';

type Args<T> = T extends (args: infer RT) => unknown ? RT : never;
type BoundsChangedOptions = Args<MapProps['onBoundsChanged']>;

export default function ChargerMap() {
  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const [markers, setMarkers] = useState<ChargingStationGeoJSONFeatures[]>([]);
  const handleBoundsChanged = useCallback(async (options: BoundsChangedOptions) => {
    const clusters = await getClusteredChargingStations([...options.bounds.sw, ...options.bounds.ne], options.zoom);

    setMarkers(clusters);
  }, []);

  const { boundingBox } = useResponsiveDimensions(rootElementRef, 150);

  return (
    <div className="h-full w-full overflow-hidden" ref={rootElementRef}>
      <Map
        height={boundingBox?.height ?? 0}
        width={boundingBox?.width ?? 0}
        provider={osm}
        defaultCenter={[48.149631, 11.567892]}
        defaultZoom={11}
        onBoundsChanged={handleBoundsChanged}
      >
        {markers.map((markerGeoJSON, index) => (
          <Marker key={markerGeoJSON.id ?? index} anchor={markerGeoJSON.geometry.coordinates as [number, number]}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ChargerMapMarker {...(markerGeoJSON.properties as any)} />
          </Marker>
        ))}
      </Map>
    </div>
  );
}

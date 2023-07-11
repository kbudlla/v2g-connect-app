import React from 'react';

import { ChargingStationGeoJSONFeatures } from 'api/chargers';

import { sigmoid } from 'utils/math';

type ChargerMapMarkerProps = ChargingStationGeoJSONFeatures['properties'];

function ChargerMapMarker(props: ChargerMapMarkerProps): JSX.Element {
  const { cluster } = props;

  const size = cluster ? 64 * sigmoid(props.point_count / 100) : 32;

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="chargermap-marker-root"
    >
      <div className="chargermap-marker-content">{props.cluster ? props.point_count : 'stat'}</div>
    </div>
  );
}

export default React.memo(ChargerMapMarker);

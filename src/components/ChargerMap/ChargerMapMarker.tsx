import { Typography } from "antd";
import { ChargingStationGeoJSONFeatures } from "api/chargers"
import React from "react"

type ChargerMapMarkerProps = ChargingStationGeoJSONFeatures['properties']

// ML.
const sigmoid = (x: number) => 1.0 / (1 + Math.pow(Math.E, -x))

function ChargerMapMarker(props: ChargerMapMarkerProps): JSX.Element {
    const { cluster } = props;

    const size = cluster? 64*sigmoid(props.point_count/100) : 32

    return (
        <div
            style={{
                width: size,
                height: size,
            }}
            className="chargermap-marker-root"
        >
            <div className="chargermap-marker-content">
                { props.cluster? props.point_count : 'stat' }
            </div>
        </div>
    )
}

export default React.memo(ChargerMapMarker)
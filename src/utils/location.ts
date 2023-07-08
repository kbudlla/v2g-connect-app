import { useCallback, useEffect, useRef, useState } from 'react';

type useGeoLocationOptions = {
  watch?: boolean;
  enableHighAccuracy?: boolean;
};

export enum GeoLocationError {
  PermissionDenied,
  Timeout,
  PositionUnavailable,
}

const GeoLocationErrorMap: Record<number, GeoLocationError> = {
  [GeolocationPositionError.PERMISSION_DENIED]: GeoLocationError.PermissionDenied,
  [GeolocationPositionError.POSITION_UNAVAILABLE]: GeoLocationError.PositionUnavailable,
  [GeolocationPositionError.TIMEOUT]: GeoLocationError.Timeout,
};

export const useGeoLocation = (options: useGeoLocationOptions) => {
  const { enableHighAccuracy, watch } = options;
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<GeoLocationError | null>(null);
  const isMountedRef = useRef(false);

  const handleLocationUpdate = useCallback<PositionCallback>((location) => {
    if (!isMountedRef.current) return;
    setLocation(location);
  }, []);

  const handleLocationUpdateError = useCallback<PositionErrorCallback>((error) => {
    if (!isMountedRef.current) return;
    setLocationError(GeoLocationErrorMap[error.code]);
  }, []);

  const updateLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(handleLocationUpdate, handleLocationUpdateError, {
      enableHighAccuracy,
      maximumAge: 5000,
      timeout: 2000,
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    let watchHandlerId: number | null = null;

    // If not in watch-mode, query the location once, here
    if (!watch) updateLocation();
    else {
      watchHandlerId = navigator.geolocation.watchPosition(handleLocationUpdate, handleLocationUpdateError, {
        enableHighAccuracy,
        maximumAge: 5000,
        timeout: 500,
      });
    }

    return () => {
      isMountedRef.current = false;
      if (watchHandlerId != null) {
        navigator.geolocation.clearWatch(watchHandlerId);
      }
    };
  }, []);

  return {
    location,
    error: locationError,
    updateLocation,
  };
};

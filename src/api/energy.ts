import { useCallback, useEffect, useRef, useState } from 'react';

import { APIHookError, APIResponse } from './types';

import { ChargingReceipt, EnergyUsageTimestep } from 'utils/simulation';
import { TimeRange } from 'utils/time';

type EnergyUsageStats = Omit<EnergyUsageTimestep, 'batteryIn' | 'batteryOut' | 'timestamp'>;

export type EnergyUsageInfo = {
  average: EnergyUsageStats;
  total: Omit<EnergyUsageStats, 'chargingRateKW' | 'dischargeRateKW' | 'chargingMix'>;
  timeseries: EnergyUsageTimestep[];
  batteryCapacityKWh: number;
  receipts: ChargingReceipt[];
};

/* API-Call */

export const getEnergyUsage = async (
  userId: string,
  minimumStateOfCharge: number,
  range: TimeRange,
): Promise<APIResponse<EnergyUsageInfo>> => {
  const instance = new ComlinkWorker<typeof import('./workers/simulation')>(
    new URL('./workers/simulation', import.meta.url),
  );
  const result = await instance.getEnergyUsage(userId, minimumStateOfCharge, range);

  // Return after timeout
  return {
    status: 200,
    data: result,
  };
};

/* Hooks */

export const useEnergyUsage = (userId: string, minimumStateOfCharge: number, range: TimeRange) => {
  const [loading, setLoading] = useState(false);
  const [energyUsageInfo, setEnergyUsageInfo] = useState<EnergyUsageInfo | null>(null);
  const [error, setError] = useState<APIHookError | null>(null);
  const isMountedRef = useRef(false);

  const update = useCallback(() => {
    // TODO this is very generic, so we could make this a wrapper thingie
    setLoading(true);
    getEnergyUsage(userId, minimumStateOfCharge, range).then((val) => {
      if (!isMountedRef.current) return;
      setLoading(false);
      if (val.status !== 200) {
        setError(APIHookError.InvalidRequestError);
        setEnergyUsageInfo(null);
        return;
      }
      if (val.data == null) {
        setError(APIHookError.ServerSideError);
        setEnergyUsageInfo(null);
        return;
      }
      setError(null);
      setEnergyUsageInfo(val.data);
    });
  }, [userId, range, minimumStateOfCharge]);

  useEffect(() => {
    isMountedRef.current = true;

    // Update on mount
    update();

    return () => {
      isMountedRef.current = false;
    };
  }, [update]);

  return {
    loading,
    error,
    energyUsageInfo,
    update,
  };
};

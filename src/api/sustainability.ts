import { useCallback, useEffect, useRef, useState } from 'react';

import { APIHookError, APIResponse } from './types';

import { resolveWithTimeout } from 'utils/mock';
import { halfSpace } from 'utils/units';

import { faker } from '@faker-js/faker';

/* Typing */

type LeaderboardUserInternal = {
  id: string;
  name: string;
  location: string;
  points: number;
};

export type LeaderboardUser = LeaderboardUserInternal & { position: number };

export type Challenge = {
  id: string;
  name: string;
  points: number;
  completion: {
    done: boolean;
    discrete: boolean;
    count: number;
    total: number;
  };
};

/* Helper functions */

const createFakeUser = (): LeaderboardUserInternal => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  location: faker.location.city(),
  points: Math.floor(Math.random() * 10000),
});

const createFakeChallenge = (): Challenge => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement([
    'Charge your car 10 times',
    `Save 30${halfSpace}KG CO2 emissions`,
    'Invite 10 friends',
    'Spend 10 hours at a charger',
    'Redeem a Reward',
    'Use a high-speed charger',
    `Charge 100${halfSpace}KWh in one sitting`,
  ]),
  points: Math.floor(Math.random() * 10) + 100,
  completion:
    Math.random() > 0.5
      ? { done: true, count: 10, total: 10, discrete: true }
      : Math.random() > 0.5
      ? {
          done: false,
          count: Math.floor(Math.random() * 9),
          total: 10,
          discrete: true,
        }
      : {
          done: false,
          count: Math.floor(Math.random() * 99),
          total: 100,
          discrete: false,
        },
});

/* Database */

const users = faker.helpers.multiple(createFakeUser, {
  count: 1000,
});

const challenges = faker.helpers.multiple(createFakeChallenge, {
  count: 100,
});

/* API abstraction */

export const getLeaderboard = async (
  limit?: number,
  sortBy?: Exclude<keyof LeaderboardUser, 'id'>,
): Promise<APIResponse<LeaderboardUser[]>> => {
  const sortKey = sortBy ?? 'points';

  // Add the position, by sorting the users and counting their index
  const sortedUsers = [...users];
  sortedUsers.sort((a, b) => b.points - a.points);
  let data = sortedUsers.map((user, index) => ({ ...user, position: index + 1 }));

  // Apply sorting
  data.sort((a, b) => {
    switch (sortKey) {
      case 'points':
      case 'position':
        return b[sortKey] - a[sortKey];
      default:
        return b[sortKey].localeCompare(a[sortKey]);
    }
  });

  // Apply limit
  if (limit) {
    data = data.slice(0, limit);
  }

  // Return after timeout
  return resolveWithTimeout({
    status: 200,
    data,
  });
};

export const getChallenges = async (
  limit?: number,
  sortBy?: Exclude<keyof Challenge, 'id'>,
): Promise<APIResponse<Challenge[]>> => {
  const sortKey = sortBy ?? 'completion';

  // Apply sorting
  let data = [...challenges];
  data.sort((a, b) => {
    switch (sortKey) {
      case 'points':
        return b.points - a.points;
      case 'completion':
        // eslint-disable-next-line no-case-declarations
        const percentageA = a.completion.count / a.completion.total;
        // eslint-disable-next-line no-case-declarations
        const percentageB = b.completion.count / b.completion.total;

        // If they're equal, sort by points instead
        if (percentageA === percentageB) {
          return b.points - a.points;
        }

        return percentageB - percentageA;
      default:
        return b[sortKey].localeCompare(a[sortKey]);
    }
  });

  // Apply limit
  if (limit) {
    data = data.slice(0, limit);
  }

  // Return after timeout
  return resolveWithTimeout({
    status: 200,
    data,
  });
};

/* Hooks */

export const useLeaderboard = (limit?: number, sortBy?: Exclude<keyof LeaderboardUser, 'id'>) => {
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [error, setError] = useState<APIHookError | null>(null);
  const isMountedRef = useRef(false);

  const update = useCallback(() => {
    // TODO this is very generic, so we could make this a wrapper thingie
    setLoading(true);
    getLeaderboard(limit, sortBy).then((val) => {
      if (!isMountedRef.current) return;
      setLoading(false);
      if (val.status !== 200) {
        setError(APIHookError.InvalidRequestError);
        setLeaderboard([]);
        return;
      }
      if (val.data == null) {
        setError(APIHookError.ServerSideError);
        setLeaderboard([]);
        return;
      }
      setError(null);
      setLeaderboard(val.data);
    });
  }, [limit, sortBy]);

  useEffect(() => {
    isMountedRef.current = true;

    // Update on mount
    update();

    return () => {
      isMountedRef.current = false;
    };
  }, [limit, sortBy, update]);

  return {
    loading,
    error,
    leaderboard,
    update,
  };
};

export const useChallenges = (limit?: number, sortBy?: Exclude<keyof Challenge, 'id'>) => {
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [error, setError] = useState<APIHookError | null>(null);
  const isMountedRef = useRef(false);

  const update = useCallback(() => {
    // TODO this is very generic, so we could make this a wrapper thingie
    setLoading(true);
    getChallenges(limit, sortBy).then((val) => {
      if (!isMountedRef.current) return;
      setLoading(false);
      if (val.status !== 200) {
        setError(APIHookError.InvalidRequestError);
        setChallenges([]);
        return;
      }
      if (val.data == null) {
        setError(APIHookError.ServerSideError);
        setChallenges([]);
        return;
      }
      setError(null);
      setChallenges(val.data);
    });
  }, [limit, sortBy]);

  useEffect(() => {
    isMountedRef.current = true;

    // Update on mount
    update();

    return () => {
      isMountedRef.current = false;
    };
  }, [limit, sortBy, update]);

  return {
    loading,
    error,
    challenges,
    update,
  };
};

import { APIResponse } from './types';

import { resolveWithTimeout } from 'utils/mock';
import { halfSpace } from 'utils/units';

import { faker } from '@faker-js/faker';

/* Typing */

export type LeaderboardUser = {
  id: string;
  name: string;
  location: string;
  points: number;
};

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

const createFakeUser = (): LeaderboardUser => ({
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

  // Apply sorting
  let data = [...users];
  data.sort((a, b) => {
    switch (sortKey) {
      case 'points':
        return a.points - b.points;
      default:
        return a[sortKey].localeCompare(b[sortKey]);
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
  const sortKey = sortBy ?? 'points';

  // Apply sorting
  let data = [...challenges];
  data.sort((a, b) => {
    switch (sortKey) {
      case 'points':
        return a.points - b.points;
      case 'completion':
        // eslint-disable-next-line no-case-declarations
        const percentageA = a.completion.count / a.completion.total;
        // eslint-disable-next-line no-case-declarations
        const percentageB = b.completion.count / b.completion.total;

        // If they're equal, sort by points instead
        if (percentageA === percentageB) {
          return a.points - b.points;
        }

        return percentageA - percentageB;
      default:
        return a[sortKey].localeCompare(b[sortKey]);
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

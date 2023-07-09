import moment from 'moment';

export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export type TimeRange = { from: Date; to: Date; unit: TimeUnit };

type DefaultRangeForTimeUnitOptions = {
  unit: TimeUnit;
  to?: Date;
};
/*
Returns somewhat sensible default ranges for a given time-unit
The returned value is in ms.
*/
export const defaultRangeForTimeUnit = (options: DefaultRangeForTimeUnitOptions): TimeRange => {
  // Default to the end of the current day
  const to = options.to ?? moment().endOf('day').toDate();
  const { unit } = options;
  switch (unit) {
    case 'minutes':
    case 'hours':
      // Current day
      return { to, from: moment(to).subtract(1, 'day').toDate(), unit };
    case 'days':
    case 'weeks':
      // Current month
      return { to, from: moment(to).subtract(1, 'month').toDate(), unit };
    case 'months':
      // Current year
      return { to, from: moment(to).subtract(1, 'year').toDate(), unit };
  }
};

export const getTimeSteps = (range: TimeRange) => {
  const { from, to, unit } = range;
  const difference = moment(to).diff(from, unit);

  console.log(difference);

  const start = moment(from);
  return new Array(difference).fill(0).map((_, i) => start.add(i, unit).toDate());
};

export const unitToMs = (unit: TimeUnit): number => {
  switch (unit) {
    case 'minutes':
      return 60 * 1000;
    case 'hours':
      return 60 * unitToMs('minutes');
    case 'days':
      return 24 * unitToMs('hours');
    case 'weeks':
      return 7 * unitToMs('days');
    case 'months':
      return 30.4167 * unitToMs('days');
  }
};

export const toYearPercentage = (unit: TimeUnit): number => {
  const unitInMs = unitToMs(unit);
  const yearInMs = 52.1429 * unitToMs('weeks');

  return unitInMs / yearInMs;
};

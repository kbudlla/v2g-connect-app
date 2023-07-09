import { useCallback, useMemo } from 'react';

import { CarbonFootprintInfo } from 'api/sustainability';

import { TimeUnit } from 'utils/time';
import { formatKgValue } from 'utils/units';

import moment from 'moment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

type RealtimeFootprintChartProps = {
  timeseries?: CarbonFootprintInfo['timeseries'];
  timeUnit: TimeUnit;
};

// TODO! add locale
const getTimeFormatter = (unit: TimeUnit) => {
  switch (unit) {
    case 'minutes':
      return (val: number) => moment(val).format('LT');
    case 'hours':
      return (val: number) => moment(val).format('LT');
    case 'days':
      return (val: number) => moment(val).format('dddd');
    case 'weeks':
      return (val: number) => moment(val).format('WW');
    case 'months':
      return (val: number) => moment(val).format('MMM');
  }
};

type XAxisTickProps = {
  x: number;
  y: number;
  payload: {
    index: number;
    value: number;
  };
  tickFormatter: (x: number, index: number) => string;
};
function CustomXAxixTick(props: XAxisTickProps) {
  const {
    x,
    y,
    payload: { index, value },
    tickFormatter,
  } = props;

  const [tick, yval] = tickFormatter(value, index).split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} fill="#868D97" fontFamily="Roboto" letterSpacing="-0.1%">
        <tspan textAnchor="middle" x="0" fontWeight={600} fontSize={20}>
          {tick}
        </tspan>
        <tspan textAnchor="middle" x="0" dy="20" fontWeight={500} fontSize={14}>
          {formatKgValue(parseFloat(yval))}
        </tspan>
      </text>
    </g>
  );
}

function RealtimeFootprintChart(props: RealtimeFootprintChartProps): JSX.Element {
  const { timeseries, timeUnit } = props;

  const data = useMemo(() => {
    if (!timeseries) return [];
    // Poor man's zip
    return timeseries.x.map((x, i) => ({
      x: moment(x).valueOf(),
      y: timeseries.y[i],
    }));
  }, [timeseries]);

  const timeFormatter = useMemo(() => getTimeFormatter(timeUnit), [timeUnit]);

  const xTickFormatter = useCallback(
    (x: number, index: number) => {
      const y = timeseries?.y[index] ?? 0;
      return `${timeFormatter(x)}\n${y}`;
    },
    [timeFormatter, timeseries],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 5,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" interval={0} tick={CustomXAxixTick} tickFormatter={xTickFormatter} />
        <Bar dataKey="y" fill="#4DC36F" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default RealtimeFootprintChart;

import { useMemo } from 'react';

import { EnergyUsageTimestep } from 'api/energy';

import { leftPad } from 'utils/formatting';
import { TimeUnit } from 'utils/time';
import { halfSpace } from 'utils/units';

import moment from 'moment';
import { XAxis, CartesianGrid, ResponsiveContainer, YAxis, AreaChart, Area, Label, Legend } from 'recharts';

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

const percentTickFormatter = (val: number) => `${leftPad((val * 100).toFixed(0), 3, '\xa0')}${halfSpace}%`;

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

  const tick = tickFormatter(value, index);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} fill="#868D97" fontFamily="Roboto" letterSpacing="-0.1%">
        <tspan textAnchor="middle" x="0" fontWeight={600} fontSize={20}>
          {tick}
        </tspan>
      </text>
    </g>
  );
}

type EnergyGraphProps = {
  timeseries?: EnergyUsageTimestep[];
  timeUnit: TimeUnit;
};

function EnergyGraph(props: EnergyGraphProps): JSX.Element {
  const { timeseries, timeUnit } = props;

  const data = useMemo(() => {
    if (!timeseries) return [];
    // Get the global x-values:
    const x = timeseries.map((e) => e.timestamp);
    const batteryAverage = timeseries.map((e) => (e.batteryIn + e.batteryOut) / 2);
    const dischargedKWh = timeseries.map((e) => e.dischargedKWh);
    const chargedKWh = timeseries.map((e) => e.chargedKWh);

    // Create a new graph-object out of it
    return x.map((x, i) => ({
      x: moment(x).valueOf(),
      battery: batteryAverage[i],
      charge: chargedKWh[i],
      discharge: dischargedKWh[i],
    }));
  }, [timeseries]);

  const timeFormatter = useMemo(() => getTimeFormatter(timeUnit), [timeUnit]);

  console.log(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 5,
          bottom: 20,
        }}
      >
        {/* Add some cool-looking gradients */}
        <defs>
          <linearGradient id="discharge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#008EC3" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#008EC3" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="charge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4DC36F" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4DC36F" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="battery" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00B594" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00B594" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" interval={0} tick={CustomXAxixTick} tickFormatter={timeFormatter} />
        {/* <Bar dataKey="discharge" fill="#4DC36F" /> */}

        <YAxis yAxisId="battery" orientation="right" tickFormatter={percentTickFormatter}>
          <Label
            value="Battery percentage"
            position="center"
            dx={30}
            angle={90}
            style={{
              fontFamily: 'Roboto',
              fontWeight: 800,
            }}
          />
        </YAxis>
        <Area type="monotone" dataKey="battery" stroke="#00B594" fill="url(#battery)" yAxisId="battery" />

        <YAxis yAxisId="kWh">
          <Label
            value="Total Energy (kWh)"
            position="center"
            dx={-20}
            angle={90}
            style={{
              fontFamily: 'Roboto',
              fontWeight: 800,
            }}
          />
        </YAxis>
        <Area type="monotone" dataKey="discharge" stroke="#008EC3" fill="url(#discharge)" yAxisId="kWh" />
        <Area type="monotone" dataKey="charge" stroke="#4DC36F" fill="url(#charge)" yAxisId="kWh" />

        <Legend layout="horizontal" align="center" verticalAlign="bottom" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default EnergyGraph;

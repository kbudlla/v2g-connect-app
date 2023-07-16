import { useMemo, useRef } from 'react';

import { leftPad } from 'utils/formatting';
import { useResponsiveDimensions } from 'utils/hooks';
import { findClosestValueIndex } from 'utils/interpolation';
import { measureTextSize } from 'utils/ruler';
import { EnergyUsageTimestep } from 'utils/simulation';
import { TimeUnit } from 'utils/time';
import { halfSpace } from 'utils/units';

import moment from 'moment';
import { XAxis, CartesianGrid, ResponsiveContainer, YAxis, AreaChart, Area, Label, Legend } from 'recharts';

const getTickLabelSize = (label: string) => {
  const style: React.CSSProperties = {
    fontFamily: 'Roboto',
    letterSpacing: '-0.1%',
    fontWeight: 600,
    fontSize: '1.25em',
  };

  return measureTextSize(label, style);
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

type YAxisTickProps = {
  x: number;
  y: number;
  payload: {
    index: number;
    value: number;
  };
  tickFormatter: (x: number, index: number) => string;
  orientation: 'right' | 'left';
};

function V2GYAxisTick(props: YAxisTickProps): JSX.Element {
  const {
    x,
    y,
    payload: { index, value },
    tickFormatter,
    orientation,
  } = props;
  const tick = tickFormatter?.(value, index) ?? value;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <text x={0} y={0} fill="#868D97" fontFamily="Roboto">
        <tspan
          textAnchor={orientation === 'left' ? 'end' : 'start'}
          dy={2}
          alignmentBaseline="middle"
          y="0"
          fontWeight={500}
          fontSize={14}
        >
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

  // Calculate the # of ticks to show based on the container size
  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const { boundingBox } = useResponsiveDimensions(rootElementRef);
  const { xAxisTicks, xAxisDomain, xAxisTickCount } = useMemo(() => {
    const xValues = data.map((e) => e.x);

    // get the widths of the labels:
    const widths = xValues.map((e) => getTickLabelSize(timeFormatter(e)).width);
    const totalTicks = widths.length;
    const maxWidth = Math.max(...widths);
    const nTicksRaw = Math.floor((boundingBox?.width ?? 0) / (maxWidth + 16));
    // Don't return an even # of ticks, unless we're doing the full count anyways
    const nTicks = nTicksRaw >= totalTicks ? totalTicks : nTicksRaw % 2 === 0 ? nTicksRaw - 1 : nTicksRaw;

    // Now we need to resample the ticks ourselves
    // We always include the first and last tick
    const startTimestamp = xValues[0];
    const endTimestamp = xValues[xValues.length - 1];
    const step = (endTimestamp - startTimestamp) / (nTicks - 1);

    return {
      xAxisTicks: [
        startTimestamp,
        ...new Array(Math.max(0, nTicks - 2)).fill(0).map((_, i) => {
          const value = startTimestamp + (i + 1) * step;
          const index = findClosestValueIndex(xValues, value);
          return xValues[index];
        }),
        endTimestamp,
      ],
      xAxisTickCount: nTicks,
      xAxisDomain: [startTimestamp, endTimestamp],
    };
  }, [boundingBox, data, timeFormatter]);

  return (
    <div className="w-full h-full" ref={rootElementRef}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 0,
            bottom: 0,
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

          <CartesianGrid strokeDasharray={`3 ${xAxisTickCount}`} />
          <XAxis
            type="number"
            dataKey="x"
            domain={xAxisDomain}
            ticks={xAxisTicks}
            tickCount={xAxisTickCount}
            tick={CustomXAxixTick}
            tickFormatter={timeFormatter}
          />

          <YAxis
            yAxisId="battery"
            orientation="right"
            tickFormatter={percentTickFormatter}
            domain={[0, 1]}
            tick={V2GYAxisTick}
          >
            <Label
              value="Battery percentage"
              position="center"
              dx={25}
              angle={90}
              style={{
                fontFamily: 'Roboto',
                fontWeight: 800,
              }}
            />
          </YAxis>
          <Area
            type="monotone"
            name="Battery (%)"
            dataKey="battery"
            stroke="#00B594"
            fill="url(#battery)"
            yAxisId="battery"
          />

          <YAxis yAxisId="kWh" tick={V2GYAxisTick}>
            <Label
              value="Total Energy (kWh)"
              position="center"
              dx={-15}
              angle={90}
              style={{
                fontFamily: 'Roboto',
                fontWeight: 800,
              }}
            />
          </YAxis>
          <Area
            type="monotone"
            name="Discharged (kWh)"
            dataKey="discharge"
            stroke="#008EC3"
            fill="url(#discharge)"
            yAxisId="kWh"
          />
          <Area
            type="monotone"
            name="Charged (kWh)"
            dataKey="charge"
            stroke="#4DC36F"
            fill="url(#charge)"
            yAxisId="kWh"
          />

          <Legend layout="horizontal" align="center" verticalAlign="bottom" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EnergyGraph;

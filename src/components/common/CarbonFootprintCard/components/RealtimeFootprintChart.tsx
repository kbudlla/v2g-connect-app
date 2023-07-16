import { useCallback, useMemo, useRef } from 'react';

import { CarbonFootprintInfo } from 'api/sustainability';

import { useResponsiveDimensions } from 'utils/hooks';
import { findClosestValueIndex } from 'utils/interpolation';
import { measureTextSize } from 'utils/ruler';
import { TimeUnit } from 'utils/time';
import { formatKgValue } from 'utils/units';

import moment from 'moment';
import { XAxis, CartesianGrid, ResponsiveContainer, YAxis, AreaChart, Area, Label } from 'recharts';

type RealtimeFootprintChartProps = {
  timeseries?: CarbonFootprintInfo['timeseries'];
  timeUnit: TimeUnit;
};

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

type XAxisTickProps = {
  x: number;
  y: number;
  payload: {
    index: number;
    value: number;
  };
  tickFormatter: (x: number, index: number) => string;
};
function CustomXAxisTick(props: XAxisTickProps) {
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
    <g transform={`translate(${x},${y})`}>
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

function RealtimeFootprintChart(props: RealtimeFootprintChartProps): JSX.Element {
  const { timeseries, timeUnit } = props;

  const data = useMemo(() => {
    if (!timeseries) return [];
    // Poor man's zip
    return timeseries.x.map((x, i) => ({
      x,
      y: timeseries.y[i],
    }));
  }, [timeseries]);

  const timeFormatter = useMemo(() => getTimeFormatter(timeUnit), [timeUnit]);

  const tickIndexLUTRef = useRef<Record<number, number>>({});

  const xTickFormatter = useCallback(
    (x: number) => {
      const timeseriesIndex = tickIndexLUTRef.current[x];
      const y = timeseries?.y[timeseriesIndex] ?? 0;
      return `${timeFormatter(x)}\n${y}`;
    },
    [timeFormatter, timeseries],
  );

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

    tickIndexLUTRef.current = {
      [startTimestamp]: 0,
      [endTimestamp]: xValues.length - 1,
    };

    return {
      xAxisTicks: [
        startTimestamp,
        ...new Array(Math.max(0, nTicks - 2)).fill(0).map((_, i) => {
          const value = startTimestamp + (i + 1) * step;
          const index = findClosestValueIndex(xValues, value);
          tickIndexLUTRef.current[xValues[index]] = index;
          return xValues[index];
        }),
        endTimestamp,
      ],
      xAxisTickCount: nTicks,
      xAxisDomain: [startTimestamp, endTimestamp],
    };
  }, [boundingBox, data, timeFormatter]);

  console.log(xAxisTicks, xAxisDomain, timeseries);
  // console.log(tickIndexLUTRef.current)

  return (
    <div className="w-full h-full" ref={rootElementRef}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 8,
            right: 20,
            left: 0,
            bottom: 20,
          }}
        >
          {/* Add some cool-looking gradients */}
          <defs>
            <linearGradient id="emissions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4DC36F" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4DC36F" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray={`3 ${xAxisTickCount}`} />
          <XAxis
            dataKey="x"
            type="number"
            interval={0}
            domain={xAxisDomain}
            ticks={xAxisTicks}
            tickCount={xAxisTickCount}
            tick={CustomXAxisTick}
            tickFormatter={xTickFormatter}
          />
          <YAxis tick={V2GYAxisTick}>
            <Label
              value="Emitted CO₂ (kg)"
              position="center"
              dx={-15}
              angle={90}
              style={{
                fontFamily: 'Roboto',
                fontWeight: 800,
              }}
            />
          </YAxis>
          <Area type="monotone" dataKey="y" stroke="#4DC36F" fill="url(#emissions)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RealtimeFootprintChart;

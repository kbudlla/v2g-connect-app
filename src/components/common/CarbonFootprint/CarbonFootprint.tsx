import { useCallback, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';

import { useCarbonFootprint } from 'api/sustainability';

import { Select, Space, Spin, Typography } from 'antd';

import Card from 'components/common/Card/Card';

import { getCo2Statistics } from 'utils/carbon';
import { TimeUnit, defaultRangeForTimeUnit } from 'utils/time';
import { halfSpace } from 'utils/units';

import SustainabilityInfo from './components/SustainabilityInfo';

import { green } from '@ant-design/colors';

/* Static configuration for the Plot */

const plotConfig: Partial<Plotly.Config> = {
  displaylogo: false,
  displayModeBar: false,
  responsive: true,
};

const plotLayout: Partial<Plotly.Layout> = {
  showlegend: false,
  autosize: true,
};

type StatisticsBadgeProps = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  value: number;
  text: string;
};
function StatisticsBadge(props: StatisticsBadgeProps): JSX.Element {
  const Icon = props.icon;
  return (
    <div className="statistics-badge-root">
      <Icon width={32} height={32} color={green[7]} />
      <Typography.Text type="success">
        <span style={{ fontWeight: 600, marginRight: '0.25em' }}>{props.value.toFixed(0)}</span>
        {props.text}
      </Typography.Text>
    </div>
  );
}

type CarbonFootprintProps = {
  fullwidth?: boolean;
  style?: React.CSSProperties;
};

function CarbonFootprint(props: CarbonFootprintProps): JSX.Element {
  const [userId, _] = useState('userId');
  const [timeRange, setTimeRange] = useState(defaultRangeForTimeUnit({ unit: 'months' }));

  const { footprint, loading } = useCarbonFootprint(userId, timeRange);

  const handleTimeUnitChange = useCallback((unit: TimeUnit) => {
    setTimeRange(defaultRangeForTimeUnit({ unit }));
  }, []);

  const plotData = useMemo(
    (): Partial<Plotly.PlotData>[] => [
      {
        type: 'bar',
        x: footprint?.timeseries.x ?? [],
        y: footprint?.timeseries.y ?? [],
        marker: {
          color: '#4DC36F',
        },
      },
    ],
    [footprint],
  );

  return (
    <Card
      header={
        <div className="carbon-footprint-header">
          <Typography.Title
            level={2}
            type="success"
            style={{
              margin: 0,
              fontSize: '26px',
              lineHeight: '36px',
              letterSpacing: '-0.2px',
            }}
          >
            Real-Time Carbon Footprint
          </Typography.Title>

          <SustainabilityInfo averageCO2={footprint?.average} loading={loading} timeUnit={timeRange.unit} />
        </div>
      }
      fullwidth={props.fullwidth}
      style={props.style}
    >
      {/* Drop-down to select Time-range*/}
      <Space wrap style={{ justifyContent: 'flex-end' }}>
        <Select
          defaultValue={timeRange.unit}
          style={{ width: 120 }}
          onChange={handleTimeUnitChange}
          options={[
            { value: 'minutes', label: 'Current Day (Minutes)' },
            { value: 'hours', label: 'Current Day (Hourly)' },
            { value: 'days', label: 'Current Month (Daily)' },
            { value: 'weeks', label: 'Current Month (Weekly)' },
            { value: 'months', label: 'Current Year' },
          ]}
        />
      </Space>

      {/* Plot */}
      <div className="carbon-footprint-plot-wrapper">
        {loading && <Spin style={{ margin: 'auto' }} />}
        {!loading && <Plot data={plotData} layout={plotLayout} config={plotConfig} className="carbon-footprint-plot" />}
      </div>

      {/* Statistics */}
      {!loading && (
        <div className="carbon-footprint-statistics-wrapper">
          <Typography.Title
            level={4}
            style={{
              color: '#5F6D7E',
              letterSpacing: '-0.02px',
              fontWeight: 600,
              textAlign: 'center',
              margin: '8px 0',
            }}
          >
            {`${footprint?.average.toFixed(0)}${halfSpace}Kg is equivalent to:`}
          </Typography.Title>
          <div className="carbon-footprint-statistics-wrapper-inner">
            {!loading &&
              footprint &&
              getCo2Statistics(footprint.average).map(({ icon, value, text, type }) => (
                <StatisticsBadge icon={icon} value={value} text={text} key={type} />
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default CarbonFootprint;

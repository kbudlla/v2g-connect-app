import { useState } from 'react';
import Plot from 'react-plotly.js';

import { useCarbonFootprint } from 'api/sustainability';

import { Spin, Typography } from 'antd';

import Card from 'components/common/Card/Card';

import { leftPad } from 'utils/formatting';
import { defaultRangeForTimeUnit } from 'utils/time';
import { halfSpace } from 'utils/units';

import { ReactComponent as CarIcon } from 'assets/icons/CarIcon.svg';
import { ReactComponent as TreeIcon } from 'assets/icons/TreeIcon.svg';

/* Mockdata for the Plot */
const plotData: Plotly.Data[] = [
  {
    type: 'bar',
    x: new Array(12).fill(0).map((_, i) => `2023-${leftPad(i, 2, 0)}-01 12:00:00`),
    y: new Array(12).fill(0).map(() => Math.floor(Math.random() * 200 + 100)),
    marker: {
      color: '#4DC36F',
    },
  },
];

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
  icon: JSX.Element;
  value: number;
  text: string;
};
function StatisticsBadge(props: StatisticsBadgeProps): JSX.Element {
  return (
    <div className="statistics-badge-root">
      {props.icon}
      <Typography.Text type="success">
        <span style={{ fontWeight: 600, marginRight: '0.25em' }}>{props.value}</span>
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

          <Typography.Title
            level={2}
            style={{
              margin: 0,
              fontSize: '26px',
              lineHeight: '36px',
              letterSpacing: '-0.2px',
              fontWeight: 400,
            }}
          >
            <span style={{ fontWeight: 800, marginRight: '0.5em' }}>
              {loading && 'Loading...'}
              {!loading && `${footprint?.average.toFixed(0)}${halfSpace}Kg`}
            </span>
            {!loading && <span style={{ fontSize: '20px', marginRight: '0.5em' }}>Sustainable Lifestyle</span>}
          </Typography.Title>
        </div>
      }
      fullwidth={props.fullwidth}
      style={props.style}
    >
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
            <StatisticsBadge icon={<TreeIcon />} value={5} text="trees cut down" />
            <StatisticsBadge icon={<CarIcon />} value={1000} text="mile drive" />
          </div>
        </div>
      )}
    </Card>
  );
}

export default CarbonFootprint;

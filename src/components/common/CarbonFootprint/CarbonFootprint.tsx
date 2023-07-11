import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCarbonFootprint } from 'api/sustainability';

import { Select, Space, Typography } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';

import { useTranslatedCO2Statistics } from 'utils/carbon';
import { TimeUnit, defaultRangeForTimeUnit } from 'utils/time';
import { halfSpace } from 'utils/units';

import RealtimeFootprintChart from './components/RealtimeFootprintChart';
import SustainabilityInfo from './components/SustainabilityInfo';

import { green } from '@ant-design/colors';

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

// eslint-disable-next-line @typescript-eslint/ban-types
type CarbonFootprintProps = {};

function CarbonFootprint(props: ForwardedCardProps<CarbonFootprintProps>): JSX.Element {
  const { t } = useTranslation('common');
  const getTranslatedCO2Statistics = useTranslatedCO2Statistics();

  const [userId] = useState('userId');
  const [timeRange, setTimeRange] = useState(defaultRangeForTimeUnit({ unit: 'months' }));

  const { footprint, loading } = useCarbonFootprint(userId, timeRange);

  const handleTimeUnitChange = useCallback((unit: TimeUnit) => {
    setTimeRange(defaultRangeForTimeUnit({ unit }));
  }, []);

  return (
    <Card
      header={
        <div className="flex flex-row justify-between flex-wrap gap-4">
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
            {t('realtimeCarbonFootprint')}
          </Typography.Title>

          <SustainabilityInfo averageCO2={footprint?.average} loading={loading} timeUnit={timeRange.unit} />
        </div>
      }
      loading={loading}
      {...props}
    >
      {/* Drop-down to select Time-range*/}
      <Space wrap style={{ justifyContent: 'flex-end' }}>
        <Select
          defaultValue={timeRange.unit}
          style={{ width: 120 }}
          onChange={handleTimeUnitChange}
          options={[
            // { value: 'minutes', label: 'Current Day (Minutes)' },
            // { value: 'hours', label: t('currentDay') },
            { value: 'days', label: t('currentWeek') },
            // { value: 'weeks', label: t('currentMonth') },
            { value: 'months', label: t('currentYear') },
          ]}
        />
      </Space>

      {/* Plot */}
      <div className="carbon-footprint-plot-wrapper">
        <RealtimeFootprintChart timeseries={footprint?.timeseries} timeUnit={timeRange.unit} />
      </div>

      {/* Statistics */}
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
          {footprint &&
            getTranslatedCO2Statistics(footprint.average).map(({ icon, value, text, type }) => (
              <StatisticsBadge icon={icon} value={value} text={text} key={type} />
            ))}
        </div>
      </div>
    </Card>
  );
}

export default CarbonFootprint;

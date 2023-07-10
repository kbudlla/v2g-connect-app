import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { EnergyUsageInfo } from 'api/energy';

import { Select, Space, Spin, Typography } from 'antd';

import Card from 'components/common/Card/Card';

import { TimeRange, TimeUnit } from 'utils/time';

import EnergyGraph from './components/EnergyGraph';

type EnergyGraphCardProps = {
  fullwidth?: boolean;
  style?: React.CSSProperties;

  loading?: boolean;
  energyUsageInfo: EnergyUsageInfo | null;

  timeRange: TimeRange;
  onTimeRangeChange?: (unit: TimeUnit) => void;
};

function EnergyGraphCard(props: EnergyGraphCardProps): JSX.Element {
  const { energyUsageInfo, loading, onTimeRangeChange, timeRange } = props;
  const { t } = useTranslation('common');

  const handleTimeUnitChange = useCallback((unit: TimeUnit) => {
    onTimeRangeChange?.(unit);
  }, []);

  return (
    <Card
      header={
        <div className="energy-graph-card-header">
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
            {t('energyGraphTitle')}
          </Typography.Title>

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
        </div>
      }
      fullwidth={props.fullwidth}
      style={props.style}
    >
      {/* Plot */}
      <div className="energy-graph-card-plot-wrapper">
        {loading && <Spin style={{ margin: 'auto' }} />}
        {!loading && <EnergyGraph timeseries={energyUsageInfo?.timeseries} timeUnit={timeRange.unit} />}
      </div>
    </Card>
  );
}

export default EnergyGraphCard;

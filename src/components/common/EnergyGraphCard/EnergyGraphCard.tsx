import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { EnergyUsageInfo } from 'api/energy';

import { Select, Space } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';

import { TimeRange, TimeUnit } from 'utils/time';

import CardHeader from '../Card/CardHeader';
import EnergyGraph from './components/EnergyGraph';

type EnergyGraphCardProps = {
  energyUsageInfo: EnergyUsageInfo | null;

  timeRange: TimeRange;
  onTimeRangeChange?: (unit: TimeUnit) => void;
};

function EnergyGraphCard(props: ForwardedCardProps<EnergyGraphCardProps>): JSX.Element {
  const { energyUsageInfo, onTimeRangeChange, timeRange } = props;
  const { t } = useTranslation('common');

  const handleTimeUnitChange = useCallback(
    (unit: TimeUnit) => {
      onTimeRangeChange?.(unit);
    },
    [onTimeRangeChange],
  );

  return (
    <Card
      header={
        <CardHeader title={t('energyGraphTitle')}>
          {/* Drop-down to select Time-range*/}
          <Space wrap style={{ justifyContent: 'flex-end' }}>
            <Select
              defaultValue={timeRange.unit}
              className="block"
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
        </CardHeader>
      }
      fixedheight
      {...props}
    >
      <EnergyGraph timeseries={energyUsageInfo?.timeseries} timeUnit={timeRange.unit} />
    </Card>
  );
}

export default EnergyGraphCard;

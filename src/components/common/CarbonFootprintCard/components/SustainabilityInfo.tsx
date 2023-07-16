import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import UnitWithTime from 'components/common/UnitWithTime/UnitWithTime';

import { SustainabilityScore, getSustainabilityScore } from 'utils/carbon';
import { TimeUnit } from 'utils/time';
import { formatKgValueWithUnit } from 'utils/units';

const useSustainablitityPercentileMessageMap = () => {
  const { t } = useTranslation('common');
  const map: Record<SustainabilityScore['percentile'], string> = {
    10: t('sustainableLifestyle'),
    20: t('sustainableLifestyle'),
    30: t('sustainableLifestyle'),
    40: t('averageLifestyle'),
    50: t('averageLifestyle'),
    60: t('averageLifestyle'),
    70: t('highEmissionLifestyle'),
    80: t('highEmissionLifestyle'),
    90: t('extremelyHighEmissionLifestyle'),
    100: t('extremelyHighEmissionLifestyle'),
  };
  return map;
};

type SustainabilityInfoProps = {
  loading: boolean;
  averageCO2?: number;
  timeUnit: TimeUnit;
};

function SustainabilityInfo(props: SustainabilityInfoProps): JSX.Element {
  const { loading, averageCO2, timeUnit } = props;

  const percentileMessageMap = useSustainablitityPercentileMessageMap();

  const sustainabilityScore = useMemo(() => {
    if (loading || averageCO2 == null) return null;
    const score = getSustainabilityScore(averageCO2, timeUnit);
    const formattedAverageCO2 = formatKgValueWithUnit(averageCO2);
    return {
      ...score,
      humanReadableCO2: {
        value: `Average: ${formattedAverageCO2.value}`,
        unit: formattedAverageCO2.unit,
      },
    };
  }, [averageCO2, loading, timeUnit]);

  return (
    <Typography.Title
      level={3}
      style={{
        // TODO! We could also do some cool red to green interpolation here
        color: sustainabilityScore?.ideal ? '#237804' : '#000',
      }}
      className="h-min flex flex-wrap gap-4"
    >
      {/* Average + Unit */}
      <span className="flex">
        <span style={{ fontWeight: 800 }} className="my-auto mr-1 whitespace-nowrap">
          {loading && 'Loading...'}
          {!loading && sustainabilityScore?.humanReadableCO2.value}
        </span>
        {!loading && (
          <UnitWithTime
            unit={sustainabilityScore?.humanReadableCO2.unit ?? ''}
            timeUnit={timeUnit}
            className="my-auto whitespace-nowrap"
          />
        )}
      </span>

      {/* Score */}
      {!loading && (
        <span style={{ fontSize: '20px' }} className="my-auto">
          {/* Typescript is stupid, the nc should not be needed here */}
          {percentileMessageMap[sustainabilityScore?.percentile ?? 10]}
        </span>
      )}
    </Typography.Title>
  );
}

export default SustainabilityInfo;

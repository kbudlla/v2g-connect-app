import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import { SustainabilityScore, getSustainabilityScore } from 'utils/carbon';
import { TimeUnit } from 'utils/time';
import { formatKgValue } from 'utils/units';

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
    return {
      ...score,
      humanReadableCO2: formatKgValue(averageCO2),
    };
  }, [averageCO2, loading, timeUnit]);

  return (
    <Typography.Title
      level={2}
      style={{
        margin: 0,
        fontSize: '26px',
        lineHeight: '36px',
        letterSpacing: '-0.2px',
        fontWeight: 400,
        // TODO! We could also do some cool red to green interpolation here
        color: sustainabilityScore?.ideal ? '#237804' : '#000',
      }}
    >
      <span style={{ fontWeight: 800, marginRight: '0.5em' }}>
        {loading && 'Loading...'}
        {!loading && sustainabilityScore?.humanReadableCO2}
      </span>
      {!loading && (
        <span style={{ fontSize: '20px', marginRight: '0.5em' }}>
          {/* Typescript is stupid, the nc should not be needed here */}
          {percentileMessageMap[sustainabilityScore?.percentile ?? 10]}
        </span>
      )}
    </Typography.Title>
  );
}

export default SustainabilityInfo;

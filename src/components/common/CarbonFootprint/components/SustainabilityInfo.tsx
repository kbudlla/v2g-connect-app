import { useMemo } from 'react';

import { Typography } from 'antd';

import { SustainabilityScore, getSustainabilityScore } from 'utils/carbon';
import { TimeUnit } from 'utils/time';
import { formatKgValue } from 'utils/units';

const SustainabilityPercentileMessageMap: Record<SustainabilityScore['percentile'], string> = {
  10: 'Sustainable Lifestyle',
  20: 'Sustainable Lifestyle',
  30: 'Sustainable Lifestyle',
  40: 'Average Lifestyle',
  50: 'Average Lifestyle',
  60: 'Average Lifestyle',
  70: 'High emission Lifestyle',
  80: 'High emission Lifestyle',
  90: 'Extremely high emission Lifestyle',
  100: 'Extremely high emission Lifestyle',
};

// Much cooler, but Typescript is iffy
// type SustainabilityInfoPropsLoading = {
//     loading: true;
//     averageCO2: undefined
//     timeUnit: TimeUnit
// }

// type SustainabilityInfoPropsNotLoading = {
//     loading: false;
//     averageCO2: number
//     timeUnit: TimeUnit
// }

type SustainabilityInfoProps = {
  loading: boolean;
  averageCO2?: number;
  timeUnit: TimeUnit;
};

function SustainabilityInfo(props: SustainabilityInfoProps): JSX.Element {
  const { loading, averageCO2, timeUnit } = props;

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
          {SustainabilityPercentileMessageMap[sustainabilityScore?.percentile ?? 10]}
        </span>
      )}
    </Typography.Title>
  );
}

export default SustainabilityInfo;

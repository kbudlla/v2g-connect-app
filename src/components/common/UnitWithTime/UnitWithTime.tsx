import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Divider } from 'antd';

import { TimeUnit } from 'utils/time';

const useTranslatedTimeUnit = (unit: TimeUnit) => {
  const { t } = useTranslation('common');
  const translatedUnit = useMemo(
    () =>
      ({
        minutes: t('minutes'),
        hours: t('hours'),
        days: t('days'),
        weeks: t('weeks'),
        months: t('months'),
      }[unit]),
    [t],
  );

  return translatedUnit;
};

type UnitWithTimeProps = {
  unit: string;
  timeUnit: TimeUnit;
};

function UnitWithTime(props: UnitWithTimeProps): JSX.Element {
  const timeUnit = useTranslatedTimeUnit(props.timeUnit);

  return (
    // TODO! class
    <span style={{ display: 'flex', flexDirection: 'column' }}>
      <span>{props.unit}</span>
      <Divider />
      <span>{timeUnit}</span>
    </span>
  );
}

export default UnitWithTime;

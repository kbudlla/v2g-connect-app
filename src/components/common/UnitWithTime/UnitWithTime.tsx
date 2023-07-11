import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
    <span
      className="inline-flex flex-col max-h-full h-full"
      style={{
        verticalAlign: 'top',
        marginLeft: '0.25em',
      }}
    >
      <span style={{ fontSize: '0.6em', lineHeight: 1.2, textAlign: 'center' }}>{props.unit}</span>
      <span style={{ margin: '0.1em auto', height: '1px', width: '90%', backgroundColor: 'rgba(0, 0, 0, 40%)' }} />
      <span style={{ fontSize: '0.6em', lineHeight: 1.2, textAlign: 'center' }}>{timeUnit}</span>
    </span>
  );
}

export default UnitWithTime;
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';
import CardHeader from 'components/common/Card/CardHeader';

import { EnergyMix, getCO2Emissions } from 'utils/energyMix';
import { formatKgValue } from 'utils/units';

import { ReactComponent as CO2Icon } from 'assets/icons/material/molecule-co2.svg';

type CO2OverviewCardProps = {
  userMix?: EnergyMix;
  gridMix?: EnergyMix;
  amountKWh?: number;
};

function CO2OverviewCard(props: ForwardedCardProps<CO2OverviewCardProps>): JSX.Element {
  const { userMix, gridMix, amountKWh } = props;
  const { t } = useTranslation('common');

  const co2Saved = useMemo(() => {
    if (!amountKWh || !gridMix || !userMix) return '';
    const co2SavedKg = getCO2Emissions(gridMix, amountKWh) - getCO2Emissions(userMix, amountKWh);
    return formatKgValue(co2SavedKg);
  }, [userMix, gridMix, amountKWh]);

  return (
    <Card header={<CardHeader title={t('co2SavedTitle')} icon={CO2Icon} />} {...props}>
      <Typography.Title
        style={{
          color: '#0D1C2E',
          textAlign: 'center',
          fontFamily: 'Inter',
          fontSize: '36px',
          fontWeight: 600,
          letterSpacing: '-0.036px',
          margin: '0 0 0 0',
        }}
      >
        {co2Saved}
      </Typography.Title>
    </Card>
  );
}

export default CO2OverviewCard;

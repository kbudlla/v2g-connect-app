import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';
import CardHeader from 'components/common/Card/CardHeader';

import { formatKWhValue } from 'utils/units';

import { ReactComponent as BatteryChargingIcon } from 'assets/icons/material/battery-charging-60.svg';

type EnergyChargedCardProps = {
  amountKWh?: number;
};

function EnergyChargedCard(props: ForwardedCardProps<EnergyChargedCardProps>): JSX.Element {
  const { amountKWh } = props;
  const { t } = useTranslation('common');

  return (
    <Card header={<CardHeader title={t('energyChargedCardTitle')} icon={BatteryChargingIcon} />} {...props}>
      <Typography.Title
        className="m-0"
        style={{
          color: '#0D1C2E',
          textAlign: 'center',
          fontFamily: 'Inter',
          fontSize: '36px',
          fontWeight: 600,
          letterSpacing: '-0.036px',
        }}
      >
        {formatKWhValue(amountKWh)}
      </Typography.Title>
    </Card>
  );
}

export default EnergyChargedCard;

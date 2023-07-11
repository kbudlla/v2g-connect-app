import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';
import RoundedIconContainer from 'components/common/RoundedIconContainer/RoundedIconContainer';

import { EnergyMix, getCO2Emissions } from 'utils/energyMix';
import { formatKgValue } from 'utils/units';

import { ReactComponent as LightningIcon } from 'assets/icons/lightningIcon.svg';

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
    <Card
      header={
        <div className="co2-overview-card-header">
          <RoundedIconContainer Icon={LightningIcon} size={24} color="#52c41a" backgroundColor="#EDFFEF" />
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
            {t('co2SavedTitle')}
          </Typography.Title>
        </div>
      }
      {...props}
    >
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

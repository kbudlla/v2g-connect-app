import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';

import { EnergyMix } from 'utils/energyMix';

import EnergyMixChart from '../EnergyMixChart/EnergyMixChart';

type EnergyMixCardProps = {
  loading?: boolean;
  userMix?: EnergyMix;
  gridMix?: EnergyMix;
  simple?: boolean;
};

function EnergyMixCard(props: ForwardedCardProps<EnergyMixCardProps>): JSX.Element {
  const { userMix, gridMix, simple } = props;
  const { t } = useTranslation('common');

  return (
    <Card
      header={
        <div className="energy-mix-card-header">
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
            {t('energyMixTitle')}
          </Typography.Title>
        </div>
      }
      {...props}
    >
      <div className="energy-mix-card-chart-wrapper">
        <EnergyMixChart simple={simple} energyMix={userMix} title="User energy mix" />
        <EnergyMixChart simple={simple} energyMix={gridMix} title="Average grid energy mix" />
      </div>
    </Card>
  );
}

export default EnergyMixCard;

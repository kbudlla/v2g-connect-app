import { useTranslation } from 'react-i18next';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';

import { EnergyMix } from 'utils/energyMix';

import CardHeader from '../Card/CardHeader';
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
    <Card header={<CardHeader title={t('energyMixTitle')} />} fixedheight {...props}>
      <div className="energy-mix-card-chart-wrapper">
        <EnergyMixChart simple={simple} energyMix={userMix} title="User energy mix" />
        <EnergyMixChart simple={simple} energyMix={gridMix} title="Average grid energy mix" />
      </div>
    </Card>
  );
}

export default EnergyMixCard;

import { useTranslation } from 'react-i18next';

import { Spin, Typography } from 'antd';

import Card from 'components/common/Card/Card';

import { EnergyMix } from 'utils/energyMix';

import EnergyMixChart from '../EnergyMixChart/EnergyMixChart';

type EnergyMixCardProps = {
  loading?: boolean;
  userMix?: EnergyMix;
  gridMix?: EnergyMix;
  simple?: boolean;

  style?: React.CSSProperties;
};

function EnergyMixCard(props: EnergyMixCardProps): JSX.Element {
  const { loading, userMix, gridMix, simple } = props;
  const { t } = useTranslation('common');

  return (
    <Card
      header={
        <div className="energy-graph-card-header">
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
      style={props.style}
    >
      {loading && <Spin style={{ margin: 'auto' }} />}
      {!loading && <EnergyMixChart simple={simple} energyMix={userMix} title="User energy mix" />}
      {!loading && <EnergyMixChart simple={simple} energyMix={gridMix} title="Average grid energy mix" />}
    </Card>
  );
}

export default EnergyMixCard;

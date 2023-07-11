import { useTranslation } from 'react-i18next';

import { Spin, Typography } from 'antd';

import Card from 'components/common/Card/Card';
import RoundedIconContainer from 'components/common/RoundedIconContainer/RoundedIconContainer';

import { formatKWhValue } from 'utils/units';

import { ReactComponent as LightningIcon } from 'assets/icons/lightningIcon.svg';

type EnergyChargedCardProps = {
  loading?: boolean;
  amountKWh?: number;

  style?: React.CSSProperties;
};

function EnergyChargedCard(props: EnergyChargedCardProps): JSX.Element {
  const { loading, amountKWh } = props;
  const { t } = useTranslation('common');

  return (
    <Card
      header={
        <div className="energy-charged-card-header">
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
            {t('energyChargedCardTitle')}
          </Typography.Title>
        </div>
      }
      style={props.style}
    >
      {loading && <Spin style={{ margin: 'auto' }} />}
      {!loading && (
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
          {formatKWhValue(amountKWh ?? 0)}
        </Typography.Title>
      )}
    </Card>
  );
}

export default EnergyChargedCard;

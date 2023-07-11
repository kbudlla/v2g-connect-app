import { useTranslation } from 'react-i18next';

import { Spin, Typography } from 'antd';

import Card from 'components/common/Card/Card';
import RoundedIconContainer from 'components/common/RoundedIconContainer/RoundedIconContainer';

import { formatKWhValue } from 'utils/units';

import { ReactComponent as LightningIcon } from 'assets/icons/lightningIcon.svg';

type EnergySoldCardProps = {
  loading?: boolean;
  amount?: number;

  style?: React.CSSProperties;
};

function EnergySoldCard(props: EnergySoldCardProps): JSX.Element {
  const { loading, amount } = props;
  const { t } = useTranslation('common');

  return (
    <Card
      header={
        <div className="energy-sold-card-header">
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
            {t('energySoldTitle')}
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
          {formatKWhValue(amount ?? 0)}
        </Typography.Title>
      )}
    </Card>
  );
}

export default EnergySoldCard;

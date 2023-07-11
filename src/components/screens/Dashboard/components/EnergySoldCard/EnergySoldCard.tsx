import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';
import RoundedIconContainer from 'components/common/RoundedIconContainer/RoundedIconContainer';

import { formatKWhValue } from 'utils/units';

import { ReactComponent as LightningIcon } from 'assets/icons/material/lightning-bolt.svg';

type EnergySoldCardProps = {
  amount?: number;
};

function EnergySoldCard(props: ForwardedCardProps<EnergySoldCardProps>): JSX.Element {
  const { amount } = props;
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
        {formatKWhValue(amount)}
      </Typography.Title>
    </Card>
  );
}

export default EnergySoldCard;

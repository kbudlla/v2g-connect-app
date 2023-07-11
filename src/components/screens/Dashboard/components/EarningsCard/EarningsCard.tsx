import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Spin, Typography } from 'antd';

import Card from 'components/common/Card/Card';
import RoundedIconContainer from 'components/common/RoundedIconContainer/RoundedIconContainer';

import { ChargingReceipt } from 'utils/simulation';
import { halfSpace } from 'utils/units';

import { ReactComponent as EarningsIcon } from 'assets/icons/earningsIcon.svg';

type EarningsCardProps = {
  loading?: boolean;
  receipts?: ChargingReceipt[];

  style?: React.CSSProperties;
};

function EarningsCard(props: EarningsCardProps): JSX.Element {
  const { loading, receipts } = props;
  const { t } = useTranslation('common');

  const earnings = useMemo(() => {
    const total = receipts ? receipts.reduce((total, r) => total + r.earnings, 0) : 0;
    return `${total.toFixed(2)}${halfSpace}€`;
  }, [receipts]);

  return (
    <Card
      header={
        <div className="energy-sold-card-header">
          <RoundedIconContainer Icon={EarningsIcon} size={24} color="#52c41a" backgroundColor="#EDFFEF" />
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
            {t('earningsTitle')}
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
          {earnings}
        </Typography.Title>
      )}
    </Card>
  );
}

export default EarningsCard;

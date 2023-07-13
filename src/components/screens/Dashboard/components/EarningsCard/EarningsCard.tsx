import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';
import CardHeader from 'components/common/Card/CardHeader';

import { ChargingReceipt } from 'utils/simulation';
import { halfSpace } from 'utils/units';

import { ReactComponent as MoneyIcon } from 'assets/icons/material/currency-usd.svg';

type EarningsCardProps = {
  receipts?: ChargingReceipt[];
};

function EarningsCard(props: ForwardedCardProps<EarningsCardProps>): JSX.Element {
  const { receipts } = props;
  const { t } = useTranslation('common');

  const earnings = useMemo(() => {
    const total = receipts ? receipts.reduce((total, r) => total + r.earnings, 0) : 0;
    return `${total.toFixed(2)}${halfSpace}€`;
  }, [receipts]);

  return (
    <Card header={<CardHeader title={t('earningsTitle')} icon={MoneyIcon} />} {...props}>
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
        {earnings}
      </Typography.Title>
    </Card>
  );
}

export default EarningsCard;

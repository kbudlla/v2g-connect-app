import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import Card, { ForwardedCardProps } from 'components/common/Card/Card';
import CardHeader from 'components/common/Card/CardHeader';

import { ReactComponent as EcoCoinIcon } from 'assets/icons/material/leaf-circle-outline.svg';

type PointBalanceCardProps = {
  balance: number;
};

function PointBalanceCard(props: ForwardedCardProps<PointBalanceCardProps>): JSX.Element {
  const { balance } = props;
  const { t } = useTranslation('common');

  return (
    <Card header={<CardHeader title={t('rewardsPointsCardTitle')} />} {...props}>
      <div className="flex-1 flex flex-col justify-center">
        <Typography.Title
          style={{
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '4rem',
            fontWeight: 600,
            letterSpacing: '-0.036px',
            margin: '0 0 0 0',
          }}
          className="flex justify-center"
        >
          <EcoCoinIcon className="inline-block w-16 h-16 mr-2 my-auto" />
          <span className="my-auto">{balance}</span>
        </Typography.Title>
      </div>
    </Card>
  );
}

export default PointBalanceCard;

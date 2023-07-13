import { useTranslation } from 'react-i18next';

import { Col, Row } from 'antd';

import ChallengesCard from 'components/common/ChallengesCard/ChallengesCard';
import OffersCard from 'components/common/OffersCard/OffersCard';
import PageWrapper from 'components/common/PageWrapper/PageWrapper';

import PointBalanceCard from './components/PointBalanceCard/PointBalanceCard';

function RewardsScreen(): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <PageWrapper showBreadcrumbs>
      <Row gutter={[32, 32]}>
        <Col span={24} md={12}>
          <PointBalanceCard fullheight balance={420} />
        </Col>
        <Col span={24} md={12}>
          <ChallengesCard simple title={t('rewardsOpenChallengesCardsTitle')} />
        </Col>
      </Row>
      <Row gutter={[32, 32]}>
        <Col span={24}>
          <OffersCard />
        </Col>
      </Row>
    </PageWrapper>
  );
}

export default RewardsScreen;

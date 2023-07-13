import { useTranslation } from 'react-i18next';

import { Col, Row } from 'antd';

import CarbonFootprintCard from 'components/common/CarbonFootprintCard/CarbonFootprintCard';
import ChallengesCard from 'components/common/ChallengesCard/ChallengesCard';
import LeaderboardCard from 'components/common/LeaderboardCard/LeaderboardCard';
import PageWrapper from 'components/common/PageWrapper/PageWrapper';

function SustainabilityTracker(): JSX.Element {
  const { t } = useTranslation('common');

  return (
    <PageWrapper showBreadcrumbs>
      <Row gutter={[32, 32]} className="flex-1">
        <Col span={24}>
          <CarbonFootprintCard fullheight fullwidth />
        </Col>
      </Row>
      <Row gutter={[32, 32]} className="flex-1">
        <Col span={24} lg={12}>
          <LeaderboardCard fullheight />
        </Col>
        <Col span={24} lg={12}>
          <ChallengesCard title={t('challenges')} fullheight />
        </Col>
      </Row>
    </PageWrapper>
  );
}

export default SustainabilityTracker;

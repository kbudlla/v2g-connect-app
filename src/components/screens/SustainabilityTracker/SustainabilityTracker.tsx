import { Col, Row } from 'antd';

import CarbonFootprint from 'components/common/CarbonFootprint/CarbonFootprint';
import ChallengesCard from 'components/common/ChallengesCard/ChallengesCard';
import LeaderboardCard from 'components/common/LeaderboardCard/LeaderboardCard';
import PageWrapper from 'components/common/PageWrapper/PageWrapper';

function SustainabilityTracker(): JSX.Element {
  return (
    <PageWrapper showBreadcrumbs>
      <Row gutter={[32, 32]} className="flex-1">
        <Col span={24}>
          <CarbonFootprint fullheight fullwidth />
        </Col>
      </Row>
      <Row gutter={[32, 32]} className="flex-1">
        <Col span={24} lg={12}>
          <LeaderboardCard fullheight />
        </Col>
        <Col span={24} lg={12}>
          <ChallengesCard fullheight />
        </Col>
      </Row>
    </PageWrapper>
  );
}

export default SustainabilityTracker;

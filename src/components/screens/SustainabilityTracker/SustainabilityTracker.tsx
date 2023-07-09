import { Col, Row } from 'antd';

import CarbonFootprint from 'components/common/CarbonFootprint/CarbonFootprint';
import Challenges from 'components/common/Challenges/Challenges';
import Leaderboard from 'components/common/Leaderboard/Leaderboard';
import PageWrapper from 'components/common/PageWrapper/PageWrapper';

function SustainabilityTracker(): JSX.Element {
  return (
    <PageWrapper showBreadcrumbs>
      <Row gutter={[32, 32]} style={{ height: '100%' }}>
        <Col span={24}>
          <CarbonFootprint fullwidth style={{ height: '100%' }} />
        </Col>
      </Row>
      <Row gutter={[32, 32]}>
        <Col span={12}>
          <Leaderboard style={{ flex: '1 1 0', height: '100%' }} />
        </Col>
        <Col span={12}>
          <Challenges style={{ flex: '1 1 0', height: '100%' }} />
        </Col>
      </Row>
    </PageWrapper>
  );
}

export default SustainabilityTracker;

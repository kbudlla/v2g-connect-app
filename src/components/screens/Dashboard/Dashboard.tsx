import React, { useCallback, useState } from 'react';

import { useEnergyUsage } from 'api/energy';

import { Col, Row } from 'antd';

import EnergyGraphCard from 'components/common/EnergyGraphCard/EnergyGraphCard';
import EnergyMixChart from 'components/common/EnergyMixChart/EnergyMixChart';
import Greeting from 'components/common/Greeting/Greeting';
import PageWrapper from 'components/common/PageWrapper/PageWrapper';

import { AveragePowerMix } from 'utils/energyMix';
import { TimeUnit, defaultRangeForTimeUnit } from 'utils/time';

const Dashboard = () => {
  const [userId] = useState('userId');
  const [timeRange, setTimeRange] = useState(defaultRangeForTimeUnit({ unit: 'months' }));

  const { energyUsageInfo, loading } = useEnergyUsage(userId, 0.6, timeRange);

  const handleTimeUnitChange = useCallback((unit: TimeUnit) => {
    setTimeRange(defaultRangeForTimeUnit({ unit }));
  }, []);

  return (
    <PageWrapper showBreadcrumbs>
      <Greeting />
      <Row gutter={[32, 32]} style={{ height: '100%' }}>
        <Col span={24}>
          <EnergyGraphCard
            fullwidth
            style={{ height: '100%' }}
            loading={loading}
            energyUsageInfo={energyUsageInfo}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeUnitChange}
          />
        </Col>
      </Row>

      <Row gutter={[32, 32]} style={{ height: '100%' }}>
        <Col span={12}>
          {/* Energy Consumption Chart */}
          {/* Should also show the amount of renewable energy and the difference to the average */}
          {energyUsageInfo && <EnergyMixChart simple energyMix={energyUsageInfo.average.chargingMix} />}
          {/* Will not do Energy transfer thingie, for now, I'll have to think about it */}
        </Col>
        <Col span={12}>{energyUsageInfo && <EnergyMixChart simple energyMix={AveragePowerMix} />}</Col>
      </Row>

      {/* Messages/Alerts? */}
    </PageWrapper>
  );
};

export default Dashboard;

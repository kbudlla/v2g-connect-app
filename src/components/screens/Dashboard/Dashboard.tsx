import React, { useCallback, useMemo, useState } from 'react';

import { useEnergyUsage } from 'api/energy';

import { Col, Row } from 'antd';

import ChargingReceiptsCard from 'components/common/ChargingReceiptsCard/ChargingReceiptsCard';
import EnergyGraphCard from 'components/common/EnergyGraphCard/EnergyGraphCard';
import EnergyMixCard from 'components/common/EnergyMixCard/EnergyMixCard';
import Greeting from 'components/common/Greeting/Greeting';
import PageWrapper from 'components/common/PageWrapper/PageWrapper';

import { AveragePowerMix } from 'utils/energyMix';
import { TimeUnit, defaultRangeForTimeUnit } from 'utils/time';

import EarningsCard from './components/EarningsCard/EarningsCard';
import EnergyChargedCard from './components/EnergyChargedCard/EnergyChargedCard';
import EnergySoldCard from './components/EnergySoldCard/EnergySoldCard';

const Dashboard = () => {
  const [userId] = useState('userId');
  const [timeRange, setTimeRange] = useState(defaultRangeForTimeUnit({ unit: 'months' }));

  const { energyUsageInfo, loading } = useEnergyUsage(userId, 0.6, timeRange);

  const handleTimeUnitChange = useCallback((unit: TimeUnit) => {
    setTimeRange(defaultRangeForTimeUnit({ unit }));
  }, []);

  const amountChargedClean = useMemo(() => {
    if (!energyUsageInfo) return 0;
    return energyUsageInfo.total.chargedKWh - energyUsageInfo.total.dischargedKWh;
  }, [energyUsageInfo]);

  console.log(energyUsageInfo);

  return (
    <PageWrapper showBreadcrumbs>
      <Greeting />
      <Row gutter={[16, 32]} style={{ height: '100%' }}>
        <Col span={16}>
          <EnergyGraphCard
            fullwidth
            style={{ height: '100%' }}
            loading={loading}
            energyUsageInfo={energyUsageInfo}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeUnitChange}
          />
        </Col>
        <Col span={8}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <EnergySoldCard loading={loading} amount={energyUsageInfo?.total.dischargedKWh} />
            <EarningsCard loading={loading} receipts={energyUsageInfo?.receipts} />
            <EnergyChargedCard loading={loading} amountKWh={amountChargedClean} />
          </div>
        </Col>
      </Row>

      <Row gutter={[32, 32]} style={{ height: '100%' }}>
        <Col span={12}>
          <EnergyMixCard
            simple
            loading={loading}
            gridMix={AveragePowerMix}
            userMix={energyUsageInfo?.average.chargingMix}
            style={{ height: '100%' }}
          />
        </Col>
        <Col span={12}>
          <ChargingReceiptsCard
            loading={loading}
            limit={3}
            receipts={energyUsageInfo?.receipts}
            style={{ height: '100%' }}
          />
        </Col>
      </Row>

      {/* Messages/Alerts? */}
    </PageWrapper>
  );
};

export default Dashboard;

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

import CO2OverviewCard from './components/CO2OverviewCard/CO2OverviewCard';
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

  return (
    <PageWrapper showBreadcrumbs>
      <Greeting />
      <Row gutter={[16, 32]}>
        <Col span={24} xl={16} className="min-h-[32rem]">
          <EnergyGraphCard
            fullwidth
            fullheight
            loading={loading}
            energyUsageInfo={energyUsageInfo}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeUnitChange}
          />
        </Col>
        <Col span={24} xl={8}>
          <Row gutter={[16, 16]} className="h-full">
            <Col span={12} xl={24}>
              <EnergySoldCard fullheight loading={loading} amount={energyUsageInfo?.total.dischargedKWh} />
            </Col>
            <Col span={12} xl={24}>
              <EarningsCard fullheight loading={loading} receipts={energyUsageInfo?.receipts} />
            </Col>
            <Col span={12} xl={24}>
              <EnergyChargedCard fullheight loading={loading} amountKWh={amountChargedClean} />
            </Col>
            <Col span={12} xl={24}>
              <CO2OverviewCard
                fullheight
                loading={loading}
                amountKWh={amountChargedClean}
                userMix={energyUsageInfo?.average.chargingMix}
                gridMix={AveragePowerMix}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[32, 32]}>
        <Col sm={24} lg={12} className="h-[26rem]">
          <EnergyMixCard
            simple
            fullheight
            fullwidth
            loading={loading}
            gridMix={AveragePowerMix}
            userMix={energyUsageInfo?.average.chargingMix}
          />
        </Col>
        <Col sm={24} lg={12}>
          <ChargingReceiptsCard fullheight fullwidth loading={loading} limit={3} receipts={energyUsageInfo?.receipts} />
        </Col>
      </Row>

      {/* Messages/Alerts? */}
    </PageWrapper>
  );
};

export default Dashboard;

import { useMemo } from 'react';

import { Typography } from 'antd';

import clsx from 'clsx';

import { EnergyMix, EnergyProducerTypes, SimpleEnergyProducerTypes, energyMixToSimple } from 'utils/energyMix';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

type EnergyMixChartProps = {
  energyMix?: EnergyMix;
  simple?: boolean;
  title?: string;
  className?: string;
};

const Colors = ['#4DC36F', '#00B594', '#00A3B3', '#008EC3', '#0075BE', '#465AA5'];

function EnergyMixChart(props: EnergyMixChartProps): JSX.Element {
  const { energyMix, simple, title } = props;

  const data = useMemo(() => {
    if (!energyMix) return [];
    if (simple) {
      const mix = energyMixToSimple(energyMix);
      return SimpleEnergyProducerTypes.map((type) => ({
        val: mix[type],
        name: type,
      }));
    }
    return EnergyProducerTypes.map((type) => ({
      val: energyMix[type],
      name: type,
    }));
  }, [energyMix]);

  return (
    <div className={clsx('h-full max-h-full overflow-hidden flex flex-col', props.className)}>
      {title && (
        <Typography.Title level={5} style={{ margin: 0, fontFamily: 'Roboto' }}>
          {title}
        </Typography.Title>
      )}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart
            margin={{
              top: 20,
              right: 10,
              left: 10,
              bottom: 20,
            }}
          >
            <Pie data={data} cx="50%" cy="50%" innerRadius={25} outerRadius={60} fill="#8884d8" dataKey="val">
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={Colors[index % Colors.length]} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="left"
              verticalAlign="middle"
              margin={{
                top: 5,
                right: 0,
                left: 20,
                bottom: 20,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EnergyMixChart;

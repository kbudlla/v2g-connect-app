import { useMemo } from 'react';

import { Typography } from 'antd';

import { EnergyMix, EnergyProducerTypes, SimpleEnergyProducerTypes, energyMixToSimple } from 'utils/energyMix';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

type EnergyMixChartProps = {
  energyMix?: EnergyMix;
  simple?: boolean;
  title?: string;
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
    <>
      {title && (
        <Typography.Title level={5} style={{ margin: 0, fontFamily: 'Roboto' }}>
          {title}
        </Typography.Title>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={70} fill="#8884d8" dataKey="val">
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={Colors[index % Colors.length]} />
            ))}
          </Pie>
          <Legend layout="vertical" align="left" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

export default EnergyMixChart;

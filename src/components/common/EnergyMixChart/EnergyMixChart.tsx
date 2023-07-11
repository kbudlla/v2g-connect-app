import { useMemo } from 'react';

import { EnergyMix, EnergyProducerTypes, SimpleEnergyProducerTypes, energyMixToSimple } from 'utils/energyMix';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

type EnergyMixChartProps = {
  energyMix: EnergyMix;
  simple?: boolean;
};

const Colors = ['#4DC36F', '#00B594', '#00A3B3', '#008EC3', '#0075BE', '#465AA5'];

function EnergyMixChart(props: EnergyMixChartProps): JSX.Element {
  const { energyMix, simple } = props;

  const data = useMemo(() => {
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
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="val">
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={Colors[index % Colors.length]} />
          ))}
        </Pie>
        <Legend layout="vertical" align="left" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default EnergyMixChart;

import React from 'react';
import { VictoryPie, VictoryLabel } from 'victory';

const PercentageChart = ({ percentage }) => {
  const data = getData(percentage);

  return (
    <div>
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <VictoryPie
        standalone={false}
        width={200}
        height={200}
        data={data}
        innerRadius={60} // Adjusted to fit smaller size
        cornerRadius={20} // Adjusted to fit smaller size
        labels={() => null} // No labels on the pie chart slices
        style={{
          data: {
            fill: ({ datum }) => {
              const color = datum.y > 30 ? 'green' : 'brown';
              return datum.x === 1 ? color : 'transparent';
            },
          },
        }}
        animate={{
          duration: 5000, // Duration of the animation in milliseconds
          onExit: {
            duration: 2000,
          },
          onEnter: {
            duration: 5000,
            before: () => ({ opacity: 0, scale: 0 }), // Initial state
            after: (datum) => ({ opacity: 1, scale: 1 }), // Final state
          },
        }}
      />
      <VictoryLabel
        textAnchor="middle"
        verticalAnchor="middle"
        x={100} // Center of the SVG
        y={100} // Center of the SVG
        text={`${Math.round(percentage)}%`}
        style={{ fontSize: 20 }} // Adjusted font size for smaller chart
      />
    </svg>
  </div>

  );
};

const getData = (percentage) => [
  { x: 1, y: percentage }, // The percentage slice
  { x: 2, y: 100 - percentage }, // The remaining part
];

export default PercentageChart;

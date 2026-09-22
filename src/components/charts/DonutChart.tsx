import React from 'react';

interface DonutChartProps {
  values: number[];
  labels: string[];
  colors: string[];
  title: string;
}

const DonutChart: React.FC<DonutChartProps> = React.memo(({ values, labels, colors, title }) => {
  const total = values.reduce((sum, value) => sum + value, 0);
  const chartSize = 120;
  const center = chartSize / 2;
  const radius = center - 10;
  let currentAngle = 0;

  return (
    <div className="bg-gradient-to-br from-white/90 to-green-50/50 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-green-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
      <div className="flex items-center justify-center">
        <svg width={chartSize} height={chartSize} className="mx-auto">
          {values.map((value, index) => {
            const angle = (value / total) * 360;
            const largeArcFlag = angle > 180 ? 1 : 0;
            const startAngle = currentAngle;
            const endAngle = startAngle + angle;
            const startX = center + radius * Math.cos(startAngle * Math.PI / 180);
            const startY = center + radius * Math.sin(startAngle * Math.PI / 180);
            const endX = center + radius * Math.cos(endAngle * Math.PI / 180);
            const endY = center + radius * Math.sin(endAngle * Math.PI / 180);
            const pathData = [
              `M ${center} ${center}`,
              `L ${startX} ${startY}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');
            currentAngle = endAngle;

            return <path key={index} d={pathData} fill={colors[index]} className="transition-all duration-300 opacity-80 hover:opacity-100" />;
          })}
          <circle cx={center} cy={center} r={radius * 0.5} fill="white" />
          <text x={center} y={center} textAnchor="middle" dy="0.3em" fontSize="14" fontWeight="bold" fill="#4b5563">
            {total}
          </text>
        </svg>
      </div>

      <div className="mt-4 space-y-2">
        {labels.map((label, index) => (
          <div key={index} className="flex items-center text-sm">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index] }} />
            <span className="text-gray-700">{label}</span>
            <span className="ml-auto text-gray-600 font-medium">{Math.round((values[index] / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default DonutChart;

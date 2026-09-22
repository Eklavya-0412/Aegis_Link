import React from 'react';

interface LineChartProps {
  data: number[];
  labels: string[];
  color?: string;
  title: string;
}

const LineChart: React.FC<LineChartProps> = React.memo(({ data, labels, color = '#60a5fa', title }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const padding = 20;
  const chartWidth = 300;
  const chartHeight = 150;

  const normalizedData = data.map(value =>
    chartHeight - padding - ((value - minValue) / (maxValue - minValue || 1)) * (chartHeight - padding * 2)
  );

  const points = normalizedData.map((y, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-blue-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
      <svg width={chartWidth} height={chartHeight} className="w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <line
            key={index}
            x1={padding}
            y1={padding + ratio * (chartHeight - padding * 2)}
            x2={chartWidth - padding}
            y2={padding + ratio * (chartHeight - padding * 2)}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        <polyline fill="none" stroke={color} strokeWidth={3} points={points} className="drop-shadow-sm" />

        {normalizedData.map((y, index) => {
          const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
          return <circle key={index} cx={x} cy={y} r={5} fill={color} className="transition-all duration-300 hover:r-7 drop-shadow-sm" />;
        })}

        {labels.map((label, index) => {
          if (index % Math.ceil(labels.length / 5) !== 0) return null;
          const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
          return (
            <text key={index} x={x} y={chartHeight - 5} textAnchor="middle" fontSize="10" fill="#6b7280">
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
});

export default LineChart;

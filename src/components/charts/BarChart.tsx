import React from 'react';

interface BarChartProps {
  values: number[];
  labels: string[];
  color?: string;
  title: string;
}

const BarChart: React.FC<BarChartProps> = React.memo(({ values, labels, color = '#34d399', title }) => {
  const maxValue = Math.max(...values, 1);
  const chartWidth = 300;
  const chartHeight = 150;
  const padding = 24;
  const barWidth = (chartWidth - padding * 2) / values.length - 8;

  return (
    <div className="bg-gradient-to-br from-white/90 to-emerald-50/50 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-emerald-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
      <svg width={chartWidth} height={chartHeight} className="w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <line key={index} x1={padding} y1={padding + ratio * (chartHeight - padding * 2)} x2={chartWidth - padding} y2={padding + ratio * (chartHeight - padding * 2)} stroke="#e5e7eb" strokeWidth={1} />
        ))}
        {values.map((value, index) => {
          const x = padding + index * (barWidth + 8);
          const height = ((value / maxValue) * (chartHeight - padding * 2)) || 0;
          const y = chartHeight - padding - height;
          return (
            <g key={index}>
              <rect x={x} y={y} width={barWidth} height={height} fill={color} className="opacity-80 hover:opacity-100 transition-opacity" />
              {height > 0 && <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#374151" className="font-bold">{value}</text>}
            </g>
          );
        })}
        {labels.map((label, index) => (
          <text key={index} x={padding + index * (barWidth + 8) + barWidth / 2} y={chartHeight - 6} textAnchor="middle" fontSize="10" fill="#6b7280">
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
});

export default BarChart;

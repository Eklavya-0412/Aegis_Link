import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AXIS_TICK, CHART_COLORS, ChartFrame, ChartTooltip } from './ChartFrame';

export interface ChartReferenceLine {
  y: number;
  label: string;
  tone?: 'warning' | 'danger';
}

interface LineChartProps {
  data: number[];
  labels: string[];
  color?: string;
  title?: string;
  subtitle?: React.ReactNode;
  unit?: string;
  height?: number;
  bare?: boolean;
  actions?: React.ReactNode;
  referenceLines?: ChartReferenceLine[];
  emptyMessage?: string;
  footer?: React.ReactNode;
}

const LineChart: React.FC<LineChartProps> = React.memo(
  ({
    data,
    labels,
    color = CHART_COLORS.brand,
    title,
    subtitle,
    unit,
    height = 200,
    bare,
    actions,
    referenceLines = [],
    emptyMessage,
    footer
  }) => {
    const rows = useMemo(() => data.map((value, i) => ({ label: labels[i] ?? '', value })), [data, labels]);

    // Keep reference lines visible by extending the domain to include them.
    const domain = useMemo(() => {
      if (data.length === 0) return [0, 1];
      const values = [...data, ...referenceLines.map((r) => r.y)];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const pad = Math.max(2, (max - min) * 0.12);
      return [Math.floor(min - pad), Math.ceil(max + pad)];
    }, [data, referenceLines]);

    return (
      <ChartFrame
        title={title}
        subtitle={subtitle}
        actions={actions}
        bare={bare}
        isEmpty={data.length === 0}
        emptyMessage={emptyMessage}
        height={height}
        footer={footer}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="currentColor" className="text-slate-100 dark:text-slate-800" vertical={false} />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              domain={domain}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: '#D6D0C7', strokeDasharray: '3 3' }} />
            {referenceLines.map((ref) => (
              <ReferenceLine
                key={`${ref.label}-${ref.y}`}
                y={ref.y}
                stroke={ref.tone === 'danger' ? CHART_COLORS.red : CHART_COLORS.amber}
                strokeDasharray="4 4"
                strokeOpacity={0.8}
                label={{
                  value: ref.label,
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: ref.tone === 'danger' ? CHART_COLORS.red : CHART_COLORS.amber
                }}
              />
            ))}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2.5, strokeWidth: 0, fill: color }}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
          </ReLineChart>
        </ResponsiveContainer>
      </ChartFrame>
    );
  }
);

export default LineChart;

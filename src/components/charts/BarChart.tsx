import React, { useMemo } from 'react';
import { Bar, BarChart as ReBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, CHART_COLORS, ChartFrame, ChartTooltip } from './ChartFrame';

interface BarChartProps {
  values: number[];
  labels: string[];
  color?: string;
  title?: string;
  subtitle?: React.ReactNode;
  unit?: string;
  height?: number;
  bare?: boolean;
  actions?: React.ReactNode;
  emptyMessage?: string;
  /** Fixed upper bound for the value axis, e.g. 100 for percentages. */
  max?: number;
}

const BarChart: React.FC<BarChartProps> = React.memo(
  ({ values, labels, color = CHART_COLORS.brand, title, subtitle, unit, height = 200, bare, actions, emptyMessage, max }) => {
    const rows = useMemo(() => values.map((value, i) => ({ label: labels[i] ?? '', value })), [values, labels]);
    const isEmpty = values.length === 0 || values.every((v) => !v);

    return (
      <ChartFrame
        title={title}
        subtitle={subtitle}
        actions={actions}
        bare={bare}
        isEmpty={isEmpty}
        emptyMessage={emptyMessage}
        height={height}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="28%">
            <CartesianGrid stroke="currentColor" className="text-slate-100 dark:text-slate-800" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} minTickGap={4} />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
              domain={max !== undefined ? [0, max] : [0, 'auto']}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
          </ReBarChart>
        </ResponsiveContainer>
      </ChartFrame>
    );
  }
);

export default BarChart;

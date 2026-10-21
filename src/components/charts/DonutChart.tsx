import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartFrame, ChartTooltip } from './ChartFrame';

interface DonutChartProps {
  values: number[];
  labels: string[];
  colors: string[];
  title?: string;
  subtitle?: React.ReactNode;
  bare?: boolean;
  /** Text shown beneath the total in the centre of the ring. */
  centerLabel?: string;
  emptyMessage?: string;
}

const DonutChart: React.FC<DonutChartProps> = React.memo(
  ({ values, labels, colors, title, subtitle, bare, centerLabel = 'Total', emptyMessage }) => {
    const total = values.reduce((sum, v) => sum + v, 0);
    const rows = values.map((value, i) => ({ name: labels[i], value }));

    return (
      <ChartFrame title={title} subtitle={subtitle} bare={bare} isEmpty={total === 0} emptyMessage={emptyMessage} height={148} autoHeight>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <div className="relative h-[148px] w-[148px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={values.filter((v) => v > 0).length > 1 ? 2 : 0}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {rows.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{total}</span>
              <span className="text-2xs text-slate-500">{centerLabel}</span>
            </div>
          </div>
          <ul className="min-w-[150px] flex-1 space-y-2">
            {labels.map((label, i) => (
              <li key={label} className="flex items-center gap-2 text-13">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colors[i] }} aria-hidden />
                <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{label}</span>
                <span className="ml-auto font-medium tabular-nums text-slate-900 dark:text-slate-100">{values[i]}</span>
                <span className="w-10 text-right text-xs tabular-nums text-slate-500">
                  {total ? Math.round((values[i] / total) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </ChartFrame>
    );
  }
);

export default DonutChart;

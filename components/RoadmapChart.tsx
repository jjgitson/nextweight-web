'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';

interface RoadmapChartProps {
  data: {
    week: number;
    userLossPct: number;
  }[];
}

export default function RoadmapChart({ data }: RoadmapChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="week" />
          {/* domain 값이 거꾸로 들어가 있어서 차트가 안 보이던 문제 수정 */}
          <YAxis domain={[-25, 0]} hide />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
            labelFormatter={(label: number) => `Week ${label}`}
          />
          <Line
            type="monotone"
            dataKey="userLossPct"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
          <ReferenceDot
            x={data[data.length - 1].week}
            y={data[data.length - 1].userLossPct}
            r={4}
            fill="#22c55e"
            stroke="none"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

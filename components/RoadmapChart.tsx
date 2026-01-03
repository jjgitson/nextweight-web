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
  userData: {
    startWeight: number;
  };
  analysis: {
    userLossPct: number[];
    weeks: number[];
  };
}

export default function RoadmapChart({ userData, analysis }: RoadmapChartProps) {
  if (!analysis || !analysis.userLossPct || analysis.userLossPct.length === 0)
    return null;

  const chartData = analysis.weeks.map((week, idx) => ({
    week,
    userLossPct: analysis.userLossPct[idx],
  }));

  const lastPoint = chartData[chartData.length - 1];

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="week" />
          {/* 기존 [0, -25] → [-25, 0] 으로 수정 */}
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
          {lastPoint && (
            <ReferenceDot
              x={lastPoint.week}
              y={lastPoint.userLossPct}
              r={4}
              fill="#22c55e"
              stroke="none"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';

type RoadmapChartProps = {
  userData: any;
  analysis: any;
};

function toNumberArray(v: any): number[] {
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === 'number' ? x : Number(x)))
      .filter((x) => Number.isFinite(x));
  }
  if (typeof v === 'number' && Number.isFinite(v)) return [v];
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? [n] : [];
  }
  return [];
}

function deriveSeries(analysis: any): { weeks: number[]; lossPct: number[] } {
  if (!analysis) return { weeks: [], lossPct: [] };

  // 1) 가장 흔한 형태: weeks + userLossPct 배열
  const lossPctA = toNumberArray(analysis.userLossPct);
  const weeksA = toNumberArray(analysis.weeks);
  if (lossPctA.length > 0) {
    const weeks =
      weeksA.length === lossPctA.length
        ? weeksA
        : Array.from({ length: lossPctA.length }, (_, i) => i + 1);
    return { weeks, lossPct: lossPctA };
  }

  // 2) 다른 키 이름 가능성: values, series, trajectory 등
  // (프로젝트에서 키가 바뀌어도 차트가 완전히 죽지 않게 방어적으로 처리)
  const candidateArrays = [
    analysis.values,
    analysis.series,
    analysis.trajectory,
    analysis.lossPct,
    analysis.lossPercent,
  ];
  for (const c of candidateArrays) {
    const arr = toNumberArray(c);
    if (arr.length > 0) {
      const weeks =
        weeksA.length === arr.length
          ? weeksA
          : Array.from({ length: arr.length }, (_, i) => i + 1);
      return { weeks, lossPct: arr };
    }
  }

  // 3) 정말 단일 값만 있는 경우: 점 1개라도 찍기
  const single =
    typeof analysis.userLossPct === 'number'
      ? analysis.userLossPct
      : typeof analysis.lossPct === 'number'
        ? analysis.lossPct
        : typeof analysis.lossPercent === 'number'
          ? analysis.lossPercent
          : undefined;

  if (typeof single === 'number' && Number.isFinite(single)) {
    return { weeks: [1], lossPct: [single] };
  }

  return { weeks: [], lossPct: [] };
}

export default function RoadmapChart({ userData, analysis }: RoadmapChartProps) {
  const { weeks, lossPct } = deriveSeries(analysis);

  if (weeks.length === 0 || lossPct.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={styles.title}>Weight change</div>
        </div>
        <div style={styles.empty}>
          차트를 표시할 데이터가 없습니다.
        </div>
      </div>
    );
  }

  const chartData = weeks.map((w, i) => ({
    week: w,
    userLossPct: lossPct[i],
  }));

  const lastPoint = chartData[chartData.length - 1];

  // 도메인 고정: 0% ~ -25% (감량률이므로 음수 방향)
  // 값이 밖으로 벗어나도 라인이 완전히 사라지지 않게, 실제 값도 반영해서 조금 확장
  const minVal = Math.min(...lossPct);
  const maxVal = Math.max(...lossPct);
  const domainMin = Math.min(-25, Math.floor(minVal - 1));
  const domainMax = Math.max(0, Math.ceil(maxVal + 1));

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.title}>Weight change</div>
        <div style={styles.subTitle}>% change vs start</div>
      </div>

      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
            <XAxis
              dataKey="week"
              tickMargin={8}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[domainMin, domainMax]}
              tickMargin={8}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value) =>
                value == null ? '' : `${Number(value).toFixed(1)}%`
              }
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.10)',
              }}
            />
            <Line
              type="monotone"
              dataKey="userLossPct"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {lastPoint && (
              <ReferenceDot
                x={lastPoint.week}
                y={lastPoint.userLossPct}
                r={4}
                fill="#22c55e"
                stroke="none"
                isFront
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerItem}>
          마지막 값: {Number(lastPoint.userLossPct).toFixed(1)}%
        </div>
        <div style={styles.footerItem}>
          주차: {lastPoint.week}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: '100%',
    background: '#ffffff',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    borderRadius: 24,
    padding: 16,
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  chartWrap: {
    width: '100%',
    height: 280, // Tailwind가 깨져도 차트가 무조건 보이도록 고정
    minHeight: 280,
  },
  footer: {
    marginTop: 12,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerItem: {
    fontSize: 12,
    color: '#64748b',
  },
  empty: {
    height: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: 13,
    border: '1px dashed rgba(15, 23, 42, 0.10)',
    borderRadius: 16,
  },
};

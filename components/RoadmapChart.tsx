// /components/RoadmapChart.tsx
"use client";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea } from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  // 임상 곡선 데이터 상시 생성 (사용자 데이터 유무 무관)
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drugKey: 'WEGOVY' | 'MOUNJARO', w: number) => {
      const drug = CLINICAL_DATA[drugKey];
      const idx = drug.weeks.findIndex(dw => dw >= w);
      const values = drugKey === 'MOUNJARO' ? (drug as any).dose["15mg"] : (drug as any).values;
      return values[idx === -1 ? values.length - 1 : idx] || 0;
    };
    return { week, mounjaro: getVal('MOUNJARO', week), wegovy: getVal('WEGOVY', week) };
  });

  return (
    // 요구사항: Desktop 360px, Mobile 260px 고정
    <div className="w-full h-[260px] md:h-[360px] bg-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} hide />
          {/* 요구사항: Y축 0% to -25% 고정 */}
          <YAxis domain={[0, -25]} hide />
          <Tooltip formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']} />
          {STAGES.map(s => <ReferenceArea key={s.phase} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.03} />)}
          
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          
          {/* 사용자 마커: 데이터가 1개여도 렌더링 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot x={userData.currentWeek} y={analysis.userLossPct} r={7} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#1e40af', fontSize: 11, fontWeight: "900" }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

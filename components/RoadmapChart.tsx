// /components/RoadmapChart.tsx
"use client";
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea 
} from 'recharts';
import { CLINICAL_DATA, STAGES } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  // 0~72주 고정 차트 데이터 구성 (임상 곡선 상시 노출)
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drugKey: 'WEGOVY' | 'MOUNJARO', w: number) => {
      const drug = CLINICAL_DATA[drugKey];
      const idx = drug.weeks.findIndex(dw => dw >= w);
      const values = drugKey === 'MOUNJARO' ? (drug as any).dose["15mg"] : (drug as any).values;
      return values[idx === -1 ? values.length - 1 : idx] || 0;
    };
    return {
      week,
      mounjaro: getVal('MOUNJARO', week),
      wegovy: getVal('WEGOVY', week)
    };
  });

  return (
    // 요구사항: Desktop 360px, Mobile 260px
    <div className="w-full h-[260px] md:h-[360px] bg-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} hide />
          {/* 요구사항: Y-axis domain 0% to -25% */}
          <YAxis domain={[0, -25]} hide />
          <Tooltip formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '감량률']} />
          
          {STAGES.map(s => (
            <ReferenceArea key={s.phase} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.03} />
          ))}

          {/* 임상 곡선 (점선) */}
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          
          {/* 요구사항: 사용자 포인트 마커 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={analysis.userLossPercent} 
              r={7} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#1e40af', fontSize: 11, fontWeight: "900" }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

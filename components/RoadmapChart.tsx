// /components/RoadmapChart.tsx
"use client";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea, Label } from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  // 임상 곡선 상시 생성
  const chartData = Array.from({ length: 73 }, (_, week) => ({
    week,
    wegovy: CLINICAL_DATA.WEGOVY.values[CLINICAL_DATA.WEGOVY.weeks.findIndex(w => w >= week)] || -16,
    mounjaro: CLINICAL_DATA.MOUNJARO.dose["15mg"][CLINICAL_DATA.MOUNJARO.weeks.findIndex(w => w >= week)] || -22.5
  }));

  if (!analysis) return <div className="h-[260px] md:h-[360px] flex items-center justify-center bg-slate-50 text-slate-400 font-bold">데이터를 불러오지 못했습니다.</div>;

  return (
    // 요구사항: Desktop min-height 320px, Mobile 240px
    <div className="w-full h-[260px] md:h-[360px] bg-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} hide />
          <YAxis domain={[0, -25]} hide />
          <Tooltip formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '감량률']} />
          
          {/* 4-Stage 배경 Band */}
          {STAGES.map(s => (
            <ReferenceArea key={s.phase} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.04}>
              {s.phase === analysis.currentStage.phase && (
                <Label value="CURRENT" position="insideTop" fill={s.color} fontSize={9} fontWeight="900" />
              )}
            </ReferenceArea>
          ))}

          {/* 임상 기준선: 점선 */}
          <Line dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          
          {/* 사용자 포인트 마커: "나의 현재" */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot x={userData.currentWeek} y={analysis.userLossPct} r={8} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#1e40af', fontSize: 11, fontWeight: "900" }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

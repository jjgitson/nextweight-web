// /components/RoadmapChart.tsx
"use client";
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea, Label
} from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  // 임상 곡선 상시 렌더링 데이터 (0~72주 고정)
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drug: any, w: number, dose?: string) => {
      const idx = drug.weeks.findIndex((dw: number) => dw >= w);
      const vals = dose ? drug.dose[dose] || drug.dose["15mg"] : drug.values;
      return vals[idx === -1 ? vals.length - 1 : idx] || 0;
    };
    return {
      week,
      mounjaro: getVal(CLINICAL_DATA.MOUNJARO, week, "15mg"),
      wegovy: getVal(CLINICAL_DATA.WEGOVY, week),
    };
  });

  return (
    // 요구사항: Desktop min-height 320px, Mobile min-height 240px
    <div className="w-full min-h-[240px] md:min-h-[320px] bg-white rounded-3xl relative overflow-hidden">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} tick={{fontSize: 10}} />
          
          {/* 요구사항: Y-axis domain 고정 0% to -25% */}
          <YAxis tick={{fontSize: 10}} unit="%" domain={[0, -25]} allowDataOverflow={false} />
          
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            formatter={(value: any) => [`${Number(value).toFixed(1)}%`, '감량률']}
          />
          
          {STAGES.map(s => (
            <ReferenceArea key={s.phase} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.04}>
              <Label value={`${s.icon} ${s.name}`} position="insideTop" fill={s.color} fontSize={9} fontWeight="bold" />
            </ReferenceArea>
          ))}

          {/* 임상 기준 곡선 상시 렌더링 */}
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="터제타파이드 평균" isAnimationActive={false} />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} name="위고비 평균" isAnimationActive={false} />
          
          {/* 사용자 포인트 마커 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={analysis.userLossPct || 0} 
              r={8} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#2563EB', fontSize: 11, fontWeight: "900" }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// /components/RoadmapChart.tsx
"use client";
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea, Label
} from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  // 차트 시각화용 데이터 구성 (0~72주)
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drug: any, w: number, dose?: string) => {
      const idx = drug.weeks.findIndex((dw: number) => dw >= w);
      const vals = dose ? drug.dose[dose] || drug.dose["15mg"] : drug.values;
      return vals[idx === -1 ? vals.length - 1 : idx];
    };

    return {
      week,
      mounjaro: getVal(CLINICAL_DATA.MOUNJARO, week, "15mg"),
      wegovy: getVal(CLINICAL_DATA.WEGOVY, week),
      user: week <= userData.currentWeek ? analysis.userLossPct : null
    };
  });

  return (
    <div className="w-full h-[400px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} tick={{fontSize: 10}} />
          <YAxis tick={{fontSize: 10}} unit="%" />
          <Tooltip />
          
          {/* 4-Stage 레이어 오버레이 */}
          {STAGES.map(s => (
            <ReferenceArea key={s.id} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.05}>
              <Label value={`${s.icon} ${s.name}`} position="insideTop" fill={s.color} fontSize={10} fontWeight="bold" />
            </ReferenceArea>
          ))}

          {/* 임상 기준 곡선 (점선) */}
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="터제타파이드 평균" />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} name="위고비 평균" />
          
          {/* 사용자 곡선 (실선) */}
          <Line type="monotone" dataKey="user" stroke="#2563EB" strokeWidth={3} dot={false} name="나의 변화" />

          {/* 현재 위치 마커 */}
          <ReferenceDot 
            x={userData.currentWeek} 
            y={Number(analysis.userLossPct)} 
            r={6} fill="#2563EB" stroke="#fff" strokeWidth={2}
            label={{ position: 'top', value: analysis.currentStage.name, fill: '#2563EB', fontSize: 12, fontWeight: 'bold' }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

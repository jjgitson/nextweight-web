// /components/RoadmapChart.tsx
"use client";
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea, Label
} from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

interface RoadmapChartProps {
  userData: any;
  analysis: any;
}

export default function RoadmapChart({ userData, analysis }: RoadmapChartProps) {
  // 0~72주 고정 차트 데이터 구성
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
      // 현재 주차까지만 사용자 실선 표시
      user: week === userData.currentWeek ? analysis.userLossPct : null
    };
  });

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} tick={{fontSize: 10}} />
          <YAxis tick={{fontSize: 10}} unit="%" domain={[-25, 5]} />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            // ✅ TypeScript 에러 수정: undefined 방어 코드 적용
            formatter={(value: any) => [`${value}%`, '감량률']}
          />
          
          {/* 🌊 4-Stage 스테이지 레이어 오버레이 */}
          {STAGES.map(s => (
            <ReferenceArea key={s.id} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.04}>
              <Label value={`${s.icon} ${s.name}`} position="insideTop" fill={s.color} fontSize={9} fontWeight="bold" />
            </ReferenceArea>
          ))}

          {/* 임상 기준 곡선 (점선) */}
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="터제타파이드(15mg) 평균" />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} name="위고비(2.4mg) 평균" />
          
          {/* 현재 위치 마커 */}
          <ReferenceDot 
            x={userData.currentWeek} 
            y={analysis.userLossPct} 
            r={8} fill="#2563EB" stroke="white" strokeWidth={3}
            label={{ position: 'top', value: '나의 현재', fill: '#2563EB', fontSize: 11, fontWeight: "900" }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

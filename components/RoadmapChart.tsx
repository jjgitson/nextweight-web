// /components/RoadmapChart.tsx
"use client";

import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';

interface RoadmapChartProps {
  data: any[]; // 엔진에서 생성된 주차별 가이드 데이터
  userData: any; // 14개 필드 온보딩 데이터
  drugConfig: any; // 선택된 약물의 임상 설정값
}

export default function RoadmapChart({ data, userData, drugConfig }: RoadmapChartProps) {
  // 임상 데이터 궤도 생성 (마운자로 15mg 또는 위고비 2.4mg 기준)
  const clinicalCurve = drugConfig.clinicalData.map((c: any) => {
    // 약물별 최대 용량의 감량률을 기준으로 곡선 생성
    const percent = userData.drugType === 'MOUNJARO' ? c.mg15 : c.mg24;
    return {
      week: c.week,
      clinical: (userData.startWeightBeforeDrug * (1 + percent / 100)).toFixed(1),
      name: `${c.week}주`
    };
  });

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={clinicalCurve}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" tick={{fontSize: 12}} axisLine={false} tickLine={false} unit="주" />
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            labelFormatter={(label) => `D+${label}주`}
          />
          <Area type="monotone" dataKey="clinical" fill="#EEF2FF" stroke="#C7D2FE" name="임상 평균 궤도" />
          <Line type="monotone" dataKey="clinical" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} name="예상 체중(kg)" />
          
          {/* ✅ 현재 사용자의 위치(주차 및 체중)를 빨간 점으로 마킹 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={userData.currentWeight} 
              r={8} fill="#EF4444" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 위치', fill: '#EF4444', fontSize: 12, fontWeight: 'bold' }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

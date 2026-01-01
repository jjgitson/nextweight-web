// /components/RoadmapChart.tsx
"use client";

import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function RoadmapChart({ data, userData, drugConfig }: any) {
  // 임상 데이터와 사용자 현재 체중을 결합하여 예상 곡선 생성 
  const chartData = drugConfig.clinicalData.map((c: any) => ({
    week: c.week,
    // 임상 평균 체중 변화 (kg)
    clinicalWeight: (userData.weight * (1 + c.percent / 100)).toFixed(1),
    name: `${c.week}주`
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" tick={{fontSize: 12}} />
          <YAxis hide domain={['dataMin - 5', 'dataMax + 2']} />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
            formatter={(value) => [`${value} kg`, "예상 체중"]}
          />
          {/* 임상 기반 가이드 영역  */}
          <Area 
            type="monotone" 
            dataKey="clinicalWeight" 
            fill="#EFF6FF" 
            stroke="#DBEAFE" 
            name="임상 감량 궤도"
          />
          {/* 실제 주차 표시 (예시로 4주차 표시) */}
          <ReferenceLine x={4} stroke="#3B82F6" strokeDasharray="3 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

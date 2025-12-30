"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, Label 
} from 'recharts';

interface RoadmapChartProps {
  data: any[];
  drugName: string;
}

export default function RoadmapChart({ data, drugName }: RoadmapChartProps) {
  // 유지기 진입 주차 찾기 (첫 번째 유지기 데이터의 weekNum)
  const maintenanceStart = data.find(d => d.phase === '유지 관리기')?.weekNum;

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="weekNum" 
            axisLine={false}
            tickLine={false}
            tick={{fontSize: 12, fill: '#9ca3af'}}
            dy={10}
            label={{ value: '경과 주차 (Week)', position: 'insideBottomRight', offset: -10, fontSize: 11 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{fontSize: 12, fill: '#9ca3af'}}
            label={{ value: '용량 (mg)', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            labelFormatter={(label) => `D+${label}주`}
          />
          
          {maintenanceStart !== undefined && (
            <ReferenceLine x={maintenanceStart} stroke="#10b981" strokeDasharray="5 5">
              <Label value="유지기 관리 시작" position="top" fill="#10b981" fontSize={11} fontWeight="bold" />
            </ReferenceLine>
          )}

          <Line 
            type="monotone" 
            dataKey="dose" 
            stroke="#2563eb" 
            strokeWidth={4} 
            dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

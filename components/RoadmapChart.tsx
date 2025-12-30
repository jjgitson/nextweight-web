"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from "recharts";

interface ChartProps {
  data: any[];
  drugName: string;
}

export default function RoadmapChart({ data, drugName }: ChartProps) {
  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-xl shadow-inner border border-gray-50">
      <h3 className="text-center font-bold text-gray-700 mb-4">{drugName} 맞춤형 용량 로드맵</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="week" label={{ value: "주차 (Week)", position: "insideBottomRight", offset: -5 }} />
          <YAxis label={{ value: "용량 (mg)", angle: -90, position: "insideLeft" }} />
          <Tooltip 
            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            formatter={(value) => [`${value} mg`, "투여량"]}
          />
          <ReferenceLine x={13} stroke="green" strokeDasharray="5 5">
            <Label value="유지기 진입 추천" position="top" fill="green" fontSize={12} />
          </ReferenceLine>
          <Line 
            type="monotone" 
            dataKey="dose" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={{ r: 6, fill: "#2563eb" }} 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

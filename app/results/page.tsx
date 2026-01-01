// /app/results/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap } from '../../lib/roadmap-engine';
import { PROTEIN_20G_GUIDE, MEDICAL_RULES } from '../../lib/content';
import RoadmapChart from '../../components/RoadmapChart';
import { DRUG_TYPES } from '../../lib/drug-config';

function ResultsContent() {
  const searchParams = useSearchParams();
  const userData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    drugType: (searchParams.get('drugType') as keyof typeof DRUG_TYPES) || 'MOUNJARO',
    muscleMass: searchParams.get('muscleMass') || '표준',
    budget: searchParams.get('budget') || '표준형',
  };

  const { personalizedMessage } = generatePersonalizedRoadmap(userData as any);
  const hrMax = 220 - userData.userAge; // 지침서 심박수 공식 [cite: 2530]

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 학회 지침 마크 */}
        <div className="text-[10px] text-blue-600 font-bold text-center bg-blue-50 py-2 rounded-full">
          KSSO 대한비만학회 비만 진료지침 2024(9판) 기준 설계
        </div>

        {/* 전문가 분석 조언 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-blue-500">
          <h3 className="font-black text-lg mb-2">📢 맞춤 분석 조언</h3>
          <p className="text-gray-700 leading-relaxed">{personalizedMessage}</p>
        </div>

        {/* 5% 중단 규칙 알림 */}
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
          <h4 className="text-red-700 font-bold mb-1">⚠️ {MEDICAL_RULES.FIVE_PERCENT_RULE.title}</h4>
          <p className="text-sm text-red-600 opacity-90">{MEDICAL_RULES.FIVE_PERCENT_RULE.content}</p>
        </div>

        {/* 한 끼 단백질 20g 식품표 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm">
          <h3 className="text-xl font-black mb-6">🥩 한 끼 단백질 20g 채우기</h3>
          <div className="grid grid-cols-2 gap-3">
            {PROTEIN_20G_GUIDE.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl">
                <div className="text-xs text-slate-500">{item.name}</div>
                <div className="font-bold text-slate-800">{item.weight}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 목표 심박수 가이드 */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px]">
          <h3 className="text-xl font-black mb-4">🏋️ 맞춤 운동 강도 (심박수)</h3>
          <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
            <div>
              <div className="text-xs opacity-60">중강도 (64-76%)</div>
              <div className="text-lg font-bold">{(hrMax * 0.64).toFixed(0)} - {(hrMax * 0.76).toFixed(0)} bpm</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-60">고강도 (77-95%)</div>
              <div className="text-lg font-bold">{(hrMax * 0.77).toFixed(0)} - {(hrMax * 0.95).toFixed(0)} bpm</div>
            </div>
          </div>
          <p className="text-[10px] mt-4 opacity-50 text-center italic">
            * 중강도: 대화는 가능하나 노래는 어려운 정도 [cite: 2507]
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">지침 데이터 로딩 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

// /app/results/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap, UserData } from '../../lib/roadmap-engine';
import { PROTEIN_20G_GUIDE, MEDICAL_RULES } from '../../lib/content';
import RoadmapChart from '../../components/RoadmapChart';
import { DRUG_TYPES } from '../../lib/drug-config';

function ResultsContent() {
  const searchParams = useSearchParams();
  
  // URL 파라미터를 UserData 인터페이스 규격에 맞게 매핑
  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    drugType: (searchParams.get('drugType') as keyof typeof DRUG_TYPES) || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    budget: searchParams.get('budget') || '표준형',
    muscleMass: searchParams.get('muscleMass') || '표준',
  };

  const { personalizedMessage, roadmap, drugName, references } = generatePersonalizedRoadmap(userData);
  const hrMax = 220 - userData.userAge; 

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-[10px] text-blue-600 font-bold text-center bg-blue-50 py-2 rounded-full border border-blue-100">
          KSSO 대한비만학회 비만 진료지침 2024(9판) 최신 데이터 적용
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border-l-8 border-blue-500">
          <h3 className="font-black text-xl mb-3">📢 전문가 맞춤 분석</h3>
          <p className="text-gray-700 leading-relaxed font-medium">{personalizedMessage}</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm">
          <h2 className="text-xl font-black mb-6">{drugName} 임상 기반 시뮬레이션</h2>
          <RoadmapChart data={roadmap} userData={userData} drugConfig={DRUG_TYPES[userData.drugType]} />
          <p className="text-[10px] text-gray-400 mt-6 text-center italic">{references}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
            <h4 className="text-red-700 font-bold mb-2">⚠️ {MEDICAL_RULES.FIVE_PERCENT_RULE.title}</h4>
            <p className="text-sm text-red-600 leading-relaxed">{MEDICAL_RULES.FIVE_PERCENT_RULE.content}</p>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl">
            <h4 className="text-slate-300 font-bold mb-2">🏋️ 권장 운동 심박수</h4>
            <div className="text-lg font-black text-blue-400">
              {(hrMax * 0.64).toFixed(0)} - {(hrMax * 0.76).toFixed(0)} BPM
            </div>
            <p className="text-[10px] opacity-60 mt-1">지침 권고 중강도(HRmax 64-76%) 기준</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <h3 className="text-xl font-black mb-6">🥩 한 끼 단백질 20g 식품 환산표</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PROTEIN_20G_GUIDE.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-[10px] text-slate-500 font-bold mb-1">{item.name}</div>
                <div className="font-bold text-slate-800 text-sm">{item.weight}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-4 text-center">출처: 비만 진료지침 2024 식사요법(46p)</p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400">최신 비만 지침 데이터를 분석 중입니다...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

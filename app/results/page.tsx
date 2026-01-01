// /app/results/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap, UserData } from '../../lib/roadmap-engine';
import { PROTEIN_20G_GUIDE } from '../../lib/content';
import RoadmapChart from '../../components/RoadmapChart';
import { DRUG_TYPES } from '../../lib/drug-config';

function ResultsContent() {
  const searchParams = useSearchParams();
  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    drugType: (searchParams.get('drugType') as keyof typeof DRUG_TYPES) || 'MOUNJARO',
    budget: searchParams.get('budget') || '표준형',
    muscleMass: searchParams.get('muscleMass') || '표준',
  };

  const { personalizedMessage, roadmap, drugName } = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="max-w-4xl mx-auto pt-10 px-6">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">대사 가교(Metabolic Bridge) 로드맵</h1>
          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
             <p className="font-medium opacity-90 leading-relaxed">{personalizedMessage}</p>
          </div>
        </header>

        {/* [G] Drug 섹션 - 시뮬레이션 차트 */}
        <section className="bg-white p-8 rounded-[40px] shadow-sm mb-8 border border-slate-100">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-black text-slate-900">G: {drugName} 투약 궤도</h2>
            <span className="text-xs text-slate-400 italic">임상 데이터 기반 시뮬레이션</span>
          </div>
          <RoadmapChart data={roadmap} userData={userData} drugConfig={DRUG_TYPES[userData.drugType]} />
        </section>

        {/* [P & S] 대사 엔진 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Protein 섹션 */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-green-600 mb-4">P: Protein (대사 연료)</h3>
            <p className="text-sm text-slate-600 mb-6">약물 중단 시 대사 저하를 막기 위해 한 끼 20g의 단백질은 선택이 아닌 필수입니다.</p>
            <div className="space-y-2">
              {PROTEIN_20G_GUIDE.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between bg-green-50 p-3 rounded-2xl text-sm">
                  <span className="font-bold text-green-800">{item.name}</span>
                  <span className="text-green-700">{item.weight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strength 섹션 */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-purple-600 mb-4">S: Strength (대사 엔진)</h3>
            <p className="text-sm text-slate-600 mb-6">근육은 스스로 호르몬을 만드는 내분비 기관입니다. 가교 단계에서 근력 운동은 요요를 막는 가장 강력한 방패입니다.</p>
            <div className="bg-purple-50 p-5 rounded-3xl">
              <div className="text-xs text-purple-400 mb-1">권장 운동 강도 (중강도)</div>
              <div className="text-xl font-black text-purple-900">{(220 - userData.userAge) * 0.64}~{(220 - userData.userAge) * 0.76} BPM</div>
            </div>
          </div>
        </div>

        {/* 하단 근거 주석 */}
        <footer className="text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            본 로드맵은 대한비만학회(KSSO) 2024 지침과 각 약제의 RCT 임상 데이터를 바탕으로 설계되었습니다.<br/>
            전문가의 가이드는 약물 사용의 효율을 극대화하고 중단 이후의 자생 대사 엔진을 켜는 데 목적이 있습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400">Next Weight Lab 데이터 분석 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

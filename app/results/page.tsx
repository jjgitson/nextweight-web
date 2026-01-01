// /app/results/page.tsx
"use client";

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import DisclaimerModal from '../../components/DisclaimerModal';
import { DRUG_TYPES } from '../../lib/drug-config';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [isAgreed, setIsAgreed] = useState(false);
  
  const userData = {
    drugType: (searchParams.get('drugType') as 'WEGOVY' | 'MOUNJARO') || 'MOUNJARO',
    currentDose: parseFloat(searchParams.get('currentDose') || '2.5'),
    weight: parseFloat(searchParams.get('weight') || '80'), // 예시 기본값
    budget: searchParams.get('budget') || '표준형',
  };

  const drugConfig = DRUG_TYPES[userData.drugType];
  const result = generatePersonalizedRoadmap(userData as any);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <DisclaimerModal isOpen={!isAgreed} onConfirm={() => setIsAgreed(true)} />
      
      <div className="max-w-4xl mx-auto pt-10 px-6">
        {/* GPS 로드맵 카드  */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <span className="text-2xl mb-2 block">💉</span>
            <h3 className="font-bold text-gray-900">G: {drugConfig.name}</h3>
            <p className="text-xs text-gray-500 mt-1">호르몬 모방을 통한 식욕 조절 </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <span className="text-2xl mb-2 block">🥩</span>
            <h3 className="font-bold text-gray-900">P: Protein</h3>
            <p className="text-xs text-gray-500 mt-1">하루 100g, 4회 분할 섭취 권장 </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <span className="text-2xl mb-2 block">🏋️</span>
            <h3 className="font-bold text-gray-900">S: Strength</h3>
            <p className="text-xs text-gray-500 mt-1">근육 사수를 통한 요요 방지 </p>
          </div>
        </section>

        {/* 메인 차트 섹션 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm mb-8">
          <h2 className="text-xl font-black mb-6">대사 가교 시뮬레이션</h2>
          <RoadmapChart data={result.roadmap} userData={userData} drugConfig={drugConfig} />
          <p className="text-[10px] text-gray-400 mt-6 text-center italic">
            {drugConfig.references}
          </p>
        </div>

        {/* 예산별 맞춤 조언 섹션 [cite: 9] */}
        <div className="bg-blue-600 text-white p-8 rounded-[40px]">
          <h3 className="text-lg font-bold mb-4 flex items-center">
             💡 {userData.budget}을 위한 맞춤 전략
          </h3>
          <p className="leading-relaxed opacity-90">
            {userData.budget === '표준형' 
              ? "월 5~10만 원 투자가 근육 1kg을 사수하며, 이는 향후 재투약 비용 200만 원을 아끼는 경제적 선택입니다. [cite: 9]"
              : "일상 활동량을 20% 강제 증가시켜 지출 없이 대사 하한선을 사수하세요. [cite: 9]"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">분석 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

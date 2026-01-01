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
  const [selectedSos, setSelectedSos] = useState<string | null>(null);
  
  const userData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')),
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')),
    targetWeight: Number(searchParams.get('targetWeight')),
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    drugType: (searchParams.get('drugType') as 'WEGOVY' | 'MOUNJARO') || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')),
    duration: searchParams.get('duration') || '사용 전',
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '1-2회',
    budget: searchParams.get('budget') || '표준형',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const drugConfig = DRUG_TYPES[userData.drugType];
  const result = generatePersonalizedRoadmap(userData as any);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <DisclaimerModal isOpen={!isAgreed} onConfirm={() => setIsAgreed(true)} />
      
      <div className="max-w-4xl mx-auto pt-10 px-6">
        <header className="mb-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl mb-6 shadow-sm">
            <h4 className="text-yellow-800 font-bold mb-1">📢 전문가 분석 조언</h4>
            <p className="text-yellow-900 font-medium leading-relaxed">
              {result.personalizedMessage}
            </p>
          </div>
          <h1 className="text-3xl font-black text-gray-900">{userData.userName}님의 맞춤 로드맵</h1>
        </header>

        {/* 차트 섹션 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm mb-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black">대사 가교 시뮬레이션</h2>
            <button onClick={() => setSelectedSos('NAUSEA')} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold">
              ⚠️ 부작용 SOS
            </button>
          </div>
          <RoadmapChart data={result.roadmap} userData={userData} drugConfig={drugConfig} />
        </div>

        {/* GPS 전략 카드 */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-5 rounded-3xl border border-gray-100">
             <h3 className="font-bold text-blue-600 mb-2">G: Drug</h3>
             <p className="text-gray-600">{drugConfig.name}를 통한 식욕 조절 및 포만감 유지</p> 
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100">
             <h3 className="font-bold text-green-600 mb-2">P: Protein</h3>
             <p className="text-gray-600">하루 100g 단백질, 4회 분할 섭취로 근손실 방어</p> 
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100">
             <h3 className="font-bold text-purple-600 mb-2">S: Strength</h3>
             <p className="text-gray-600">대사 기관인 근육 지키기 (마이오카인 분비)</p> 
          </div>
        </section>

        {/* 부작용 SOS 모달 */}
        {selectedSos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="bg-white p-8 rounded-[32px] max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-red-600 mb-4">🩺 증상 자가 점검</h3>
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="font-bold text-gray-800 mb-1">"한 끼 양이 평소보다 많았나요?"</p> [cite: 8]
                  <p className="text-sm text-gray-600">가이드: 소량씩 5~6회로 나누어 드세요.</p> [cite: 8]
                </div>
              </div>
              <button onClick={() => setSelectedSos(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">확인 완료</button>
            </div>
          </div>
        )}
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

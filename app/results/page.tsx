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
          <h1 className="text-3xl font-black text-gray-900">{userData.userName}님의 로드맵</h1>
          <p className="text-gray-500 mt-2">GPS 전략: {userData.budget} 맞춤형 가이드</p>
        </header>

        {/* 차트 섹션 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm mb-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black">대사 가교 시뮬레이션</h2>
            <button onClick={() => setSelectedSos('NAUSEA')} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold animate-pulse">
              ⚠️ 부작용 SOS
            </button>
          </div>
          <RoadmapChart data={result.roadmap} userData={userData} drugConfig={drugConfig} />
        </div>

        {/* 부작용 SOS 팝업 (시트 Side_Effect_SOS 반영) */}
        {selectedSos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-red-600 mb-4">부작용 자가 점검</h3>
              <p className="font-bold text-gray-800 mb-2">"한 끼 양이 평속보다 많았나요?" [cite: 8]</p>
              <p className="text-sm text-gray-600 mb-6">가이드: 소량씩 5~6회로 나누어 드세요. [cite: 8]</p>
              <button onClick={() => setSelectedSos(null)} className="w-full py-3 bg-gray-100 rounded-xl font-bold">닫기</button>
            </div>
          </div>
        )}

        {/* 하단 전략 카드 (시트 Strategy_Matrix 반영) */}
        <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-xl shadow-blue-100">
          <h3 className="text-lg font-bold mb-4">💡 {userData.budget} ROI 분석</h3>
          <p className="leading-relaxed opacity-90">
            {userData.budget === '표준형' 
              ? "월 5~10만 원의 HMB 투자가 근육 1kg을 사수하며, 이는 재투약 비용 200만 원을 아끼는 경제적 선택입니다. [cite: 9]"
              : "일상 활동량을 20% 늘려 기초대사량을 사수하고 약값 매몰을 방지하세요. [cite: 9]"}
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

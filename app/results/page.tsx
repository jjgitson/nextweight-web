// /app/results/page.tsx
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import DisclaimerModal from '../../components/DisclaimerModal';
import { DRUG_TYPES } from '../../lib/drug-config';
import { SIDE_EFFECT_GUIDE } from '../../lib/content';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [isAgreed, setIsAgreed] = useState(false);
  const [selectedSos, setSelectedSos] = useState<keyof typeof SIDE_EFFECT_GUIDE | null>(null);
  
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans print:bg-white print:pb-0">
      <DisclaimerModal isOpen={!isAgreed} onConfirm={() => setIsAgreed(true)} />
      
      <div className="max-w-4xl mx-auto pt-10 px-6 print:pt-0 print:px-0">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl mb-6 shadow-sm print:shadow-none print:border-gray-200">
              <h4 className="text-yellow-800 font-bold mb-1">📢 전문가 분석 조언</h4>
              <p className="text-yellow-900 font-medium leading-relaxed">{result.personalizedMessage}</p>
            </div>
            <h1 className="text-3xl font-black text-gray-900">{userData.userName}님의 대사 가교 리포트</h1>
          </div>
          <button onClick={handlePrint} className="print:hidden bg-gray-900 text-white px-5 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all">
            PDF 저장/인쇄
          </button>
        </header>

        {/* 차트 섹션 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm mb-8 relative print:shadow-none print:border print:border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black">체중 변화 및 용량 로드맵</h2>
            <div className="flex gap-2 print:hidden">
              <button onClick={() => setSelectedSos('NAUSEA')} className="text-[10px] bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold border border-red-100">오심 SOS</button>
              <button onClick={() => setSelectedSos('CONSTIPATION')} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold border border-blue-100">변비 SOS</button>
            </div>
          </div>
          <RoadmapChart data={result.roadmap} userData={userData} drugConfig={drugConfig} />
        </div>

        {/* GPS 전략 그리드 */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 print:border-gray-200">
             <h3 className="font-bold text-blue-600 mb-2">G: Drug ({drugConfig.name})</h3>
             <p className="text-xs text-gray-600 leading-relaxed">투약 궤도에 따른 포만감 유지 및 대사 가교 형성</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 print:border-gray-200">
             <h3 className="font-bold text-green-600 mb-2">P: Protein (100g)</h3>
             <p className="text-xs text-gray-600 leading-relaxed">골격근 보호를 위한 단백질 분할 섭취 전략</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 print:border-gray-200">
             <h3 className="font-bold text-purple-600 mb-2">S: Strength (주 3회)</h3>
             <p className="text-xs text-gray-600 leading-relaxed">대사 기관인 근육 활성화를 통한 요요 원천 차단</p>
          </div>
        </section>

        {/* 부작용 SOS 모달 */}
        {selectedSos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 print:hidden">
            <div className="bg-white p-8 rounded-[32px] max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-red-600 mb-4">🩺 {SIDE_EFFECT_GUIDE[selectedSos].title}</h3>
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="font-bold text-gray-800 mb-1">"{SIDE_EFFECT_GUIDE[selectedSos].check}"</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{SIDE_EFFECT_GUIDE[selectedSos].action}</p>
                </div>
                <p className="text-[10px] text-gray-400 text-center italic">근거: {SIDE_EFFECT_GUIDE[selectedSos].ref}</p>
              </div>
              <button onClick={() => setSelectedSos(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold">확인 완료</button>
            </div>
          </div>
        )}

        <footer className="text-center text-[10px] text-gray-400 mt-10 print:mt-20">
          본 리포트는 임상 데이터를 기반으로 한 시뮬레이션이며, 실제 투약 및 처방은 반드시 전문의와 상의하십시오.
        </footer>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">리포트 생성 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

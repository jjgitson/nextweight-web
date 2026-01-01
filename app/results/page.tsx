// /app/results/page.tsx
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap, UserData } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import DisclaimerModal from '../../components/DisclaimerModal';
import { DRUG_TYPES } from '../../lib/drug-config';
import { SIDE_EFFECT_GUIDE } from '../../lib/content';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [isAgreed, setIsAgreed] = useState(false);
  const [selectedSos, setSelectedSos] = useState<keyof typeof SIDE_EFFECT_GUIDE | null>(null);
  
  // ✅ [빌드 에러 해결] 모든 필드를 searchParams에서 읽어와 UserData 타입 충족
  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    drugType: (searchParams.get('drugType') as keyof typeof DRUG_TYPES) || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    duration: searchParams.get('duration') || '사용 전',
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '1-2회',
    budget: searchParams.get('budget') || '표준형',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const drugConfig = DRUG_TYPES[userData.drugType];
  const result = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans print:bg-white print:pb-0">
      <DisclaimerModal isOpen={!isAgreed} onConfirm={() => setIsAgreed(true)} />
      
      <div className="max-w-4xl mx-auto pt-10 px-6 print:pt-0 print:px-0">
        <header className="mb-10">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-l-8 border-blue-600 mb-8">
            <h4 className="text-blue-600 font-black mb-2 uppercase tracking-widest text-xs">Personalized Analysis</h4>
            <p className="text-xl font-bold text-slate-800 leading-snug">{result.personalizedMessage}</p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tight">Next Weight Lab</h1>
          <p className="text-slate-500 mt-2 font-bold">비싼 다이어트가 요요로 끝나지 않도록.</p>
        </header>

        {/* GPS 전략 카드 */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
             <h3 className="font-black text-blue-600 mb-2">G: Drug</h3>
             <p className="text-xs text-slate-600 leading-relaxed">호르몬 모방을 통한 식욕 조절과 포만감 유지</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
             <h3 className="font-black text-green-600 mb-2">P: Protein</h3>
             <p className="text-xs text-slate-600 leading-relaxed">하루 100g 단백질, 4회 분할 섭취로 근손실 방어</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
             <h3 className="font-black text-purple-600 mb-2">S: Strength</h3>
             <p className="text-xs text-slate-600 leading-relaxed">대사 기관으로서의 근육 지키기 (마이오카인 분비)</p>
          </div>
        </section>

        {/* 차트 섹션 */}
        <div className="bg-white p-8 rounded-[50px] shadow-sm mb-10 relative print:shadow-none border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-8 px-2">대사 가교 시뮬레이션</h2>
          <RoadmapChart data={result.roadmap} userData={userData} drugConfig={drugConfig} />
        </div>

        {/* ROI 가치 제안 (Strategy Matrix) */}
        <div className="bg-slate-900 text-white p-10 rounded-[50px] shadow-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-yellow-400">💰</span> {userData.budget} ROI 분석
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="text-xs opacity-50 font-bold">핵심 인터벤션</div>
              <p className="text-lg font-medium">
                {userData.budget === '표준형' ? "HMB 3g + 유청 단백질 병행 (근손실 방어)" : "일상 활동량 20% 강제 증가 (자가 대사 활성화)"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs opacity-50 font-bold">경제적 가치 (Value)</div>
              <p className="text-lg font-bold text-yellow-400">
                {userData.budget === '표준형' ? "재투약 비용 200만 원 절감 (근육 1kg 사수 시)" : "추가 지출 0원으로 약값 매몰 방지"}
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center text-[10px] text-slate-400 mt-20">
          본 리포트는 임상 데이터와 전문가 가이드에 기반한 시뮬레이션 정보 도구입니다.
        </footer>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400">Next Weight 로드맵 분석 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

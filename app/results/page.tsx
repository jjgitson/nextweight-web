// app/results/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap, UserData } from '../../lib/roadmap-engine';
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
    mainConcern: searchParams.get('mainConcern') || '요요',
  };

  const { advice, roadmap, drugName } = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-10">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight italic">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold">비싼 다이어트가 요요로 끝나지 않도록.</p>
        </header>

        {/* [Message Library] 맞춤 조언 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-l-8 border-blue-600">
          <h3 className="text-blue-600 font-black mb-2 uppercase tracking-widest text-sm">Personalized Analysis</h3>
          <p className="text-xl font-bold text-slate-800 leading-snug">{advice}</p>
        </div>

        {/* GPS 로드맵 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-black text-blue-600 mb-2">G: Drug</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{drugName}를 통한 호르몬 모방 및 식욕 조절</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-black text-green-600 mb-2">P: Protein</h4>
            <p className="text-sm text-slate-600 leading-relaxed">하루 100g 단백질, 4회 분할 섭취로 근손실 방어</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-black text-purple-600 mb-2">S: Strength</h4>
            <p className="text-sm text-slate-600 leading-relaxed">대사 기관인 근육 활성화를 통한 요요 원천 차단</p>
          </div>
        </div>

        {/* 대사 가교 시뮬레이션 차트 */}
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">대사 가교 시뮬레이션</h2>
            <div className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-400">Clinical Data Based</div>
          </div>
          <RoadmapChart data={roadmap} userData={userData} drugConfig={DRUG_TYPES[userData.drugType]} />
        </div>

        {/* [Strategy_Matrix] ROI 가치 제안 */}
        <div className="bg-slate-900 text-white p-10 rounded-[50px] shadow-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-yellow-400">💰</span> {userData.budget} 등급 ROI 분석
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-xs opacity-50 mb-1">핵심 인터벤션</div>
              <p className="text-lg font-medium">
                {userData.budget === '표준형' ? "HMB 3g + 유청 단백질 병행" : "일상 활동량 20% 강제 증가"}
              </p>
            </div>
            <div>
              <div className="text-xs opacity-50 mb-1">경제적 가치 (Value)</div>
              <p className="text-lg font-medium text-yellow-400">
                {userData.budget === '표준형' ? "근육 1kg 사수 시 재투약 비용 200만 원 절감" : "추가 지출 0원으로 약값 매몰 방지"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400">Next Weight 로직 분석 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

// /app/results/page.tsx
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
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    drugType: (searchParams.get('drugType') as keyof typeof DRUG_TYPES) || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    duration: searchParams.get('duration') || '0',
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '안 함',
    budget: searchParams.get('budget') || '표준형',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const drugConfig = DRUG_TYPES[userData.drugType];
  const { advice, roadmap, drugName } = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold mt-2">비싼 다이어트가 요요로 끝나지 않도록. </p>
        </header>

        {/* GPS 전략 카드  */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
            <h4 className="font-black text-blue-600 mb-2">G: Drug</h4>
            <p className="text-xs text-slate-600 leading-relaxed">호르몬 모방을 통한 식욕 조절과 포만감 유지 </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
            <h4 className="font-black text-green-600 mb-2">P: Protein</h4>
            <p className="text-xs text-slate-600 leading-relaxed">하루 100g 단백질, 4회 분할 섭취로 근손실 방어 </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
            <h4 className="font-black text-purple-600 mb-2">S: Strength</h4>
            <p className="text-xs text-slate-600 leading-relaxed">대사 기관인 근육 지키기 (요요 방지의 실질적 동력) </p>
          </div>
        </section>

        {/* [에러 수정된 차트 섹션] 필수 Props인 userData와 drugConfig 전달 */}
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Metabolic Bridge Simulation</h2>
          <RoadmapChart data={roadmap} userData={userData} drugConfig={drugConfig} />
        </div>

        {/* [Strategy Matrix] ROI 가치 분석  */}
        <div className="bg-slate-900 text-white p-10 rounded-[50px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">💰 {userData.budget} ROI 분석</h3>
          <p className="text-yellow-400 font-bold text-lg leading-snug">
            {userData.budget === '표준형' 
              ? "월 5~10만 원 투자가 근육 1kg 사수 → 재투약 비용 200만 원 절감 " 
              : "추가 지출 0원으로 기초대사량 하한선 사수, 약값 매몰 방지 "}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="p-20 text-center font-bold">데이터 분석 중...</div>}><ResultsContent /></Suspense>;
}

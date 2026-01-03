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
    currentWeek: Number(searchParams.get('currentWeek')) || 0,
    startWeightBeforeDrug: Number(searchParams.get('startWeightBeforeDrug')) || 80,
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '안 함',
    budget: searchParams.get('budget') || '표준형',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const { performance, roadmap, drugName } = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-3xl font-black italic text-slate-900 tracking-tighter">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold tracking-tight">비싼 다이어트가 요요로 끝나지 않도록.</p>
        </header>

        {/* 임상 성취도 대조 섹션 */}
        {performance && (
          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-lg">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">📊 임상 데이터 분석</h3>
            <p className="text-lg opacity-90 leading-relaxed font-medium">
              {userData.userName}님은 임상 평균({performance.clinicalAvg}%) 대비 <strong>{performance.status}</strong> 상태입니다. 
              평균보다 {Math.abs(Number(performance.weightDiff))}kg {Number(performance.weightDiff) <= 0 ? '더 감량' : '덜 감량'} 하셨습니다.
            </p>
          </div>
        )}

        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Metabolic Bridge Simulation</h2>
          <RoadmapChart data={roadmap} userData={userData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm">
            <h3 className="text-xl font-black mb-4">🥩 영양 전략 (Protein)</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">매 끼니 단백질(계란, 닭가슴살 등)을 먼저 섭취하여 근손실을 방어하세요. 하루 100g 단백질 섭취가 핵심입니다.</p>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 font-bold">수분 2L & 단백질 4회 분할 섭취</div>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm">
            <h3 className="text-xl font-black mb-4">🏋️ 운동 전략 (Strength)</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">근육은 스스로 에너지를 태우는 내분비 기관입니다. 주 2~3회 저항성 운동은 요요를 막는 가장 강력한 방패입니다.</p>
            <div className="bg-purple-50 p-4 rounded-2xl text-purple-700 font-bold">주 2~3회 근력 운동 필수</div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[50px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">💰 ROI 분석</h3>
          <p className="text-yellow-400 font-bold text-lg leading-snug">
            {userData.budget === '표준형' 
              ? "월 5~10만 원 투자가 근육 1kg 사수 → 재투약 비용 200만 원 절감" 
              : "추가 지출 0원, 기초대사량 사수로 약값 매몰 방지"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="p-20 text-center font-bold">분석 중...</div>}><ResultsContent /></Suspense>;
}

// /app/results/page.tsx
"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap, UserData } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import { DRUG_TYPES } from '../../lib/drug-config';

function ResultsContent() {
  const searchParams = useSearchParams();
  
  // ✅ 14개 필드 완벽 수용 (빌드 에러 해결)
  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    startWeightBeforeDrug: Number(searchParams.get('startWeightBeforeDrug')) || undefined,
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    drugType: (searchParams.get('drugType') as keyof typeof DRUG_TYPES) || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    duration: searchParams.get('duration') || '사용 전',
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '안 함',
    budget: searchParams.get('budget') || '표준형',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const { advice, clinicalStatus, roadmap, drugName } = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold mt-2">비싼 다이어트가 요요로 끝나지 않도록. [cite: 10]</p>
        </header>

        {/* 임상 성취도 분석 (사용 중인 경우 노출) */}
        {clinicalStatus && (
          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-lg">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">📊 임상 평균 성취도 분석</h3>
            <p className="text-lg opacity-95">
              {userData.userName}님은 투약 전 대비 <strong>{clinicalStatus.userPercent}%</strong> 감량하셨습니다.<br/>
              이는 동일 기간 {drugName} 임상 평균({clinicalStatus.clinicalPercent}%) 대비 
              <span className="font-black"> {clinicalStatus.label}</span> 상태입니다. 
            </p>
          </div>
        )}

        {/* [Message Library] 기반 ROI 조언 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-l-8 border-blue-600">
          <h4 className="text-blue-600 font-black mb-1 uppercase tracking-widest text-xs">Analysis Advice</h4>
          <p className="text-xl font-bold text-slate-800 leading-snug">{advice} [cite: 6]</p>
        </div>

        {/* GPS 전략 카드 [cite: 10] */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
            <h4 className="font-black text-blue-600 mb-2">G: GLP-1</h4>
            <p className="text-xs text-slate-600">호르몬 모방을 통한 식욕 조절과 포만감 유지</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
            <h4 className="font-black text-green-600 mb-2">P: Protein</h4>
            <p className="text-xs text-slate-600">하루 100g 단백질, 4회 분할 섭취로 근손실 방어</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
            <h4 className="font-black text-purple-600 mb-2">S: Strength</h4>
            <p className="text-xs text-slate-600">대사 기관인 근육 지키기 (요요 방지의 동력)</p>
          </div>
        </section>

        {/* 대사 가교 차트 */}
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Metabolic Bridge Simulation</h2>
          <RoadmapChart data={roadmap} isCurrentPatient={userData.drugStatus === '사용 중'} />
        </div>

        {/* [Strategy Matrix] ROI 가치 분석 [cite: 8] */}
        <div className="bg-slate-900 text-white p-10 rounded-[50px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">💰 {userData.budget} ROI 분석</h3>
          <div className="grid md:grid-cols-2 gap-8 text-sm">
            <div>
              <div className="opacity-50 mb-1 font-bold">핵심 인터벤션 (Action)</div>
              <p className="text-lg">{userData.budget === '표준형' ? "HMB 3g + 유청 단백질 병행" : "일상 활동량 20% 강제 증가"}</p>
            </div>
            <div>
              <div className="opacity-50 mb-1 font-bold">경제적 가치 (Value)</div>
              <p className="text-lg text-yellow-400 font-bold">
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
  return <Suspense fallback={<div className="p-20 text-center font-bold">분석 중...</div>}><ResultsContent /></Suspense>;
}

// /app/results/page.tsx (핵심 부분)
import { generatePersonalizedAnalysis } from '../../lib/roadmap-engine';

function ResultsContent() {
  // ... (userData 수집 로직)
  const analysis = generatePersonalizedAnalysis(userData);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-[50px] shadow-sm">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-black italic">Next Weight Lab</h1>
        <p className="text-slate-500 font-bold">Metabolic Bridge Analysis</p>
      </header>

      {/* 현재 스테이지 카드 */}
      <div className="bg-blue-50 p-8 rounded-[40px] mb-8 text-center border border-blue-100">
        <div className="text-3xl mb-2">{analysis.currentStage.icon}</div>
        <p className="text-lg font-bold text-blue-900 mb-1">
          현재 {userData.userName}님은 <span className="text-blue-600">{analysis.currentStage.name}</span> 단계에 위치해 있습니다.
        </p>
        <p className="text-sm text-blue-700 font-medium">{analysis.comparisonMsg}</p>
      </div>

      <RoadmapChart userData={userData} analysis={analysis} />

      {/* 비의료 안전 문구 고정 */}
      <footer className="mt-16 pt-8 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-[10px] leading-relaxed">
          본 차트는 임상 연구 평균값과 개인 기록을 비교해 보여주는 자기관리용 정보 도구입니다. 의료적 판단이나 처방을 제공하지 않습니다.
        </p>
      </footer>
    </div>
  );
}

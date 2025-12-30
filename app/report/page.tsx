import RoadmapChart from '@/components/RoadmapChart';
import HmbGuideSection from '@/components/HmbGuideSection';

export default function ReportPage({ resultData }: { resultData: any }) {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">나의 맞춤형 관리 리포트</h1>
      
      {/* 그래프 섹션 */}
      <RoadmapChart data={resultData.roadmap} drugName={resultData.drugName} />
      
      {/* 논리적 근거 섹션 (HMB 가이드) */}
      <HmbGuideSection />
      
      {/* 하단 면책 조항 */}
      <p className="mt-10 text-xs text-gray-400 text-center">
        본 리포트는 비의료 건강관리 서비스의 일환으로 제공됩니다.
      </p>
    </div>
  );
}

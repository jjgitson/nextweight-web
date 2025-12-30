// /app/results/page.tsx
"use client";

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap } from '@/lib/roadmap-engine';
import { HMB_GUIDE_CONTENT } from '@/lib/content';
import RoadmapChart from '@/components/RoadmapChart';
import DisclaimerModal from '@/components/DisclaimerModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [isAgreed, setIsAgreed] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const userData = {
    drugType: (searchParams.get('drugType') as 'SEMAGLUTIDE' | 'TIRZEPATIDE') || 'TIRZEPATIDE',
    currentDose: parseFloat(searchParams.get('currentDose') || '2.5'),
    age: parseInt(searchParams.get('age') || '30'),
    gender: (searchParams.get('gender') as 'male' | 'female') || 'male',
    weight: parseFloat(searchParams.get('weight') || '0'),
  };

  const result = generatePersonalizedRoadmap(userData);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`NextWeight_Report_${result.drugName}.pdf`);
    } catch (error) {
      alert('PDF 생성 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DisclaimerModal isOpen={!isAgreed} onConfirm={() => setIsAgreed(true)} />
      <div ref={reportRef} className="max-w-5xl mx-auto pt-12 px-6 bg-gray-50">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Personalized Roadmap</h1>
          <p className="text-gray-600 text-lg">{result.drugName} 관리를 위한 데이터 기반 경로입니다.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <RoadmapChart data={result.roadmap} drugName={result.drugName} />
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center">🧪 {HMB_GUIDE_CONTENT.title}</h2>
              <div className="space-y-6 text-sm">
                {HMB_GUIDE_CONTENT.sections.map(s => (
                  <div key={s.id} className="border-b border-blue-800 pb-4 last:border-0">
                    <h4 className="font-bold text-blue-300 mb-2">{s.subtitle}</h4>
                    <p className="text-blue-100 leading-relaxed opacity-90">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleDownloadPDF} className="w-full py-5 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center">
              📄 PDF 다운로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">리포트를 생성 중입니다...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

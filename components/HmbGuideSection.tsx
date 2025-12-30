// /components/HmbGuideSection.tsx
import { HMB_GUIDE_CONTENT } from '../lib/content';

export default function HmbGuideSection() {
  return (
    <section className="mt-12 p-8 bg-blue-50 rounded-2xl border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
        <span className="mr-2">🧪</span> {HMB_GUIDE_CONTENT.title}
      </h2>
      
      <div className="space-y-8">
        {HMB_GUIDE_CONTENT.sections.map((section) => (
          <div key={section.id}>
            <h3 className="text-lg font-bold text-blue-800 mb-2">{section.subtitle}</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {section.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200 text-sm text-blue-600 font-semibold text-center">
        NextWeight Lab은 과학적 근거를 바탕으로 건강한 유지 관리를 돕습니다.
      </div>
    </section>
  );
}

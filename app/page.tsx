// /app/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import OnboardingForm from '../components/OnboardingForm';

export default function Home() {
  const router = useRouter();

  const handleOnboardingComplete = (data: any) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="py-24 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight">Next Weight Lab</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          비싼 다이어트가 요요로 끝나지 않도록.<br/>
          <strong>GPS(Drug, Protein, Strength)</strong> 전략으로 대사 가교를 설계하세요.
        </p>
      </section>
      <section className="pb-32 px-6">
        <OnboardingForm onComplete={handleOnboardingComplete} />
      </section>
    </main>
  );
}

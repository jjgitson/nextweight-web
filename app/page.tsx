"use client";

import { useRouter } from 'next/navigation';
import OnboardingForm from '@/components/OnboardingForm';

export default function Home() {
  const router = useRouter();

  const handleOnboardingComplete = (data: any) => {
    const params = new URLSearchParams({
      drugType: data.drugType,
      currentDose: data.currentDose,
      age: data.age,
      gender: data.gender,
      weight: data.weight
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="py-20 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Next Weight Lab</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          터제타파이드 및 세마글루타이드 치료 후의 삶을 설계합니다.<br/>
          과학적 근거에 기반한 <strong>대사 가교(Metabolic Bridge)</strong> 로드맵을 확인하세요.
        </p>
      </section>
      <section className="pb-20 px-6">
        <OnboardingForm onComplete={handleOnboardingComplete} />
      </section>
    </main>
  );
}
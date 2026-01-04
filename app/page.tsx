'use client';

import { useRouter } from 'next/navigation';
import OnboardingForm, { type FormData } from '@/components/OnboardingForm';

function toQuery(data: FormData) {
  const sp = new URLSearchParams();

  // Basic
  if (data.userName) sp.set('userName', data.userName);
  if (data.userAge !== undefined && data.userAge !== null) sp.set('userAge', String(data.userAge));
  if (data.userGender) sp.set('userGender', data.userGender);
  if (data.exercise) sp.set('exercise', data.exercise);
  if (data.muscleMass) sp.set('muscleMass', data.muscleMass);
  if (data.budget) sp.set('budget', data.budget);

  // Weight
  if (data.currentWeight !== undefined && data.currentWeight !== null) sp.set('currentWeight', String(data.currentWeight));
  if (data.targetWeight !== undefined && data.targetWeight !== null) sp.set('targetWeight', String(data.targetWeight));

  // Drug
  if (data.drugStatus) sp.set('drugStatus', data.drugStatus);
  if (data.drugType) sp.set('drugType', data.drugType);
  if (data.startWeightBeforeDrug !== undefined && data.startWeightBeforeDrug !== null) {
    sp.set('startWeightBeforeDrug', String(data.startWeightBeforeDrug));
  }
  if (data.currentDose) sp.set('currentDose', String(data.currentDose));
  if (data.startDate) sp.set('startDate', data.startDate);
  if (data.currentWeek !== undefined && data.currentWeek !== null) sp.set('currentWeek', String(data.currentWeek));

  // Concern
  if (data.mainConcern) sp.set('mainConcern', data.mainConcern);
  if (data.resolution) sp.set('resolution', data.resolution);

  return sp;
}

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50">
      <OnboardingForm
        onComplete={(data) => {
          const sp = toQuery(data);
          router.push(`/results?${sp.toString()}`);
        }}
      />
    </main>
  );
}

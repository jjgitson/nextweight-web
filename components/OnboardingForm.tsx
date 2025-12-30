// /components/OnboardingForm.tsx
"use client";

import { useState } from 'react';
import { DRUG_TYPES } from '../lib/drug-config';

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    drugType: 'TIRZEPATIDE' as keyof typeof DRUG_TYPES,
    currentDose: 2.5,
    age: 35,
    gender: 'male',
    weight: 70
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700">사용 중인 약물</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(DRUG_TYPES).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormData({ ...formData, drugType: key as keyof typeof DRUG_TYPES, currentDose: value.steps[0] })}
              className={`p-4 rounded-xl font-bold transition-all ${
                formData.drugType === key 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-50 text-gray-500'
              }`}
            >
              {value.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700">현재 투여량 ({DRUG_TYPES[formData.drugType].unit})</label>
        <select 
          value={formData.currentDose}
          onChange={(e) => setFormData({ ...formData, currentDose: parseFloat(e.target.value) })}
          className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DRUG_TYPES[formData.drugType].steps.map(dose => (
            <option key={dose} value={dose}>{dose} {DRUG_TYPES[formData.drugType].unit}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all">
        로드맵 생성하기
      </button>
    </form>
  );
}
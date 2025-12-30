"use client";

import { useState } from 'react';
import { DRUG_TYPES } from '../lib/drug-config'; // 상대 경로 및 이름 일치

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    drugType: 'TIRZEPATIDE',
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
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
      <div className="space-y-4">
        <label className="block text-sm font-bold text-gray-700 ml-1">사용 중인 약물</label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(DRUG_TYPES).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormData({ ...formData, drugType: key, currentDose: value.steps[0] })}
              className={`py-4 px-6 rounded-2xl font-bold transition-all ${
                formData.drugType === key 
                ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {value.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-bold text-gray-700 ml-1">현재 투여량 ({DRUG_TYPES[formData.drugType as keyof typeof DRUG_TYPES].unit})</label>
        <select 
          value={formData.currentDose}
          onChange={(e) => setFormData({ ...formData, currentDose: parseFloat(e.target.value) })}
          className="w-full p-4 bg-gray-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-500"
        >
          {DRUG_TYPES[formData.drugType as keyof typeof DRUG_TYPES].steps.map(dose => (
            <option key={dose} value={dose}>{dose} {DRUG_TYPES[formData.drugType as keyof typeof DRUG_TYPES].unit}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl text-lg">
        로드맵 생성하기
      </button>
    </form>
  );
}
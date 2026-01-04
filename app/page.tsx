"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();

  const [form, setForm] = useState({
    userName: "",
    userAge: "",
    userGender: "여성",
    exercise: "안 함",
    muscleMass: "모름",
    budget: "표준형",

    currentWeight: "",
    targetWeight: "",

    drugStatus: "사용 전",
    drugType: "MOUNJARO",
    currentDose: "",
    startWeightBeforeDrug: "",
    startDate: "",
    currentWeek: "",

    mainConcern: "요요",
    resolution: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const q = new URLSearchParams(form as any).toString();
    router.push(`/results?${q}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Next Weight Lab</h1>

        {/* 기본 정보 */}
        <section className="bg-white p-6 rounded-3xl shadow border">
          <h2 className="font-black mb-4">기본 정보</h2>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="성함" className="input" onChange={(e) => update("userName", e.target.value)} />
            <input placeholder="나이" className="input" onChange={(e) => update("userAge", e.target.value)} />
            <select className="input" onChange={(e) => update("userGender", e.target.value)}>
              <option>여성</option>
              <option>남성</option>
            </select>
            <select className="input" onChange={(e) => update("exercise", e.target.value)}>
              <option>안 함</option>
              <option>주 1~2회</option>
              <option>주 3회 이상</option>
            </select>
          </div>
        </section>

        {/* 체중 정보 */}
        <section className="bg-emerald-50 p-6 rounded-3xl shadow border">
          <h2 className="font-black mb-4">체중 정보</h2>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="현재 체중 (kg)" className="input" onChange={(e) => update("currentWeight", e.target.value)} />
            <input placeholder="목표 체중 (kg)" className="input" onChange={(e) => update("targetWeight", e.target.value)} />
          </div>
        </section>

        {/* 투약 정보 */}
        <section className="bg-sky-50 p-6 rounded-3xl shadow border">
          <h2 className="font-black mb-4">투약 정보</h2>
          <div className="grid grid-cols-2 gap-3">
            <select className="input" onChange={(e) => update("drugStatus", e.target.value)}>
              <option>사용 전</option>
              <option>증량/유지기</option>
              <option>테이퍼링기</option>
              <option>중단 후</option>
            </select>
            <select className="input" onChange={(e) => update("drugType", e.target.value)}>
              <option value="MOUNJARO">마운자로</option>
              <option value="WEGOVY">위고비</option>
            </select>
            <input placeholder="현재 용량 (mg)" className="input" onChange={(e) => update("currentDose", e.target.value)} />
            <input placeholder="투약 시작 전 체중" className="input" onChange={(e) => update("startWeightBeforeDrug", e.target.value)} />
            <input type="date" className="input col-span-2" onChange={(e) => update("startDate", e.target.value)} />
            <input placeholder="현재 몇 주차인지" className="input col-span-2" onChange={(e) => update("currentWeek", e.target.value)} />
          </div>
        </section>

        {/* 예산 & 우선순위 */}
        <section className="bg-amber-50 p-6 rounded-3xl shadow border">
          <h2 className="font-black mb-2">관리 예산</h2>
          <p className="text-sm text-slate-600 mb-3">
            GLP-1은 비용이 큰 다이어트입니다. 예산에 맞게 효율적인 전략이 필요하며,
            사용자마다 관리 범위가 달라 3가지 예산 범주로 표현했습니다.
          </p>
          <select className="input mb-4" onChange={(e) => update("budget", e.target.value)}>
            <option>실속형</option>
            <option selected>표준형</option>
            <option>집중형</option>
          </select>

          <h2 className="font-black mb-2">다이어트 고민</h2>
          <select className="input mb-3" onChange={(e) => update("mainConcern", e.target.value)}>
            <option>요요</option>
            <option>근손실</option>
            <option>체중 정체</option>
          </select>

          <textarea
            placeholder="이번 다이어트에 대한 각오를 적어주세요"
            className="input h-20"
            onChange={(e) => update("resolution", e.target.value)}
          />
        </section>

        <button
          onClick={submit}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg"
        >
          무료 GPS 로드맵 생성
        </button>
      </div>

      <style jsx global>{`
        .input {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
      `}</style>
    </div>
  );
}

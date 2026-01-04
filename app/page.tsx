// /app/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/OnboardingForm";

function toQuery(data: any) {
  const sp = new URLSearchParams();

  // 기본 정보
  if (data.userName) sp.set("userName", String(data.userName));
  if (data.userAge !== undefined && data.userAge !== null) sp.set("userAge", String(data.userAge));
  if (data.userGender) sp.set("userGender", String(data.userGender));

  // 체중 정보
  if (data.currentWeight !== undefined && data.currentWeight !== null) sp.set("currentWeight", String(data.currentWeight));
  if (data.targetWeight !== undefined && data.targetWeight !== null) sp.set("targetWeight", String(data.targetWeight));

  // 투약 정보
  // 내부 엔진 표준 값으로 변환
  // - drugStatus: "사용 전"|"사용 중" -> "PRE"|"ON"
  // - drugType: "NONE"도 명시해 두어 results에서 검증 로직(시작 체중 필요 여부)을 정확히 판단할 수 있게 함
  if (data.drugStatus) {
    const v = String(data.drugStatus);
    sp.set("drugStatus", v === "사용 중" ? "ON" : v === "사용 전" ? "PRE" : v);
  }
  if (data.drugType) sp.set("drugType", String(data.drugType));

  // 이 키가 results/page.tsx에서 사용됩니다
  if (data.startWeightBeforeDrug !== undefined && data.startWeightBeforeDrug !== null) {
    sp.set("startWeightBeforeDrug", String(data.startWeightBeforeDrug));
  }

  if (data.currentDose !== undefined && data.currentDose !== null) {
    sp.set("currentDose", String(data.currentDose));
  }

  if (data.currentWeek !== undefined && data.currentWeek !== null) {
    sp.set("currentWeek", String(data.currentWeek));
  }

  // startDate는 ""일 수 있어서, 값이 있을 때만
  if (data.startDate) sp.set("startDate", String(data.startDate));
  if (data.weekMode) sp.set("weekMode", String(data.weekMode));

  // 기타 입력
  if (data.budget) sp.set("budget", String(data.budget));
  if (data.muscleMass) sp.set("muscleMass", String(data.muscleMass));
  if (data.exercise) sp.set("exercise", String(data.exercise));
  // form에서는 concern 키를 사용
  if (data.mainConcern || data.concern) sp.set("mainConcern", String(data.mainConcern ?? data.concern));
  if (data.resolution) sp.set("resolution", String(data.resolution));

  return sp.toString();
}

export default function Page() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-5 py-10 md:py-14 space-y-8">
        <header className="space-y-3">
          <div className="text-[28px] md:text-[34px] font-black tracking-tight text-slate-900">
            Next Weight Lab
          </div>
          <div className="text-slate-600 leading-relaxed">
            비싼 다이어트가 요요로 끝나지 않도록.
            <br />
            GPS(Drug, Protein, Strength) 전략으로 대사 가교를 설계하세요.
          </div>
        </header>

        <OnboardingForm
          onComplete={(data: any) => {
            try {
              localStorage.setItem("userData", JSON.stringify(data));
            } catch {
              // localStorage 실패는 무시 (페이지 이동은 계속)
            }

            const qs = toQuery(data);
            router.push(`/results${qs ? `?${qs}` : ""}`);
          }}
        />
      </div>
    </main>
  );
}

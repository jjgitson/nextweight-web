// /components/OnboardingForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type DrugType = "MOUNJARO" | "WEGOVY";
type DrugStatus = "사용 전" | "사용 중";

export type FormData = {
  userName: string;
  userAge: number;
  userGender: "여성" | "남성";
  exercise: "안 함" | "1-2회" | "3-4회" | "5회+";
  muscleMass: "모름" | "이하" | "표준" | "이상";
  budget: "실속형" | "표준형" | "집중형";

  currentWeight: number;
  targetWeight: number;

  drugStatus: DrugStatus;
  drugType: DrugType;
  startWeight?: number;
  currentDose?: string;
  startDate?: string;
  currentWeek: number;

  mainConcern: string;
  commitment: string;
};

type Props = {
  onSubmit: (data: FormData) => void;
};

function safeNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function weekFromStartDate(startDate?: string) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 0;
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // 시작일부터 1주차로 보는 방식
  const w = Math.floor(diffDays / 7) + 1;
  return Math.max(0, w);
}

const DOSE_OPTIONS: Record<DrugType, { label: string; value: string }[]> = {
  MOUNJARO: [
    { label: "2.5 mg", value: "2.5" },
    { label: "5 mg", value: "5" },
    { label: "7.5 mg", value: "7.5" },
    { label: "10 mg", value: "10" },
    { label: "12.5 mg", value: "12.5" },
    { label: "15 mg", value: "15" },
  ],
  WEGOVY: [
    { label: "0.25 mg", value: "0.25" },
    { label: "0.5 mg", value: "0.5" },
    { label: "1.0 mg", value: "1" },
    { label: "1.7 mg", value: "1.7" },
    { label: "2.4 mg", value: "2.4" },
  ],
};

export default function OnboardingForm({ onSubmit }: Props) {
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState<number>(35);
  const [userGender, setUserGender] = useState<"여성" | "남성">("여성");
  const [exercise, setExercise] = useState<FormData["exercise"]>("안 함");
  const [muscleMass, setMuscleMass] = useState<FormData["muscleMass"]>("모름");
  const [budget, setBudget] = useState<FormData["budget"]>("표준형");

  const [currentWeight, setCurrentWeight] = useState<number>(80);
  const [targetWeight, setTargetWeight] = useState<number>(65);

  const [drugStatus, setDrugStatus] = useState<DrugStatus>("사용 전");
  const [drugType, setDrugType] = useState<DrugType>("MOUNJARO");
  const [startWeight, setStartWeight] = useState<number>(80);

  const [currentDose, setCurrentDose] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [weekMode, setWeekMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [currentWeekManual, setCurrentWeekManual] = useState<number>(1);

  const [mainConcern, setMainConcern] = useState<string>("요요");
  const [commitment, setCommitment] = useState<string>("");

  const autoWeek = useMemo(() => weekFromStartDate(startDate || undefined), [startDate]);

  useEffect(() => {
    if (weekMode === "AUTO") {
      setCurrentWeekManual(autoWeek || 1);
    }
  }, [autoWeek, weekMode]);

  useEffect(() => {
    const opts = DOSE_OPTIONS[drugType];
    if (!opts?.length) return;
    const exists = opts.some((o) => o.value === currentDose);
    if (!exists) setCurrentDose(opts[opts.length - 1].value);
  }, [drugType]);

  useEffect(() => {
    if (drugStatus === "사용 전") {
      setCurrentDose("");
      setStartDate("");
      setWeekMode("MANUAL");
      setCurrentWeekManual(1);
    } else {
      setWeekMode("AUTO");
    }
  }, [drugStatus]);

  const doseSelectOptions = DOSE_OPTIONS[drugType] ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: FormData = {
      userName: userName.trim(),
      userAge: safeNumber(userAge, 35),
      userGender,
      exercise,
      muscleMass,
      budget,

      currentWeight: safeNumber(currentWeight, 80),
      targetWeight: safeNumber(targetWeight, 65),

      drugStatus,
      drugType,
      startWeight: safeNumber(startWeight, safeNumber(currentWeight, 80)),
      currentDose: drugStatus === "사용 중" ? (currentDose || undefined) : undefined,
      startDate: drugStatus === "사용 중" ? (startDate || undefined) : undefined,
      currentWeek: drugStatus === "사용 중" ? safeNumber(currentWeekManual, 1) : 0,

      mainConcern,
      commitment: commitment.trim(),
    };

    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
          Next Weight Lab
        </h1>
        <p className="text-lg md:text-xl text-slate-700">
          비싼 다이어트가 요요로 끝나지 않도록.
          <br />
          <span className="font-semibold text-slate-900">GPS(Drug, Protein, Strength)</span>{" "}
          전략으로 대사 가교를 설계하세요.
        </p>
      </div>

      {/* 기본 정보 */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">기본 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <div className="text-sm text-slate-700">성함</div>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="예: 서진원"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">나이</div>
            <input
              value={userAge}
              onChange={(e) => setUserAge(safeNumber(e.target.value, 35))}
              inputMode="numeric"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">성별</div>
            <select
              value={userGender}
              onChange={(e) => setUserGender(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="여성">여성</option>
              <option value="남성">남성</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">주간 운동 빈도</div>
            <select
              value={exercise}
              onChange={(e) => setExercise(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="안 함">안 함</option>
              <option value="1-2회">1-2회</option>
              <option value="3-4회">3-4회</option>
              <option value="5회+">5회+</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">골격근량</div>
            <select
              value={muscleMass}
              onChange={(e) => setMuscleMass(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="모름">모름</option>
              <option value="이하">이하</option>
              <option value="표준">표준</option>
              <option value="이상">이상</option>
            </select>
          </label>

          <div className="space-y-2">
            <div className="text-sm text-slate-700">다이어트 관리 예산</div>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="실속형">실속형</option>
              <option value="표준형">표준형</option>
              <option value="집중형">집중형</option>
            </select>
            <p className="text-sm text-slate-600 leading-relaxed">
              GLP-1은 비용이 큰 다이어트입니다. 예산에 맞게 효율적인 전략이 필요하며, 사용자마다 관리 범위가 달라 3가지 예산
              범주로 표현했습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 체중 정보 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">체중 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <div className="text-sm text-slate-700">현재 체중 (kg)</div>
            <input
              value={currentWeight}
              onChange={(e) => setCurrentWeight(safeNumber(e.target.value, 80))}
              inputMode="decimal"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">목표 체중 (kg)</div>
            <input
              value={targetWeight}
              onChange={(e) => setTargetWeight(safeNumber(e.target.value, 65))}
              inputMode="decimal"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
      </section>

      {/* 투약 정보 */}
      <section className="rounded-3xl border border-slate-200 bg-amber-50 p-5 md:p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">투약 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-slate-700">투약 상태</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDrugStatus("사용 전")}
                className={`px-4 py-2 rounded-2xl border ${
                  drugStatus === "사용 전"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-900 border-slate-200"
                }`}
              >
                사용 전
              </button>
              <button
                type="button"
                onClick={() => setDrugStatus("사용 중")}
                className={`px-4 py-2 rounded-2xl border ${
                  drugStatus === "사용 중"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-900 border-slate-200"
                }`}
              >
                사용 중
              </button>
            </div>
          </div>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">약물 선택</div>
            <select
              value={drugType}
              onChange={(e) => setDrugType(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="MOUNJARO">마운자로</option>
              <option value="WEGOVY">위고비</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">투약 전 시작 체중 (kg)</div>
            <input
              value={startWeight}
              onChange={(e) => setStartWeight(safeNumber(e.target.value, safeNumber(currentWeight, 80)))}
              inputMode="decimal"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">현재 투약 용량</div>
            <select
              value={currentDose}
              onChange={(e) => setCurrentDose(e.target.value)}
              disabled={drugStatus !== "사용 중"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            >
              <option value="">{drugStatus === "사용 중" ? "선택" : "사용 전"}</option>
              {doseSelectOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-600">약물 기준으로 용량 단계를 선택하세요.</div>
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">투약 시작일</div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={drugStatus !== "사용 중"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            />
            <div className="text-xs text-slate-600">시작일 기준으로 현재 주차를 자동 계산합니다.</div>
          </label>

          <div className="space-y-2">
            <div className="text-sm text-slate-700">현재 투약 주차</div>
            <div className="flex gap-2">
              <input
                value={currentWeekManual}
                onChange={(e) => setCurrentWeekManual(safeNumber(e.target.value, 1))}
                inputMode="numeric"
                disabled={drugStatus !== "사용 중" || weekMode === "AUTO"}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setWeekMode("AUTO")}
                disabled={drugStatus !== "사용 중"}
                className={`px-4 py-2 rounded-2xl border ${
                  weekMode === "AUTO" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200"
                } disabled:opacity-50`}
              >
                자동
              </button>
              <button
                type="button"
                onClick={() => setWeekMode("MANUAL")}
                disabled={drugStatus !== "사용 중"}
                className={`px-4 py-2 rounded-2xl border ${
                  weekMode === "MANUAL" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200"
                } disabled:opacity-50`}
              >
                수동
              </button>
            </div>
            <div className="text-xs text-slate-600">
              자동 계산값: {autoWeek || 0}주차 (필요하면 수동으로 보정하세요)
            </div>
          </div>
        </div>
      </section>

      {/* 고민 */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">고민</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <div className="text-sm text-slate-700">다이어트에서 가장 큰 고민</div>
            <select
              value={mainConcern}
              onChange={(e) => setMainConcern(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="요요">요요</option>
              <option value="근감소">근감소</option>
              <option value="부작용">부작용</option>
              <option value="비용">비용</option>
              <option value="정체기">정체기</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-700">다이어트 각오</div>
            <textarea
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
              placeholder="예: 이번에는 기필코..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
      </section>

      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white px-5 py-3 text-base font-semibold shadow-sm hover:bg-slate-800"
        >
          무료 로드맵 생성
        </button>
      </div>
    </form>
  );
}

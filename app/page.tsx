'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type DrugTypeKey = 'MOUNJARO' | 'WEGOVY';
type BudgetTier = '실속형' | '표준형' | '집중형';
type MuscleMassTier = '모름' | '이하' | '표준' | '이상';
type ExerciseTier = '안 함' | '1-2회' | '3-4회' | '5회+';
type MainConcern = '요요' | '근감소' | '비용' | '부작용';

type UserData = {
  userName: string;
  userAge: number;
  userGender: '남성' | '여성';
  currentWeight: number;
  targetWeight: number;

  drugStatus: '사용 전' | '사용 중';
  drugType: DrugTypeKey;

  // 시작 체중(투약 전)
  startWeightBeforeDrug: number;

  // 용량/주차
  currentDose: number;
  currentWeek: number;

  // 정확도 위한 시작일(저장용)
  startDate?: string;

  muscleMass: MuscleMassTier;
  exercise: ExerciseTier;
  budget: BudgetTier;
  mainConcern: MainConcern;
  resolution: string;
};

const DOSE_OPTIONS: Record<DrugTypeKey, number[]> = {
  // 마운자로(터제타파이드)
  MOUNJARO: [0, 2.5, 5, 7.5, 10, 12.5, 15],
  // 위고비(세마글루타이드)
  WEGOVY: [0, 0.25, 0.5, 1.0, 1.7, 2.4],
};

function formatDoseLabel(drugType: DrugTypeKey, dose: number) {
  if (dose === 0) return '0 (시작 전)';
  // 보기 좋게 소수점 제거
  const str = Number.isInteger(dose) ? String(dose) : String(dose);
  return `${str} mg`;
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 시작일 기준 주차 계산: 시작일 주 = 1주차
function calcWeekFromStartDate(startDateISO: string) {
  const start = new Date(startDateISO + 'T00:00:00');
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, week);
}

export default function HomePage() {
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState<number>(35);
  const [userGender, setUserGender] = useState<'남성' | '여성'>('여성');

  const [currentWeight, setCurrentWeight] = useState<number>(80);
  const [targetWeight, setTargetWeight] = useState<number>(65);

  const [drugStatus, setDrugStatus] = useState<'사용 전' | '사용 중'>('사용 중');
  const [drugType, setDrugType] = useState<DrugTypeKey>('MOUNJARO');

  const [startWeightBeforeDrug, setStartWeightBeforeDrug] = useState<number>(80);

  const doseOptions = useMemo(() => DOSE_OPTIONS[drugType], [drugType]);
  const [currentDose, setCurrentDose] = useState<number>(0);

  // 주차 입력 방식: 자동(시작일 기반) + 수동 보정
  const [startDate, setStartDate] = useState<string>(todayISO());
  const [weekMode, setWeekMode] = useState<'auto' | 'manual'>('auto');
  const computedWeek = useMemo(() => calcWeekFromStartDate(startDate), [startDate]);
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  const [muscleMass, setMuscleMass] = useState<MuscleMassTier>('표준');
  const [exercise, setExercise] = useState<ExerciseTier>('안 함');
  const [budget, setBudget] = useState<BudgetTier>('표준형');
  const [mainConcern, setMainConcern] = useState<MainConcern>('요요');
  const [resolution, setResolution] = useState<string>('');

  // 시작일 바뀌면 자동 주차 업데이트
  useEffect(() => {
    if (weekMode === 'auto') setCurrentWeek(computedWeek);
  }, [computedWeek, weekMode]);

  // 약물 변경 시 용량 옵션 자동 보정
  useEffect(() => {
    // 현재 용량이 옵션에 없으면 0으로
    if (!doseOptions.includes(currentDose)) setCurrentDose(0);
  }, [drugType, doseOptions, currentDose]);

  // 사용 전이면 용량 0, 주차 1로 기본화
  useEffect(() => {
    if (drugStatus === '사용 전') {
      setCurrentDose(0);
      setWeekMode('manual');
      setCurrentWeek(1);
    } else {
      // 사용 중으로 바뀌면 다시 자동 모드 권장
      setWeekMode('auto');
    }
  }, [drugStatus]);

  const ui = styles;

  function handleSubmit() {
    const payload: UserData = {
      userName: userName.trim(),
      userAge: Number(userAge),
      userGender,
      currentWeight: Number(currentWeight),
      targetWeight: Number(targetWeight),

      drugStatus,
      drugType,

      startWeightBeforeDrug: Number(startWeightBeforeDrug),

      currentDose: Number(currentDose),
      currentWeek: Number(currentWeek),

      startDate,

      muscleMass,
      exercise,
      budget,
      mainConcern,
      resolution: resolution.trim(),
    };

    localStorage.setItem('userData', JSON.stringify(payload));
    router.push('/results');
  }

  return (
    <div style={ui.page}>
      <div style={ui.container}>
        <div style={ui.header}>
          <div style={ui.h1}>Next Weight Lab</div>
          <div style={ui.lead}>
            비싼 다이어트가 요요로 끝나지 않도록.
            <br />
            GPS(Drug, Protein, Strength) 전략으로 대사 가교를 설계하세요.
          </div>
        </div>

        <div style={ui.card}>
          <div style={ui.grid}>
            <Field label="성함">
              <input style={ui.input} value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="예: 홍길동" />
            </Field>

            <Field label="나이">
              <input style={ui.input} type="number" value={userAge} onChange={(e) => setUserAge(Number(e.target.value))} min={19} max={99} />
            </Field>

            <Field label="성별">
              <select style={ui.select} value={userGender} onChange={(e) => setUserGender(e.target.value as any)}>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </Field>

            <Field label="주간 운동 횟수">
              <select style={ui.select} value={exercise} onChange={(e) => setExercise(e.target.value as any)}>
                <option value="안 함">안 함</option>
                <option value="1-2회">1-2회</option>
                <option value="3-4회">3-4회</option>
                <option value="5회+">5회+</option>
              </select>
            </Field>

            <Field label="현재 체중 (kg)">
              <input style={ui.input} type="number" value={currentWeight} onChange={(e) => setCurrentWeight(Number(e.target.value))} min={1} step="0.1" />
            </Field>

            <Field label="목표 체중 (kg)">
              <input style={ui.input} type="number" value={targetWeight} onChange={(e) => setTargetWeight(Number(e.target.value))} min={1} step="0.1" />
            </Field>

            <Field label="투약 상태">
              <div style={ui.segment}>
                <button
                  type="button"
                  style={{ ...ui.segmentBtn, ...(drugStatus === '사용 전' ? ui.segmentActive : {}) }}
                  onClick={() => setDrugStatus('사용 전')}
                >
                  사용 전
                </button>
                <button
                  type="button"
                  style={{ ...ui.segmentBtn, ...(drugStatus === '사용 중' ? ui.segmentActive : {}) }}
                  onClick={() => setDrugStatus('사용 중')}
                >
                  사용 중
                </button>
              </div>
            </Field>

            <Field label="약물 선택">
              <select style={ui.select} value={drugType} onChange={(e) => setDrugType(e.target.value as any)}>
                <option value="MOUNJARO">마운자로</option>
                <option value="WEGOVY">위고비</option>
              </select>
            </Field>

            <Field label="투약 전 시작 체중 (kg)">
              <input
                style={ui.input}
                type="number"
                value={startWeightBeforeDrug}
                onChange={(e) => setStartWeightBeforeDrug(Number(e.target.value))}
                min={1}
                step="0.1"
              />
            </Field>

            <Field label="현재 용량">
              <select style={ui.select} value={currentDose} onChange={(e) => setCurrentDose(Number(e.target.value))}>
                {doseOptions.map((d) => (
                  <option key={String(d)} value={d}>
                    {formatDoseLabel(drugType, d)}
                  </option>
                ))}
              </select>
              <div style={ui.help}>
                약물(위고비/마운자로) 기준으로 용량 단계를 선택하세요.
              </div>
            </Field>

            <Field label="투약 시작일">
              <input
                style={ui.input}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={drugStatus === '사용 전'}
              />
              <div style={ui.help}>
                시작일 기준으로 현재 주차를 자동 계산합니다.
              </div>
            </Field>

            <Field label="현재 주차">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  style={{ ...ui.input, width: 140 }}
                  type="number"
                  value={currentWeek}
                  onChange={(e) => setCurrentWeek(Number(e.target.value))}
                  min={1}
                  disabled={weekMode === 'auto' && drugStatus === '사용 중'}
                />
                {drugStatus === '사용 중' && (
                  <div style={ui.segmentSmall}>
                    <button
                      type="button"
                      style={{ ...ui.segmentBtnSmall, ...(weekMode === 'auto' ? ui.segmentActiveSmall : {}) }}
                      onClick={() => {
                        setWeekMode('auto');
                        setCurrentWeek(computedWeek);
                      }}
                    >
                      자동
                    </button>
                    <button
                      type="button"
                      style={{ ...ui.segmentBtnSmall, ...(weekMode === 'manual' ? ui.segmentActiveSmall : {}) }}
                      onClick={() => setWeekMode('manual')}
                    >
                      수동
                    </button>
                  </div>
                )}
              </div>
              {drugStatus === '사용 중' && (
                <div style={ui.help}>
                  자동 계산값: {computedWeek}주차 (필요하면 수동으로 보정하세요)
                </div>
              )}
            </Field>

            <Field label="골격근량">
              <select style={ui.select} value={muscleMass} onChange={(e) => setMuscleMass(e.target.value as any)}>
                <option value="모름">모름</option>
                <option value="이하">이하</option>
                <option value="표준">표준</option>
                <option value="이상">이상</option>
              </select>
            </Field>

            <Field label="관리 예산">
              <select style={ui.select} value={budget} onChange={(e) => setBudget(e.target.value as any)}>
                <option value="실속형">실속형</option>
                <option value="표준형">표준형</option>
                <option value="집중형">집중형</option>
              </select>
            </Field>

            <Field label="가장 큰 고민">
              <select style={ui.select} value={mainConcern} onChange={(e) => setMainConcern(e.target.value as any)}>
                <option value="요요">요요</option>
                <option value="근감소">근감소</option>
                <option value="비용">비용</option>
                <option value="부작용">부작용</option>
              </select>
            </Field>

            <Field label="다이어트 각오">
              <textarea
                style={ui.textarea}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="예: 이번에는 기필코..."
              />
            </Field>
          </div>

          <div style={ui.actions}>
            <button type="button" style={ui.primaryBtn} onClick={handleSubmit}>
              무료 로드맵 생성
            </button>
          </div>

          <div style={ui.disclaimer}>
            본 서비스는 의료 진단이 아닌 자기관리 가이드 도구입니다.
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 14, color: '#0f172a' }}>{label}</div>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#0f172a',
  },
  container: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '28px 18px 60px',
  },
  header: {
    marginBottom: 18,
  },
  h1: {
    fontSize: 56,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    marginBottom: 12,
    fontWeight: 700,
  },
  lead: {
    fontSize: 20,
    lineHeight: 1.6,
    color: '#0f172a',
  },
  card: {
    border: '1px solid rgba(15,23,42,0.10)',
    borderRadius: 18,
    padding: 18,
    background: '#ffffff',
    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  input: {
    height: 40,
    borderRadius: 10,
    border: '1px solid rgba(15,23,42,0.18)',
    padding: '0 12px',
    fontSize: 14,
    outline: 'none',
  },
  select: {
    height: 40,
    borderRadius: 10,
    border: '1px solid rgba(15,23,42,0.18)',
    padding: '0 12px',
    fontSize: 14,
    outline: 'none',
    background: '#fff',
  },
  textarea: {
    minHeight: 90,
    borderRadius: 10,
    border: '1px solid rgba(15,23,42,0.18)',
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
  },
  segment: {
    display: 'flex',
    gap: 10,
  },
  segmentBtn: {
    height: 40,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid rgba(15,23,42,0.18)',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  segmentActive: {
    background: '#0f172a',
    color: '#fff',
    border: '1px solid #0f172a',
  },
  segmentSmall: {
    display: 'flex',
    gap: 8,
  },
  segmentBtnSmall: {
    height: 34,
    padding: '0 12px',
    borderRadius: 10,
    border: '1px solid rgba(15,23,42,0.18)',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },
  segmentActiveSmall: {
    background: '#0f172a',
    color: '#fff',
    border: '1px solid #0f172a',
  },
  help: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  actions: {
    marginTop: 18,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  primaryBtn: {
    height: 44,
    padding: '0 16px',
    borderRadius: 12,
    border: '1px solid #0f172a',
    background: '#0f172a',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  disclaimer: {
    marginTop: 14,
    fontSize: 12,
    color: '#64748b',
  },
};

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Goal = "emagrecer" | "forca" | "condicionamento" | "disciplina";
type Place = "casa" | "rua" | "academia";
type LevelType = "sedentario" | "iniciante" | "intermediario" | "avancado";
type TimeType = "10" | "20" | "40";
type Equipment = "nenhum" | "barra" | "halter" | "academia";
type AttributeKey = "forca" | "vitalidade" | "agilidade" | "disciplina" | "mentalidade";

type Profile = {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: Goal;
  place: Place;
  levelType: LevelType;
  timeType: TimeType;
  equipment: Equipment;
};

type Mission = {
  id: string;
  label: string;
  xp: number;
  done: boolean;
  category: "treino" | "habito" | "cardio";
};

type Boss = {
  id: string;
  name: string;
  description: string;
  rewardXp: number;
};

type Attributes = Record<AttributeKey, number>;

type SaveData = {
  screen: "welcome" | "onboarding" | "system";
  currentStep: number;
  profile: Profile;
  missions: Mission[];
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  waterDays: number;
  perfectDays: number;
  bossesDone: string[];
  attributes: Attributes;
  attributePoints: number;
  history: { day: string; xp: number; perfect: boolean }[];
};

const SAVE_KEY = "soloup-v8-save";

const questionOrder = [
  "name",
  "age",
  "height",
  "weight",
  "goal",
  "place",
  "levelType",
  "timeType",
  "equipment",
] as const;

type StepKey = (typeof questionOrder)[number];

const allBosses: Boss[] = [
  {
    id: "lazy-king",
    name: "Rei da Preguiça",
    description: "Mantenha 3 dias seguidos de treino.",
    rewardXp: 180,
  },
  {
    id: "water-general",
    name: "General da Água",
    description: "Conclua a missão de água em 4 dias.",
    rewardXp: 120,
  },
  {
    id: "routine-beast",
    name: "Besta da Rotina",
    description: "Complete 2 dias perfeitos.",
    rewardXp: 240,
  },
  {
    id: "shadow-overlord",
    name: "Monarca das Sombras",
    description: "Alcance o level 5.",
    rewardXp: 320,
  },
  {
    id: "discipline-lord",
    name: "Senhor da Disciplina",
    description: "Chegue a melhor streak 7.",
    rewardXp: 450,
  },
];

const defaultProfile: Profile = {
  name: "",
  age: 25,
  height: 1.7,
  weight: 89,
  goal: "emagrecer",
  place: "casa",
  levelType: "iniciante",
  timeType: "20",
  equipment: "nenhum",
};

const defaultAttributes: Attributes = {
  forca: 5,
  vitalidade: 5,
  agilidade: 5,
  disciplina: 5,
  mentalidade: 5,
};

function clampBaseLevel(levelType: LevelType): "sedentario" | "iniciante" | "intermediario" {
  if (levelType === "sedentario") return "sedentario";
  if (levelType === "iniciante") return "iniciante";
  return "intermediario";
}

function buildClass(goal: Goal, place: Place) {
  if (goal === "emagrecer") return place === "rua" ? "Corredor das Sombras" : "Caçador da Queima";
  if (goal === "forca") return place === "academia" ? "Guardião de Ferro" : "Executor Brutal";
  if (goal === "condicionamento") return "Predador Cardio";
  return "Monge da Disciplina";
}

function buildFocus(goal: Goal) {
  if (goal === "emagrecer") return "Redução de gordura + constância";
  if (goal === "forca") return "Força funcional + progressão";
  if (goal === "condicionamento") return "Fôlego + resistência";
  return "Disciplina + consistência diária";
}

function bmiTarget(height: number) {
  const healthyUpper = 24.9 * height * height;
  const safeTarget = Math.round((healthyUpper - 2) * 10) / 10;
  const firstTarget = Math.round((safeTarget + 5) * 10) / 10;
  return { firstTarget, safeTarget };
}

function labelGoal(goal: Goal) {
  return goal === "emagrecer"
    ? "Emagrecer"
    : goal === "forca"
    ? "Ganhar força"
    : goal === "condicionamento"
    ? "Condicionamento"
    : "Disciplina";
}

function labelPlace(place: Place) {
  return place === "casa" ? "Casa" : place === "rua" ? "Rua" : "Academia";
}

function labelLevel(levelType: LevelType) {
  return levelType === "sedentario"
    ? "Sedentário"
    : levelType === "iniciante"
    ? "Iniciante"
    : levelType === "intermediario"
    ? "Intermediário"
    : "Avançado";
}

function labelEquipment(equipment: Equipment) {
  return equipment === "nenhum"
    ? "Nenhum"
    : equipment === "barra"
    ? "Barra"
    : equipment === "halter"
    ? "Halter"
    : "Academia completa";
}

function createMission(
  id: string,
  label: string,
  xp: number,
  category: Mission["category"]
): Mission {
  return { id, label, xp, category, done: false };
}

function generateMissions(profile: Profile): Mission[] {
  const base = clampBaseLevel(profile.levelType);
  const intensity =
    profile.timeType === "10" ? 1 : profile.timeType === "20" ? 2 : 3;
  const advancedBonus = profile.levelType === "avancado" ? 15 : 0;

  const missions: Mission[] = [];

  if (profile.goal === "emagrecer") {
    if (profile.place === "casa") {
      missions.push(
        createMission("walk", `Cardio leve ${10 * intensity} min`, 30 + intensity * 10 + advancedBonus, "cardio"),
        createMission("sq", `${10 + intensity * 10} agachamentos`, 15 + intensity * 8 + advancedBonus, "treino"),
        createMission("core", `${10 + intensity * 10} abdominais`, 15 + intensity * 7 + advancedBonus, "treino")
      );
    } else if (profile.place === "rua") {
      missions.push(
        createMission("walk", `Caminhada/corrida ${10 + intensity * 10} min`, 35 + intensity * 12 + advancedBonus, "cardio"),
        createMission("stairs", `${intensity * 2} tiros curtos`, 20 + intensity * 8 + advancedBonus, "cardio")
      );
      if (profile.equipment === "barra") {
        missions.push(createMission("bars", `${5 + intensity * 5} barras ou australianas`, 25 + intensity * 8 + advancedBonus, "treino"));
      }
    } else {
      missions.push(
        createMission("bike", `Esteira/Bike ${10 + intensity * 10} min`, 35 + intensity * 12 + advancedBonus, "cardio"),
        createMission("mach", `Circuito de máquinas ${10 + intensity * 8} min`, 25 + intensity * 10 + advancedBonus, "treino")
      );
    }
  }

  if (profile.goal === "forca") {
    if (profile.place === "casa") {
      missions.push(
        createMission("push", `${10 + intensity * 10} flexões`, 20 + intensity * 10 + advancedBonus, "treino"),
        createMission("sq", `${15 + intensity * 10} agachamentos`, 18 + intensity * 8 + advancedBonus, "treino"),
        createMission("core", `${10 + intensity * 10} abdominais`, 15 + intensity * 8 + advancedBonus, "treino")
      );
    } else if (profile.place === "rua") {
      missions.push(
        createMission("bars", `${5 + intensity * 5} barras ou australianas`, 25 + intensity * 10 + advancedBonus, "treino"),
        createMission("push", `${10 + intensity * 10} flexões`, 20 + intensity * 8 + advancedBonus, "treino")
      );
    } else {
      missions.push(
        createMission("mach", `Treino de força ${10 + intensity * 10} min`, 30 + intensity * 10 + advancedBonus, "treino"),
        createMission("bike", `Cardio curto ${5 + intensity * 5} min`, 15 + intensity * 6 + advancedBonus, "cardio")
      );
    }
  }

  if (profile.goal === "condicionamento") {
    if (profile.place === "casa") {
      missions.push(
        createMission("cardio", `Circuito/HIIT ${10 + intensity * 10} min`, 30 + intensity * 12 + advancedBonus, "cardio"),
        createMission("mob", `Mobilidade ${5 + intensity * 3} min`, 12 + intensity * 5 + advancedBonus, "treino")
      );
    } else if (profile.place === "rua") {
      missions.push(
        createMission("run", `Corrida ${10 + intensity * 10} min`, 35 + intensity * 12 + advancedBonus, "cardio"),
        createMission("pace", `Ritmo forte por ${3 + intensity * 2} blocos`, 18 + intensity * 8 + advancedBonus, "cardio")
      );
    } else {
      missions.push(
        createMission("bike", `Cardio forte ${10 + intensity * 10} min`, 35 + intensity * 12 + advancedBonus, "cardio"),
        createMission("mach", `Circuito funcional ${10 + intensity * 8} min`, 22 + intensity * 8 + advancedBonus, "treino")
      );
    }
  }

  if (profile.goal === "disciplina") {
    missions.push(
      createMission("walk", `Movimento diário ${10 + intensity * 5} min`, 20 + intensity * 8 + advancedBonus, "cardio"),
      createMission("ritual", "Arrumar cama / ritual matinal", 15 + advancedBonus, "habito"),
      createMission("focus", "10 min sem distração", 15 + intensity * 3 + advancedBonus, "habito")
    );
  }

  if (profile.equipment === "halter" && profile.place !== "academia") {
    missions.push(createMission("halter", `Circuito com halter ${5 + intensity * 5} min`, 20 + intensity * 8 + advancedBonus, "treino"));
  }

  if (base === "sedentario" && !missions.some((m) => m.id === "walk")) {
    missions.unshift(createMission("walk", "Caminhada leve 10 min", 25, "cardio"));
  }

  missions.push(
    createMission("water", "2L+ de água", 20, "habito"),
    createMission(
      "food",
      profile.goal === "forca" ? "Proteína em 2 refeições" : "Alimentação limpa",
      30,
      "habito"
    )
  );

  return missions;
}

function generateDungeon(profile: Profile) {
  const intensity = profile.timeType === "10" ? 1 : profile.timeType === "20" ? 2 : 3;
  if (profile.goal === "forca") {
    return {
      name: "Dungeon Rank C",
      objective: `${20 + intensity * 15} flexões + ${20 + intensity * 15} agachamentos + ${10 + intensity * 10} abdominais`,
      reward: 220,
    };
  }
  if (profile.goal === "condicionamento") {
    return {
      name: "Dungeon Rank C",
      objective: `${15 + intensity * 10} min de cardio contínuo + ${intensity * 3} blocos fortes`,
      reward: 220,
    };
  }
  if (profile.goal === "disciplina") {
    return {
      name: "Dungeon Rank C",
      objective: `3 hábitos completos + ${10 + intensity * 5} min de movimento`,
      reward: 220,
    };
  }
  return {
    name: "Dungeon Rank C",
    objective: `${15 + intensity * 10} min de cardio + ${15 + intensity * 10} agachamentos + alimentação limpa`,
    reward: 220,
  };
}

function getRank(level: number) {
  if (level >= 15) return "S";
  if (level >= 11) return "A";
  if (level >= 7) return "B";
  if (level >= 4) return "C";
  if (level >= 2) return "D";
  return "E";
}

export default function SoloUpV8() {
  const [screen, setScreen] = useState<"welcome" | "onboarding" | "system">("welcome");
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [waterDays, setWaterDays] = useState(0);
  const [perfectDays, setPerfectDays] = useState(0);
  const [bossesDone, setBossesDone] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<Attributes>(defaultAttributes);
  const [attributePoints, setAttributePoints] = useState(0);
  const [history, setHistory] = useState<{ day: string; xp: number; perfect: boolean }[]>([]);
  const [typedQuestion, setTypedQuestion] = useState("");
  const [showArise, setShowArise] = useState(false);
  const [warning, setWarning] = useState("");
  const [toast, setToast] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [musicOn, setMusicOn] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<number | null>(null);

  const rank = useMemo(() => getRank(level), [level]);
  const dungeon = useMemo(() => generateDungeon(profile), [profile]);

  const currentClass = useMemo(() => buildClass(profile.goal, profile.place), [profile]);
  const currentFocus = useMemo(() => buildFocus(profile.goal), [profile]);

  const bmi = useMemo(() => profile.weight / (profile.height * profile.height), [profile]);
  const bmiLabel = useMemo(() => {
    if (bmi < 18.5) return "Abaixo do peso";
    if (bmi < 25) return "Saudável";
    if (bmi < 30) return "Sobrepeso";
    return "Obesidade";
  }, [bmi]);

  const targetWeight = useMemo(() => {
    const { firstTarget, safeTarget } = bmiTarget(profile.height);
    return profile.goal === "forca"
      ? `${Math.max(profile.weight - 3, Math.round(firstTarget))}kg primeiro, depois recomposição`
      : `${Math.min(profile.weight - 3, firstTarget)}kg primeiro, meta saudável ${safeTarget}kg`;
  }, [profile.height, profile.weight, profile.goal]);

  const totalToday = useMemo(() => {
    const total = missions.reduce((sum, m) => sum + (m.done ? m.xp : 0), 0);
    return missions.length > 0 && missions.every((m) => m.done) ? total + 100 : total;
  }, [missions]);

  const dailyProgress = useMemo(() => {
    if (missions.length === 0) return 0;
    const done = missions.filter((m) => m.done).length;
    return Math.round((done / missions.length) * 100);
  }, [missions]);

  const perfectDay = useMemo(
    () => missions.length > 0 && missions.every((m) => m.done),
    [missions]
  );

  const streakBonus = useMemo(() => {
    if (streak >= 30) return 700;
    if (streak >= 15) return 300;
    if (streak >= 7) return 120;
    if (streak >= 3) return 50;
    return 0;
  }, [streak]);

  const weeklyDifficulty = useMemo(() => {
    const recent = history.slice(0, 7);
    const perfectCount = recent.filter((h) => h.perfect).length;
    if (streak >= 10 || perfectCount >= 4) return "Alta";
    if (streak >= 4 || perfectCount >= 2) return "Média";
    return "Base";
  }, [history, streak]);

  const unlockedSkills = useMemo(() => {
    return {
      bruteForce: attributes.forca >= 8,
      ironLung: attributes.vitalidade >= 8,
      shadowStep: attributes.agilidade >= 8,
      monarchMind: attributes.disciplina >= 8,
      abyssMind: attributes.mentalidade >= 8,
      eliteHunter: level >= 10,
    };
  }, [attributes, level]);

  const bossProgress = useMemo<Record<string, number>>(() => {
  return {
    "lazy-king": Math.min((streak / 3) * 100, 100),
    "water-general": Math.min((waterDays / 4) * 100, 100),
    "routine-beast": Math.min((perfectDays / 2) * 100, 100),
    "shadow-overlord": Math.min((level / 5) * 100, 100),
    "discipline-lord": Math.min((bestStreak / 7) * 100, 100),
  };
}, [streak, waterDays, perfectDays, level, bestStreak]);

  useEffect(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const saved: SaveData = JSON.parse(raw);
      setScreen(saved.screen ?? "welcome");
      setCurrentStep(saved.currentStep ?? 0);
      setProfile(saved.profile ?? defaultProfile);
      setMissions(saved.missions ?? []);
      setXp(saved.xp ?? 0);
      setLevel(saved.level ?? 1);
      setStreak(saved.streak ?? 0);
      setBestStreak(saved.bestStreak ?? 0);
      setWaterDays(saved.waterDays ?? 0);
      setPerfectDays(saved.perfectDays ?? 0);
      setBossesDone(saved.bossesDone ?? []);
      setAttributes(saved.attributes ?? defaultAttributes);
      setAttributePoints(saved.attributePoints ?? 0);
      setHistory(saved.history ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    const save: SaveData = {
      screen,
      currentStep,
      profile,
      missions,
      xp,
      level,
      streak,
      bestStreak,
      waterDays,
      perfectDays,
      bossesDone,
      attributes,
      attributePoints,
      history,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }, [
    screen,
    currentStep,
    profile,
    missions,
    xp,
    level,
    streak,
    bestStreak,
    waterDays,
    perfectDays,
    bossesDone,
    attributes,
    attributePoints,
    history,
  ]);

  useEffect(() => {
    if (screen !== "onboarding") return;
    const stepKey = questionOrder[currentStep];
    const textMap: Record<StepKey, string> = {
      name: "Sistema detectou um novo jogador. Qual é o seu nome?",
      age: `${profile.name || "Caçador"}, qual é a sua idade?`,
      height: "Informe sua altura para o sistema calcular sua evolução.",
      weight: "Agora informe seu peso atual.",
      goal: "Qual é o seu objetivo principal?",
      place: "Onde você treina com mais frequência?",
      levelType: "Qual é o seu nível atual de atividade física?",
      timeType: "Quanto tempo por dia você consegue treinar?",
      equipment: "Qual equipamento você tem disponível?",
    };

    const full = textMap[stepKey];
    setTypedQuestion("");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setTypedQuestion(full.slice(0, i));
      if (i >= full.length) window.clearInterval(timer);
    }, 18);

    return () => window.clearInterval(timer);
  }, [screen, currentStep, profile.name]);

  useEffect(() => {
    return () => stopMusic();
  }, []);

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  }

  function playClickSound() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = 720;
      gain.gain.value = 0.02;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  function playLevelUpSound() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const notes = [440, 660, 880, 1040];
      notes.forEach((note, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = note;
        gain.gain.value = 0.03;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const startAt = ctx.currentTime + index * 0.08;
        osc.start(startAt);
        osc.stop(startAt + 0.16);
      });
    } catch {}
  }

  function startMusic() {
    try {
      if (audioRef.current) return;
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioRef.current = ctx;

      const playAmbientPulse = () => {
        if (!audioRef.current) return;
        const now = audioRef.current.currentTime;

        const base = audioRef.current.createOscillator();
        const high = audioRef.current.createOscillator();
        const gainA = audioRef.current.createGain();
        const gainB = audioRef.current.createGain();

        base.type = "sine";
        high.type = "triangle";

        base.frequency.value = 110;
        high.frequency.value = 220;

        gainA.gain.setValueAtTime(0.0001, now);
        gainA.gain.exponentialRampToValueAtTime(0.015, now + 0.6);
        gainA.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        gainB.gain.setValueAtTime(0.0001, now);
        gainB.gain.exponentialRampToValueAtTime(0.008, now + 0.4);
        gainB.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        base.connect(gainA);
        high.connect(gainB);
        gainA.connect(audioRef.current.destination);
        gainB.connect(audioRef.current.destination);

        base.start(now);
        high.start(now + 0.15);
        base.stop(now + 4);
        high.stop(now + 3);
      };

      playAmbientPulse();
      musicTimerRef.current = window.setInterval(playAmbientPulse, 3500);
    } catch {}
  }

  function stopMusic() {
    if (musicTimerRef.current) {
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.close();
      audioRef.current = null;
    }
  }

  function toggleMusic() {
    playClickSound();
    setMusicOn((prev) => {
      const next = !prev;
      if (next) startMusic();
      else stopMusic();
      return next;
    });
  }

  function click(action?: () => void) {
    playClickSound();
    action?.();
  }

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function nextStep() {
    if (currentStep < questionOrder.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    const generated = generateMissions(profile);
    setMissions(generated);
    setShowArise(true);
    window.setTimeout(() => {
      setShowArise(false);
      setScreen("system");
    }, 1200);
  }

  function toggleMission(id: string) {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  }

  function addAttribute(attr: AttributeKey) {
    if (attributePoints <= 0) return;
    setAttributes((prev) => ({ ...prev, [attr]: prev[attr] + 1 }));
    setAttributePoints((prev) => prev - 1);
  }

  function concludeDay() {
    if (totalToday === 0) {
      setWarning("⚠️ Sistema detectou negligência. Nenhuma missão foi concluída.");
      setStreak(0);
      return;
    }

    setWarning("");

    const waterDone = missions.some((m) => m.id === "water" && m.done);
    const gainedTotal = totalToday + streakBonus;
    const accumulatedXp = xp + gainedTotal;

    let newLevel = level;
    let newXp = accumulatedXp;
    let gainedLevels = 0;

    while (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
      gainedLevels += 1;
    }

    setXp(newXp);
    if (gainedLevels > 0) {
      setLevel(newLevel);
      setAttributePoints((prev) => prev + gainedLevels * 3);
      playLevelUpSound();
      showToast("LEVEL UP ⚡");
    } else {
      showToast("QUEST COMPLETE ✅");
    }

    const newStreak = streak + 1;
    setStreak(newStreak);
    setBestStreak((prev) => Math.max(prev, newStreak));

    if (waterDone) setWaterDays((prev) => prev + 1);
    if (perfectDay) setPerfectDays((prev) => prev + 1);

    setHistory((prev) => [
      {
        day: new Date().toLocaleDateString("pt-BR"),
        xp: gainedTotal,
        perfect: perfectDay,
      },
      ...prev,
    ]);

    const newlyCompleted = allBosses
      .filter((boss) => !bossesDone.includes(boss.id))
      .filter((boss) => {
        if (boss.id === "lazy-king") return newStreak >= 3;
        if (boss.id === "water-general") return (waterDone ? waterDays + 1 : waterDays) >= 4;
        if (boss.id === "routine-beast") return (perfectDay ? perfectDays + 1 : perfectDays) >= 2;
        if (boss.id === "shadow-overlord") return newLevel >= 5;
        if (boss.id === "discipline-lord") return Math.max(bestStreak, newStreak) >= 7;
        return false;
      });

    if (newlyCompleted.length > 0) {
      const reward = newlyCompleted.reduce((sum, b) => sum + b.rewardXp, 0);
      setBossesDone((prev) => [...prev, ...newlyCompleted.map((b) => b.id)]);
      setXp((prev) => {
        let total = prev + reward;
        let lvl = newLevel;
        let points = 0;
        while (total >= 100) {
          total -= 100;
          lvl += 1;
          points += 3;
        }
        if (lvl !== newLevel) setLevel(lvl);
        if (points > 0) setAttributePoints((p) => p + points);
        return total;
      });
      showToast("BOSS DERROTADO 👑");
    }

    setMissions(generateMissions(profile));
  }

  function failDay() {
    setWarning("⚠️ Sistema detectou falha. Missão de recuperação aplicada.");
    setStreak(0);
    setXp((prev) => Math.max(0, prev - 20));
    setMissions((prev) =>
      prev.map((m, idx) =>
        idx === 0
          ? { ...m, label: `${m.label} + recuperação extra`, done: false }
          : { ...m, done: false }
      )
    );
  }

  async function shareBuild() {
    const text = `SOLOUP BUILD
Nome: ${profile.name}
Classe: ${currentClass}
Rank: ${rank}
Level: ${level}
Foco: ${currentFocus}
Meta: ${targetWeight}
Atributos -> Força ${attributes.forca} | Vitalidade ${attributes.vitalidade} | Agilidade ${attributes.agilidade} | Disciplina ${attributes.disciplina} | Mentalidade ${attributes.mentalidade}
Dificuldade semanal: ${weeklyDifficulty}`;

    try {
      await navigator.clipboard.writeText(text);
      setShareMessage("Build copiada.");
      window.setTimeout(() => setShareMessage(""), 2000);
    } catch {
      setShareMessage("Não foi possível copiar.");
      window.setTimeout(() => setShareMessage(""), 2000);
    }
  }

  function resetAll() {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }

  if (screen === "welcome") {
    return (
      <main style={welcomeMain}>
        <SystemBG />
        <div style={overlay} />
        <section style={centerCard}>
          <p style={miniLabel}>SOLOUP SYSTEM</p>
          <h1 style={heroTitle}>Desperte.</h1>
          <p style={heroText}>
            O sistema fitness inspirado em Solo Leveling. Crie seu personagem,
            receba um plano automático e evolua na vida real.
          </p>
          <div style={buttonRow}>
            <button style={primaryButton} onClick={() => click(() => setScreen("onboarding"))}>
              Criar personagem
            </button>
            <button style={secondaryButton} onClick={toggleMusic}>
              {musicOn ? "Parar trilha" : "Tocar trilha"}
            </button>
          </div>
          <div style={box}>
            <p style={mutedTitle}>Trilha do sistema</p>
            <p style={mutedText}>
              A música ambiente é gerada pelo próprio app via WebAudio. Não depende de faixa externa.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "onboarding") {
    const stepKey = questionOrder[currentStep];

    return (
      <main style={welcomeMain}>
        <SystemBG />
        <div style={overlay} />
        <section style={questionCard}>
          <p style={miniLabel}>CRIAÇÃO DE PERSONAGEM</p>
          <p style={counterText}>
            Etapa {currentStep + 1} / {questionOrder.length}
          </p>
          <h2 style={questionTitle}>
            {typedQuestion}
            <span style={cursor}>|</span>
          </h2>

          {stepKey === "name" && (
            <input
              style={inputStyle}
              placeholder="Seu nome"
              value={profile.name}
              onChange={(e) => updateProfile("name", e.target.value)}
            />
          )}
          {stepKey === "age" && (
            <input
              style={inputStyle}
              type="number"
              value={profile.age}
              onChange={(e) => updateProfile("age", Number(e.target.value || 0))}
            />
          )}
          {stepKey === "height" && (
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              value={profile.height}
              onChange={(e) => updateProfile("height", Number(e.target.value || 0))}
            />
          )}
          {stepKey === "weight" && (
            <input
              style={inputStyle}
              type="number"
              step="0.1"
              value={profile.weight}
              onChange={(e) => updateProfile("weight", Number(e.target.value || 0))}
            />
          )}
          {stepKey === "goal" && (
            <div style={choiceGrid}>
              <Choice label="Emagrecer" active={profile.goal === "emagrecer"} onClick={() => click(() => updateProfile("goal", "emagrecer"))} />
              <Choice label="Ganhar força" active={profile.goal === "forca"} onClick={() => click(() => updateProfile("goal", "forca"))} />
              <Choice label="Condicionamento" active={profile.goal === "condicionamento"} onClick={() => click(() => updateProfile("goal", "condicionamento"))} />
              <Choice label="Disciplina" active={profile.goal === "disciplina"} onClick={() => click(() => updateProfile("goal", "disciplina"))} />
            </div>
          )}
          {stepKey === "place" && (
            <div style={choiceGrid}>
              <Choice label="Casa" active={profile.place === "casa"} onClick={() => click(() => updateProfile("place", "casa"))} />
              <Choice label="Rua" active={profile.place === "rua"} onClick={() => click(() => updateProfile("place", "rua"))} />
              <Choice label="Academia" active={profile.place === "academia"} onClick={() => click(() => updateProfile("place", "academia"))} />
            </div>
          )}
          {stepKey === "levelType" && (
            <div style={choiceGrid}>
              <Choice label="Sedentário" active={profile.levelType === "sedentario"} onClick={() => click(() => updateProfile("levelType", "sedentario"))} />
              <Choice label="Iniciante" active={profile.levelType === "iniciante"} onClick={() => click(() => updateProfile("levelType", "iniciante"))} />
              <Choice label="Intermediário" active={profile.levelType === "intermediario"} onClick={() => click(() => updateProfile("levelType", "intermediario"))} />
              <Choice label="Avançado" active={profile.levelType === "avancado"} onClick={() => click(() => updateProfile("levelType", "avancado"))} />
            </div>
          )}
          {stepKey === "timeType" && (
            <div style={choiceGrid}>
              <Choice label="10 min" active={profile.timeType === "10"} onClick={() => click(() => updateProfile("timeType", "10"))} />
              <Choice label="20 min" active={profile.timeType === "20"} onClick={() => click(() => updateProfile("timeType", "20"))} />
              <Choice label="40 min" active={profile.timeType === "40"} onClick={() => click(() => updateProfile("timeType", "40"))} />
            </div>
          )}
          {stepKey === "equipment" && (
            <div style={choiceGrid}>
              <Choice label="Nenhum" active={profile.equipment === "nenhum"} onClick={() => click(() => updateProfile("equipment", "nenhum"))} />
              <Choice label="Barra" active={profile.equipment === "barra"} onClick={() => click(() => updateProfile("equipment", "barra"))} />
              <Choice label="Halter" active={profile.equipment === "halter"} onClick={() => click(() => updateProfile("equipment", "halter"))} />
              <Choice label="Academia completa" active={profile.equipment === "academia"} onClick={() => click(() => updateProfile("equipment", "academia"))} />
            </div>
          )}

          <button style={primaryButton} onClick={() => click(nextStep)}>
            {currentStep === questionOrder.length - 1 ? "Gerar sistema" : "Próximo"}
          </button>
        </section>
        {showArise ? <Arise /> : null}
      </main>
    );
  }

  return (
    <main style={appMain}>
      <HudBG />
      <div style={container}>
        <section style={heroPanel}>
          <div>
            <p style={miniLabel}>SOLOUP FITNESS</p>
            <h1 style={heroTitleSmall}>Bem-vindo, {profile.name}</h1>
            <p style={heroTextSmall}>
              {currentClass} • {currentFocus}
            </p>
          </div>
          <div style={heroActions}>
            <button style={miniButton} onClick={toggleMusic}>
              {musicOn ? "Parar trilha" : "Trilha"}
            </button>
            <div style={rankBadge}>Rank {rank}</div>
          </div>
        </section>

        {toast ? <div style={toastBox}>{toast}</div> : null}
        {warning ? <div style={warningBox}>{warning}</div> : null}

        <section style={grid4}>
          <StatCard title="Level" value={String(level)} />
          <StatCard title="XP" value={String(xp)} />
          <StatCard title="Streak" value={String(streak)} />
          <StatCard title="Melhor streak" value={String(bestStreak)} />
        </section>

        <section style={grid4}>
          <StatCard title="Pontos de atributo" value={String(attributePoints)} />
          <StatCard title="Força" value={String(attributes.forca)} />
          <StatCard title="Vitalidade" value={String(attributes.vitalidade)} />
          <StatCard title="Agilidade" value={String(attributes.agilidade)} />
        </section>

        <Panel title="Perfil gerado pelo sistema">
          <InfoLine label="Classe" value={currentClass} />
          <InfoLine label="Foco" value={currentFocus} />
          <InfoLine label="Meta inicial" value={targetWeight} />
          <InfoLine label="Altura / Peso" value={`${profile.height.toFixed(2)}m / ${profile.weight}kg`} />
          <InfoLine label="Objetivo" value={labelGoal(profile.goal)} />
          <InfoLine label="Local" value={labelPlace(profile.place)} />
          <InfoLine label="Nível atual" value={labelLevel(profile.levelType)} />
          <InfoLine label="Tempo por dia" value={`${profile.timeType} min`} />
          <InfoLine label="Equipamento" value={labelEquipment(profile.equipment)} />
          <InfoLine label="Faixa corporal" value={bmiLabel} />
        </Panel>

        <section style={twoCol}>
          <Panel title="Treinos e missões do dia">
            <div style={progressWrap}>
              <div style={progressLabelRow}>
                <span>Progresso diário</span>
                <strong>{dailyProgress}%</strong>
              </div>
              <div style={hpOuter}>
                <div style={{ ...hpInner, width: `${dailyProgress}%` }} />
              </div>
            </div>

            {missions.map((mission) => (
              <QuestRow
                key={mission.id}
                label={mission.label}
                xp={mission.xp}
                checked={mission.done}
                category={mission.category}
                onClick={() => click(() => toggleMission(mission.id))}
              />
            ))}

            <div style={box}>
              <p style={mutedTitle}>Como usar</p>
              <p style={mutedText}>
                Cada linha abaixo é um treino ou missão do dia. Clique em <strong>Feito</strong> quando concluir. Se marcou errado, clique em <strong>Desfazer</strong>.
              </p>
            </div>

            <div style={footerRow}>
              <span>XP hoje</span>
              <strong>{totalToday}</strong>
            </div>

            <div style={footerRow}>
              <span>Bônus de streak</span>
              <strong>+{streakBonus}</strong>
            </div>

            <div style={buttonRow}>
              <button style={primaryButton} onClick={() => click(concludeDay)}>
                Concluir dia
              </button>
              <button style={secondaryButton} onClick={() => click(failDay)}>
                Falhei hoje
              </button>
            </div>
          </Panel>

          <Panel title="Atributos distribuíveis">
            <AttributeRow label="Força" value={attributes.forca} onAdd={() => click(() => addAttribute("forca"))} disabled={attributePoints <= 0} />
            <AttributeRow label="Vitalidade" value={attributes.vitalidade} onAdd={() => click(() => addAttribute("vitalidade"))} disabled={attributePoints <= 0} />
            <AttributeRow label="Agilidade" value={attributes.agilidade} onAdd={() => click(() => addAttribute("agilidade"))} disabled={attributePoints <= 0} />
            <AttributeRow label="Disciplina" value={attributes.disciplina} onAdd={() => click(() => addAttribute("disciplina"))} disabled={attributePoints <= 0} />
            <AttributeRow label="Mentalidade" value={attributes.mentalidade} onAdd={() => click(() => addAttribute("mentalidade"))} disabled={attributePoints <= 0} />

            <div style={box}>
              <p style={mutedTitle}>Efeito dos atributos</p>
              <p style={mutedText}>
                Força melhora sua build física, Vitalidade reforça recuperação e cardio, Agilidade favorece ritmo e mobilidade, Disciplina fortalece streak, Mentalidade representa resistência mental e foco.
              </p>
            </div>
          </Panel>
        </section>

        <section style={twoCol}>
          <Panel title="Boss semanal e guia">
            <div style={box}>
              <p style={mutedTitle}>Como derrotar os bosses</p>
              <p style={mutedText}>
                Mantenha streaks, complete hábitos, feche dias perfeitos e suba de nível. Cada boss exige um tipo de evolução.
              </p>
            </div>

            {allBosses.map((boss) => {
              const done = bossesDone.includes(boss.id);
              const progress = done ? 100 : (bossProgress[boss.id] ?? 0);
              return (
                <div key={boss.id} style={bossRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{boss.name}</div>
                    <div style={smallHint}>{boss.description}</div>
                    <div style={hpOuter}>
                      <div style={{ ...hpInner, width: `${progress}%` }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: done ? "#4ade80" : "#67e8f9", fontWeight: 700 }}>
                      {done ? "Derrotado" : `+${boss.rewardXp} XP`}
                    </div>
                  </div>
                </div>
              );
            })}
          </Panel>

          <Panel title="Diretiva do sistema">
            <div style={box}>
              <p style={mutedTitle}>Alimentação</p>
              <p style={mutedText}>
                Baseie a rotina em comida simples: ovos, frango, arroz, feijão, carne, banana, aveia, legumes e água. Segure refrigerante, doce diário e belisco noturno.
              </p>
            </div>
            <div style={box}>
              <p style={mutedTitle}>Recompensa</p>
              <p style={mutedText}>
                Dias perfeitos rendem mais EXP. Streaks aumentam bônus. Bosses trazem picos grandes de evolução.
              </p>
            </div>
            <div style={box}>
              <p style={mutedTitle}>Penalidade</p>
              <p style={mutedText}>
                Falhar quebra streak e reduz XP. O sistema pune a inércia, mas recompensa retorno rápido.
              </p>
            </div>
          </Panel>
        </section>

        <section style={twoCol}>
          <Panel title="Dungeon semanal">
            <div style={box}>
              <p style={mutedTitle}>{dungeon.name}</p>
              <p style={mutedText}>{dungeon.objective}</p>
              <p style={{ ...mutedText, marginTop: 10 }}>
                Recompensa: <strong>+{dungeon.reward} XP</strong>
              </p>
            </div>
            <button
              style={primaryButton}
              onClick={() => {
                click(() => {
                  setXp((prev) => {
                    let total = prev + dungeon.reward;
                    let gainedLevels = 0;
                    while (total >= 100) {
                      total -= 100;
                      gainedLevels += 1;
                    }
                    if (gainedLevels > 0) {
                      setLevel((l) => l + gainedLevels);
                      setAttributePoints((p) => p + gainedLevels * 3);
                      playLevelUpSound();
                    }
                    showToast("DUNGEON CLEAR 🗝️");
                    return total;
                  });
                });
              }}
            >
              Concluir dungeon
            </button>
          </Panel>

          <Panel title="Guia de dicas">
            <div style={box}>
              <p style={mutedTitle}>1. Foque em consistência</p>
              <p style={mutedText}>É melhor 20 minutos todos os dias do que 2 horas uma vez e sumir por uma semana.</p>
            </div>
            <div style={box}>
              <p style={mutedTitle}>2. Não marque falso positivo</p>
              <p style={mutedText}>O sistema só funciona se você respeitar a própria evolução.</p>
            </div>
            <div style={box}>
              <p style={mutedTitle}>3. Água e sono importam</p>
              <p style={mutedText}>Sem água e descanso, até o melhor treino perde impacto.</p>
            </div>
          </Panel>
        </section>

        <section style={twoCol}>
          <Panel title="Skill Tree do Caçador">
            <div style={box}>
              <p style={mutedTitle}>Dificuldade semanal</p>
              <p style={mutedText}>
                Estado atual do sistema: <strong>{weeklyDifficulty}</strong>. Quanto mais dias perfeitos e streak, mais duro o sistema te trata.
              </p>
            </div>

            <div style={skillGrid}>
              <SkillCard title="Brute Force" unlocked={unlockedSkills.bruteForce} description="Desbloqueado com Força 8. Evolução de treino bruto." />
              <SkillCard title="Iron Lung" unlocked={unlockedSkills.ironLung} description="Desbloqueado com Vitalidade 8. Melhor cardio e recuperação." />
              <SkillCard title="Shadow Step" unlocked={unlockedSkills.shadowStep} description="Desbloqueado com Agilidade 8. Velocidade e mobilidade." />
              <SkillCard title="Monarch Mind" unlocked={unlockedSkills.monarchMind} description="Desbloqueado com Disciplina 8. Consistência acima da média." />
              <SkillCard title="Abyss Mind" unlocked={unlockedSkills.abyssMind} description="Desbloqueado com Mentalidade 8. Resistência mental elevada." />
              <SkillCard title="Elite Hunter" unlocked={unlockedSkills.eliteHunter} description="Desbloqueado no level 10. Marco de jogador sério." />
            </div>
          </Panel>

          <Panel title="Compartilhar build">
            <div style={box}>
              <p style={mutedTitle}>Resumo social</p>
              <p style={mutedText}>
                Copie sua build e mande para amigos. Isso já prepara o SoloUp para ranking e comparação futuramente.
              </p>
            </div>

            <div style={infoLine}>
              <span style={mutedText}>Classe</span>
              <strong>{currentClass}</strong>
            </div>
            <div style={infoLine}>
              <span style={mutedText}>Rank / Level</span>
              <strong>
                {rank} / {level}
              </strong>
            </div>
            <div style={infoLine}>
              <span style={mutedText}>Dificuldade semanal</span>
              <strong>{weeklyDifficulty}</strong>
            </div>
            <div style={infoLine}>
              <span style={mutedText}>Melhor streak</span>
              <strong>{bestStreak}</strong>
            </div>

            <button style={primaryButton} onClick={() => click(shareBuild)}>
              Copiar minha build
            </button>

            {shareMessage ? <p style={{ ...mutedText, marginTop: 10 }}>{shareMessage}</p> : null}
          </Panel>
        </section>

        <Panel title="Próximas atualizações do SoloUp">
          <div style={twoCol}>
            <div style={box}>
              <p style={mutedTitle}>1. Ranking entre amigos</p>
              <p style={mutedText}>Comparar levels e streaks com quem estiver testando junto.</p>
            </div>
            <div style={box}>
              <p style={mutedTitle}>2. Guildas</p>
              <p style={mutedText}>Criar grupo com metas coletivas e boss compartilhado.</p>
            </div>
            <div style={box}>
              <p style={mutedTitle}>3. PWA</p>
              <p style={mutedText}>Instalar como app no celular, sem barra do navegador.</p>
            </div>
            <div style={box}>
              <p style={mutedTitle}>4. Quest adaptativa real</p>
              <p style={mutedText}>Aumentar ou baixar treino baseado no desempenho recente.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Registro">
          {history.length === 0 ? (
            <p style={mutedText}>Nenhum dia concluído ainda.</p>
          ) : (
            history.map((h, i) => (
              <div key={`${h.day}-${i}`} style={historyRow}>
                <span>
                  {h.day}
                  {h.perfect ? " • dia perfeito" : ""}
                </span>
                <strong>+{h.xp} XP</strong>
              </div>
            ))
          )}
        </Panel>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button style={secondaryButton} onClick={() => click(resetAll)}>
            Resetar tudo
          </button>
        </div>
      </div>
    </main>
  );
}

function Choice({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{ ...choiceButton, ...(active ? choiceActive : {}) }}>
      {label}
    </button>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={statCard}>
      <p style={statTitle}>{title}</p>
      <div style={statValue}>{value}</div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={panel}>
      <h2 style={panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoLine}>
      <span style={mutedText}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuestRow({
  label,
  xp,
  checked,
  category,
  onClick,
}: {
  label: string;
  xp: number;
  checked: boolean;
  category: Mission["category"];
  onClick: () => void;
}) {
  const categoryLabel =
    category === "treino" ? "Treino" : category === "cardio" ? "Cardio" : "Hábito";

  return (
    <div style={questRowWrap}>
      <div style={questInfoWrap}>
        <div>{label}</div>
        <div style={smallHint}>
          {categoryLabel} • +{xp} XP
        </div>
      </div>
      <div style={questActionWrap}>
        <span style={{ ...questStatusBadge, ...(checked ? questStatusDone : questStatusPending) }}>
          {checked ? "Feito" : "Pendente"}
        </span>
        <button onClick={onClick} style={{ ...questToggleButton, ...(checked ? questUndoButton : questDoneButton) }}>
          {checked ? "Desfazer" : "Feito"}
        </button>
      </div>
    </div>
  );
}

function AttributeRow({
  label,
  value,
  onAdd,
  disabled,
}: {
  label: string;
  value: number;
  onAdd: () => void;
  disabled: boolean;
}) {
  return (
    <div style={attributeRow}>
      <span>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <strong>{value}</strong>
        <button onClick={onAdd} disabled={disabled} style={{ ...addButton, opacity: disabled ? 0.4 : 1 }}>
          +
        </button>
      </div>
    </div>
  );
}

function SkillCard({
  title,
  unlocked,
  description,
}: {
  title: string;
  unlocked: boolean;
  description: string;
}) {
  return (
    <div style={{ ...skillCard, ...(unlocked ? skillUnlocked : {}) }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={smallHint}>{description}</div>
      <div style={{ marginTop: 8, color: unlocked ? "#4ade80" : "#67e8f9", fontWeight: 700 }}>
        {unlocked ? "Desbloqueada" : "Bloqueada"}
      </div>
    </div>
  );
}

function SystemBG() {
  return (
    <>
      <div style={glowA} />
      <div style={glowB} />
      <div style={grid} />
      <div style={scan} />
    </>
  );
}

function HudBG() {
  return (
    <>
      <div style={hudGlow} />
      <div style={hudGrid} />
    </>
  );
}

function Arise() {
  return (
    <div style={ariseOverlay}>
      <div style={ariseText}>ARISE</div>
    </div>
  );
}

const welcomeMain: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #102c4d 0%, #050816 40%, #02040c 100%)",
  color: "#67e8f9",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  padding: 20,
};

const appMain: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #0f2d4a 0%, #050816 35%, #02040c 100%)",
  color: "#67e8f9",
  fontFamily: "Arial, sans-serif",
  padding: 16,
  position: "relative",
  overflow: "hidden",
};

const overlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.45))",
};

const centerCard: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  border: "2px solid rgba(34,211,238,0.35)",
  borderRadius: 24,
  padding: 32,
  background: "rgba(2, 6, 23, 0.78)",
  boxShadow: "0 0 50px rgba(34, 211, 238, 0.18)",
  backdropFilter: "blur(10px)",
  display: "grid",
  gap: 12,
  zIndex: 2,
};

const questionCard: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  border: "2px solid rgba(34,211,238,0.35)",
  borderRadius: 24,
  padding: 32,
  background: "rgba(2, 6, 23, 0.82)",
  boxShadow: "0 0 50px rgba(34, 211, 238, 0.18)",
  backdropFilter: "blur(10px)",
  display: "grid",
  gap: 14,
  zIndex: 2,
};

const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gap: 20,
  position: "relative",
  zIndex: 1,
};

const heroPanel: React.CSSProperties = {
  border: "2px solid #22d3ee33",
  borderRadius: 20,
  padding: 24,
  background: "rgba(5, 8, 22, 0.85)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const heroActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
};

const miniButton: React.CSSProperties = {
  borderRadius: 999,
  border: "1px solid rgba(34,211,238,0.25)",
  background: "transparent",
  color: "#67e8f9",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const heroTitle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 54,
  fontWeight: 900,
  lineHeight: 1,
};

const heroTitleSmall: React.CSSProperties = {
  margin: "6px 0 8px",
  fontSize: 36,
  fontWeight: 900,
};

const heroText: React.CSSProperties = {
  margin: 0,
  color: "#a5f3fc",
  fontSize: 18,
  lineHeight: 1.7,
  maxWidth: 620,
};

const heroTextSmall: React.CSSProperties = {
  margin: 0,
  color: "#a5f3fc",
  lineHeight: 1.6,
};

const miniLabel: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.35em",
  color: "#22d3ee",
};

const counterText: React.CSSProperties = {
  margin: 0,
  color: "#22d3ee",
  fontSize: 13,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};

const questionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.2,
  fontWeight: 900,
  minHeight: 88,
};

const cursor: React.CSSProperties = {
  opacity: 0.8,
};

const rankBadge: React.CSSProperties = {
  border: "1px solid rgba(34,211,238,0.4)",
  color: "#67e8f9",
  padding: "10px 16px",
  borderRadius: 999,
  fontWeight: 800,
  background: "rgba(34,211,238,0.08)",
};

const primaryButton: React.CSSProperties = {
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(90deg, #06b6d4, #67e8f9)",
  color: "#001018",
  padding: "14px 16px",
  fontWeight: 800,
  cursor: "pointer",
  width: "100%",
};

const secondaryButton: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(34,211,238,0.2)",
  background: "transparent",
  color: "#67e8f9",
  padding: "14px 16px",
  cursor: "pointer",
  width: "100%",
};

const buttonRow: React.CSSProperties = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  marginTop: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(34,211,238,0.2)",
  background: "#020617",
  color: "#67e8f9",
  padding: "12px 14px",
  outline: "none",
  boxSizing: "border-box",
};

const choiceGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const choiceButton: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(34,211,238,0.16)",
  background: "#020617",
  color: "#67e8f9",
  padding: "14px 16px",
  cursor: "pointer",
  transition: "0.2s",
};

const choiceActive: React.CSSProperties = {
  background: "rgba(34,211,238,0.12)",
  border: "1px solid rgba(34,211,238,0.5)",
  boxShadow: "0 0 18px rgba(34,211,238,0.12)",
};

const grid4: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const statCard: React.CSSProperties = {
  border: "2px solid #22d3ee33",
  borderRadius: 18,
  padding: 18,
  background: "rgba(5, 8, 22, 0.85)",
};

const statTitle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#a5f3fc",
  fontSize: 14,
};

const statValue: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 800,
};

const panel: React.CSSProperties = {
  border: "2px solid #22d3ee33",
  borderRadius: 20,
  padding: 22,
  background: "rgba(5, 8, 22, 0.85)",
};

const panelTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 18,
  fontSize: 24,
};

const infoLine: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px solid rgba(34,211,238,0.08)",
  flexWrap: "wrap",
};

const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 20,
};

const questRowWrap: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  borderRadius: 16,
  border: "1px solid rgba(34,211,238,0.12)",
  background: "#020617",
  color: "#67e8f9",
  padding: "14px 16px",
  marginBottom: 10,
  flexWrap: "wrap",
};

const questInfoWrap: React.CSSProperties = {
  display: "grid",
  gap: 4,
  minWidth: 180,
  flex: 1,
};

const questActionWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const questStatusBadge: React.CSSProperties = {
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 700,
  border: "1px solid rgba(34,211,238,0.2)",
};

const questStatusDone: React.CSSProperties = {
  color: "#4ade80",
  border: "1px solid rgba(74,222,128,0.35)",
  background: "rgba(22,101,52,0.18)",
};

const questStatusPending: React.CSSProperties = {
  color: "#67e8f9",
  border: "1px solid rgba(34,211,238,0.25)",
  background: "rgba(34,211,238,0.08)",
};

const questToggleButton: React.CSSProperties = {
  borderRadius: 10,
  border: "none",
  padding: "10px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const questDoneButton: React.CSSProperties = {
  background: "linear-gradient(90deg, #06b6d4, #67e8f9)",
  color: "#001018",
};

const questUndoButton: React.CSSProperties = {
  background: "transparent",
  color: "#67e8f9",
  border: "1px solid rgba(34,211,238,0.25)",
};

const attributeRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: 14,
  border: "1px solid rgba(34,211,238,0.12)",
  background: "#020617",
  padding: "14px 16px",
  marginBottom: 10,
};

const addButton: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(90deg, #06b6d4, #67e8f9)",
  color: "#001018",
  fontWeight: 800,
  cursor: "pointer",
};

const smallHint: React.CSSProperties = {
  color: "#a5f3fc",
  fontSize: 13,
  marginTop: 4,
};

const footerRow: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const box: React.CSSProperties = {
  marginTop: 16,
  borderRadius: 16,
  border: "1px solid rgba(34,211,238,0.12)",
  background: "#020617",
  padding: 16,
};

const progressWrap: React.CSSProperties = {
  marginBottom: 14,
};

const progressLabelRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 8,
};

const mutedTitle: React.CSSProperties = {
  fontWeight: 700,
  marginBottom: 8,
};

const mutedText: React.CSSProperties = {
  color: "#a5f3fc",
  fontSize: 14,
  lineHeight: 1.5,
};

const historyRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(34, 211, 238, 0.12)",
  background: "#020617",
  marginBottom: 10,
  gap: 12,
  flexWrap: "wrap",
};

const bossRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(34,211,238,0.12)",
  background: "#020617",
  marginBottom: 10,
};

const hpOuter: React.CSSProperties = {
  marginTop: 10,
  height: 10,
  borderRadius: 999,
  background: "#0f172a",
  overflow: "hidden",
  border: "1px solid rgba(34,211,238,0.15)",
};

const hpInner: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, #06b6d4, #67e8f9)",
};

const skillGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 12,
};

const skillCard: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(34,211,238,0.12)",
  background: "#020617",
  padding: 14,
};

const skillUnlocked: React.CSSProperties = {
  border: "1px solid rgba(74,222,128,0.4)",
  boxShadow: "0 0 18px rgba(74,222,128,0.08)",
};

const warningBox: React.CSSProperties = {
  border: "1px solid rgba(248,113,113,0.4)",
  background: "rgba(127,29,29,0.25)",
  color: "#fecaca",
  padding: "12px 16px",
  borderRadius: 14,
};

const toastBox: React.CSSProperties = {
  border: "1px solid rgba(34,211,238,0.35)",
  background: "rgba(34,211,238,0.1)",
  color: "#67e8f9",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 800,
  textAlign: "center",
};

const glowA: React.CSSProperties = {
  position: "absolute",
  width: 500,
  height: 500,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(34,211,238,0.28), transparent 60%)",
  top: -80,
  left: -80,
  filter: "blur(20px)",
};

const glowB: React.CSSProperties = {
  position: "absolute",
  width: 460,
  height: 460,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 60%)",
  bottom: -120,
  right: -90,
  filter: "blur(20px)",
};

const grid: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)",
  backgroundSize: "42px 42px",
  opacity: 0.22,
};

const scan: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.08) 48%, transparent 52%, transparent 100%)",
  backgroundSize: "100% 180px",
  opacity: 0.5,
};

const hudGlow: React.CSSProperties = {
  position: "absolute",
  inset: "-20% -10% auto -10%",
  height: 320,
  background: "radial-gradient(circle at top, rgba(34,211,238,0.14), transparent 60%)",
};

const hudGrid: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
  backgroundSize: "38px 38px",
  pointerEvents: "none",
};

const ariseOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.82)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
};

const ariseText: React.CSSProperties = {
  fontSize: "clamp(52px, 10vw, 120px)",
  fontWeight: 900,
  letterSpacing: "0.16em",
  color: "#67e8f9",
  textShadow: "0 0 30px rgba(34,211,238,0.5)",
};
"use client";

import React, { useEffect, useMemo, useState } from 'react';

type Goal = 'emagrecer' | 'forca' | 'condicionamento' | 'disciplina';
type Place = 'casa' | 'rua' | 'academia';
type LevelType = 'sedentario' | 'iniciante' | 'intermediario' | 'avancado';
type TimeType = '10' | '20' | '40';
type Equipment = 'nenhum' | 'barra' | 'halter' | 'academia';
type AttributeKey = 'forca' | 'vitalidade' | 'agilidade' | 'disciplina';

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
};

type GeneratedPlan = {
  className: string;
  focus: string;
  targetWeight: string;
  missions: Omit<Mission, 'done'>[];
};

type Boss = {
  name: string;
  description: string;
  rewardXp: number;
  done: boolean;
};

type Attributes = Record<AttributeKey, number>;

const SAVE_KEY = 'soloup-v4-save';
const questionOrder = ['name', 'age', 'height', 'weight', 'goal', 'place', 'levelType', 'timeType', 'equipment'] as const;
type StepKey = (typeof questionOrder)[number];

const exerciseBank = {
  emagrecer: {
    casa: {
      sedentario: {
        '10': [
          { id: 'walk', label: 'Caminhada leve 10 min', xp: 40 },
          { id: 'sq', label: '15 agachamentos', xp: 20 },
          { id: 'water', label: '2L+ de água', xp: 20 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '20': [
          { id: 'walk', label: 'Caminhada 20 min', xp: 60 },
          { id: 'sq', label: '20 agachamentos', xp: 25 },
          { id: 'abs', label: '20 abdominais', xp: 20 },
          { id: 'water', label: '2L+ de água', xp: 20 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '40': [
          { id: 'walk', label: 'Caminhada 30 min', xp: 70 },
          { id: 'sq', label: '30 agachamentos', xp: 30 },
          { id: 'push', label: '10 flexões inclinadas', xp: 25 },
          { id: 'abs', label: '30 abdominais', xp: 25 },
          { id: 'water', label: '2L+ de água', xp: 20 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
      },
      iniciante: {
        '10': [
          { id: 'walk', label: 'Caminhada rápida 10 min', xp: 45 },
          { id: 'push', label: '10 flexões', xp: 25 },
          { id: 'water', label: '2L+ de água', xp: 20 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '20': [
          { id: 'walk', label: 'Caminhada rápida 20 min', xp: 65 },
          { id: 'push', label: '20 flexões', xp: 35 },
          { id: 'abs', label: '30 abdominais', xp: 25 },
          { id: 'sq', label: '30 agachamentos', xp: 30 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '40': [
          { id: 'cardio', label: 'Caminhada/corrida 30 min', xp: 80 },
          { id: 'push', label: '30 flexões', xp: 40 },
          { id: 'abs', label: '40 abdominais', xp: 30 },
          { id: 'sq', label: '40 agachamentos', xp: 35 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
      },
      intermediario: {
        '10': [
          { id: 'cardio', label: 'HIIT 10 min', xp: 55 },
          { id: 'push', label: '20 flexões', xp: 35 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '20': [
          { id: 'cardio', label: 'HIIT 15 min', xp: 70 },
          { id: 'push', label: '35 flexões', xp: 45 },
          { id: 'abs', label: '40 abdominais', xp: 30 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '40': [
          { id: 'cardio', label: 'Circuito cardio 30 min', xp: 90 },
          { id: 'push', label: '45 flexões', xp: 50 },
          { id: 'sq', label: '50 agachamentos', xp: 40 },
          { id: 'abs', label: '50 abdominais', xp: 35 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
      },
    },
    rua: {
      sedentario: {
        '10': [
          { id: 'walk', label: 'Caminhada leve 10 min', xp: 40 },
          { id: 'water', label: '2L+ de água', xp: 20 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '20': [
          { id: 'walk', label: 'Caminhada 20 min', xp: 60 },
          { id: 'stairs', label: '2 tiros curtos', xp: 20 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '40': [
          { id: 'walk', label: 'Caminhada 30 min', xp: 70 },
          { id: 'stairs', label: '4 tiros curtos', xp: 30 },
          { id: 'abs', label: '20 abdominais', xp: 20 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
      },
      iniciante: {
        '10': [
          { id: 'jog', label: 'Caminhada rápida 10 min', xp: 45 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '20': [
          { id: 'jog', label: 'Caminhada/corrida 20 min', xp: 70 },
          { id: 'bars', label: '10 barras ou australianas', xp: 35 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '40': [
          { id: 'run', label: 'Cardio 30 min', xp: 85 },
          { id: 'bars', label: '15 barras ou australianas', xp: 40 },
          { id: 'abs', label: '30 abdominais', xp: 25 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
      },
      intermediario: {
        '10': [
          { id: 'run', label: 'Sprint/corrida 10 min', xp: 60 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '20': [
          { id: 'run', label: 'Corrida intervalada 20 min', xp: 80 },
          { id: 'bars', label: '20 barras ou australianas', xp: 45 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
        '40': [
          { id: 'run', label: 'Corrida intervalada 30 min', xp: 95 },
          { id: 'bars', label: '25 barras ou australianas', xp: 50 },
          { id: 'push', label: '35 flexões', xp: 40 },
          { id: 'food', label: 'Alimentação limpa', xp: 30 },
        ],
      },
    },
    academia: {
      sedentario: {
        '10': [{ id: 'bike', label: 'Bike leve 10 min', xp: 40 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '20': [{ id: 'bike', label: 'Esteira/bike 20 min', xp: 60 }, { id: 'mach', label: '2 máquinas leves', xp: 30 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '40': [{ id: 'bike', label: 'Esteira/bike 25 min', xp: 70 }, { id: 'mach', label: 'Circuito leve 20 min', xp: 40 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
      },
      iniciante: {
        '10': [{ id: 'bike', label: 'Cardio 10 min', xp: 45 }, { id: 'mach', label: 'Supino ou puxada leve', xp: 30 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '20': [{ id: 'bike', label: 'Cardio 15 min', xp: 60 }, { id: 'mach', label: 'Treino leve 20 min', xp: 45 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '40': [{ id: 'bike', label: 'Cardio 20 min', xp: 70 }, { id: 'mach', label: 'Treino full body 25 min', xp: 55 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
      },
      intermediario: {
        '10': [{ id: 'cardio', label: 'Cardio intenso 10 min', xp: 60 }, { id: 'mach', label: 'Superset rápido', xp: 35 }],
        '20': [{ id: 'cardio', label: 'Cardio 15 min', xp: 70 }, { id: 'mach', label: 'Treino intenso 20 min', xp: 55 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '40': [{ id: 'cardio', label: 'Cardio 20 min', xp: 80 }, { id: 'mach', label: 'Treino full body intenso', xp: 70 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
      },
    },
  },
  forca: {
    casa: {
      sedentario: {
        '10': [{ id: 'sq', label: '15 agachamentos', xp: 20 }, { id: 'wallpush', label: '10 flexões na parede', xp: 20 }, { id: 'water', label: '2L+ de água', xp: 20 }],
        '20': [{ id: 'sq', label: '25 agachamentos', xp: 25 }, { id: 'push', label: '10 flexões inclinadas', xp: 25 }, { id: 'abs', label: '20 abdominais', xp: 20 }],
        '40': [{ id: 'sq', label: '35 agachamentos', xp: 30 }, { id: 'push', label: '20 flexões inclinadas', xp: 30 }, { id: 'abs', label: '30 abdominais', xp: 25 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
      },
      iniciante: {
        '10': [{ id: 'push', label: '15 flexões', xp: 30 }, { id: 'sq', label: '25 agachamentos', xp: 25 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
        '20': [{ id: 'push', label: '25 flexões', xp: 40 }, { id: 'sq', label: '35 agachamentos', xp: 30 }, { id: 'abs', label: '30 abdominais', xp: 25 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
        '40': [{ id: 'push', label: '35 flexões', xp: 50 }, { id: 'sq', label: '45 agachamentos', xp: 35 }, { id: 'abs', label: '40 abdominais', xp: 30 }, { id: 'lunges', label: '20 avanços', xp: 25 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
      },
      intermediario: {
        '10': [{ id: 'push', label: '25 flexões', xp: 40 }, { id: 'sq', label: '35 agachamentos', xp: 30 }],
        '20': [{ id: 'push', label: '40 flexões', xp: 50 }, { id: 'sq', label: '50 agachamentos', xp: 40 }, { id: 'abs', label: '40 abdominais', xp: 30 }],
        '40': [{ id: 'push', label: '50 flexões', xp: 60 }, { id: 'sq', label: '60 agachamentos', xp: 45 }, { id: 'abs', label: '50 abdominais', xp: 35 }, { id: 'lunges', label: '30 avanços', xp: 30 }],
      },
    },
    rua: {
      sedentario: {
        '10': [{ id: 'walk', label: 'Caminhada 10 min', xp: 30 }, { id: 'bars', label: '5 barras ou australianas', xp: 25 }],
        '20': [{ id: 'walk', label: 'Caminhada 15 min', xp: 35 }, { id: 'bars', label: '8 barras ou australianas', xp: 30 }, { id: 'abs', label: '20 abdominais', xp: 20 }],
        '40': [{ id: 'walk', label: 'Caminhada 20 min', xp: 40 }, { id: 'bars', label: '10 barras ou australianas', xp: 35 }, { id: 'push', label: '15 flexões', xp: 30 }],
      },
      iniciante: {
        '10': [{ id: 'bars', label: '10 barras ou australianas', xp: 35 }, { id: 'push', label: '15 flexões', xp: 30 }],
        '20': [{ id: 'bars', label: '15 barras ou australianas', xp: 40 }, { id: 'push', label: '25 flexões', xp: 40 }, { id: 'abs', label: '25 abdominais', xp: 20 }],
        '40': [{ id: 'bars', label: '20 barras ou australianas', xp: 45 }, { id: 'push', label: '35 flexões', xp: 45 }, { id: 'abs', label: '35 abdominais', xp: 25 }, { id: 'run', label: 'Corrida 10 min', xp: 30 }],
      },
      intermediario: {
        '10': [{ id: 'bars', label: '15 barras', xp: 45 }, { id: 'push', label: '25 flexões', xp: 40 }],
        '20': [{ id: 'bars', label: '20 barras', xp: 50 }, { id: 'push', label: '40 flexões', xp: 50 }, { id: 'abs', label: '40 abdominais', xp: 30 }],
        '40': [{ id: 'bars', label: '30 barras', xp: 60 }, { id: 'push', label: '50 flexões', xp: 55 }, { id: 'abs', label: '50 abdominais', xp: 35 }, { id: 'run', label: 'Corrida 15 min', xp: 35 }],
      },
    },
    academia: {
      sedentario: {
        '10': [{ id: 'mach', label: '2 exercícios leves', xp: 30 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
        '20': [{ id: 'mach', label: 'Treino leve 20 min', xp: 45 }, { id: 'bike', label: 'Cardio 10 min', xp: 25 }],
        '40': [{ id: 'mach', label: 'Full body 30 min', xp: 60 }, { id: 'bike', label: 'Cardio 10 min', xp: 25 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
      },
      iniciante: {
        '10': [{ id: 'mach', label: 'Supino + puxada', xp: 40 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
        '20': [{ id: 'mach', label: 'Treino upper/lower 20 min', xp: 55 }, { id: 'bike', label: 'Cardio 10 min', xp: 25 }],
        '40': [{ id: 'mach', label: 'Full body 30 min', xp: 70 }, { id: 'bike', label: 'Cardio 10 min', xp: 25 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
      },
      intermediario: {
        '10': [{ id: 'mach', label: 'Superset de força', xp: 50 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
        '20': [{ id: 'mach', label: 'Treino pesado 20 min', xp: 65 }, { id: 'bike', label: 'Cardio 10 min', xp: 25 }],
        '40': [{ id: 'mach', label: 'Treino pesado full body', xp: 80 }, { id: 'bike', label: 'Cardio 15 min', xp: 30 }, { id: 'food', label: 'Proteína em 2 refeições', xp: 25 }],
      },
    },
  },
  condicionamento: {
    casa: {
      sedentario: {
        '10': [{ id: 'walk', label: 'Marcha no lugar 10 min', xp: 35 }, { id: 'breath', label: 'Respiração 3 min', xp: 10 }],
        '20': [{ id: 'walk', label: 'Cardio leve 15 min', xp: 50 }, { id: 'sq', label: '15 agachamentos', xp: 20 }],
        '40': [{ id: 'walk', label: 'Cardio leve 25 min', xp: 65 }, { id: 'sq', label: '25 agachamentos', xp: 25 }, { id: 'abs', label: '20 abdominais', xp: 20 }],
      },
      iniciante: {
        '10': [{ id: 'cardio', label: 'Circuito 10 min', xp: 45 }, { id: 'abs', label: '20 abdominais', xp: 20 }],
        '20': [{ id: 'cardio', label: 'Circuito 20 min', xp: 65 }, { id: 'push', label: '15 flexões', xp: 30 }],
        '40': [{ id: 'cardio', label: 'Circuito 30 min', xp: 80 }, { id: 'push', label: '20 flexões', xp: 35 }, { id: 'sq', label: '30 agachamentos', xp: 30 }],
      },
      intermediario: {
        '10': [{ id: 'cardio', label: 'HIIT 10 min', xp: 55 }, { id: 'abs', label: '25 abdominais', xp: 25 }],
        '20': [{ id: 'cardio', label: 'HIIT 20 min', xp: 75 }, { id: 'push', label: '25 flexões', xp: 35 }],
        '40': [{ id: 'cardio', label: 'HIIT 30 min', xp: 90 }, { id: 'push', label: '30 flexões', xp: 40 }, { id: 'sq', label: '40 agachamentos', xp: 35 }],
      },
    },
    rua: {
      sedentario: { '10': [{ id: 'walk', label: 'Caminhada 10 min', xp: 35 }], '20': [{ id: 'walk', label: 'Caminhada rápida 20 min', xp: 60 }], '40': [{ id: 'walk', label: 'Caminhada/corrida 30 min', xp: 75 }] },
      iniciante: { '10': [{ id: 'jog', label: 'Trote 10 min', xp: 45 }], '20': [{ id: 'jog', label: 'Trote/caminhada 20 min', xp: 65 }], '40': [{ id: 'run', label: 'Corrida 30 min', xp: 85 }] },
      intermediario: { '10': [{ id: 'run', label: 'Corrida 10 min', xp: 55 }], '20': [{ id: 'run', label: 'Corrida intervalada 20 min', xp: 75 }], '40': [{ id: 'run', label: 'Corrida intervalada 35 min', xp: 95 }] },
    },
    academia: {
      sedentario: { '10': [{ id: 'bike', label: 'Bike leve 10 min', xp: 35 }], '20': [{ id: 'bike', label: 'Bike/esteira 20 min', xp: 55 }], '40': [{ id: 'bike', label: 'Cardio 35 min', xp: 75 }] },
      iniciante: { '10': [{ id: 'bike', label: 'Cardio 10 min', xp: 45 }], '20': [{ id: 'bike', label: 'Cardio 20 min', xp: 65 }], '40': [{ id: 'bike', label: 'Cardio 30 min', xp: 85 }] },
      intermediario: { '10': [{ id: 'bike', label: 'Cardio forte 10 min', xp: 55 }], '20': [{ id: 'bike', label: 'Cardio forte 20 min', xp: 75 }], '40': [{ id: 'bike', label: 'Cardio forte 35 min', xp: 95 }] },
    },
  },
  disciplina: {
    casa: {
      sedentario: {
        '10': [{ id: 'walk', label: 'Caminhada 10 min', xp: 35 }, { id: 'water', label: '2L+ de água', xp: 20 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '20': [{ id: 'walk', label: 'Caminhada 15 min', xp: 45 }, { id: 'push', label: '10 flexões inclinadas', xp: 20 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '40': [{ id: 'walk', label: 'Caminhada 20 min', xp: 55 }, { id: 'push', label: '15 flexões', xp: 25 }, { id: 'abs', label: '20 abdominais', xp: 20 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
      },
      iniciante: {
        '10': [{ id: 'push', label: '15 flexões', xp: 25 }, { id: 'water', label: '2L+ de água', xp: 20 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '20': [{ id: 'walk', label: 'Caminhada 15 min', xp: 45 }, { id: 'push', label: '20 flexões', xp: 30 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '40': [{ id: 'walk', label: 'Caminhada 20 min', xp: 55 }, { id: 'push', label: '25 flexões', xp: 35 }, { id: 'abs', label: '25 abdominais', xp: 25 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
      },
      intermediario: {
        '10': [{ id: 'push', label: '20 flexões', xp: 30 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '20': [{ id: 'walk', label: 'Cardio 15 min', xp: 55 }, { id: 'push', label: '25 flexões', xp: 35 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
        '40': [{ id: 'walk', label: 'Cardio 25 min', xp: 65 }, { id: 'push', label: '30 flexões', xp: 40 }, { id: 'abs', label: '30 abdominais', xp: 30 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }],
      },
    },
    rua: {
      sedentario: { '10': [{ id: 'walk', label: 'Caminhada 10 min', xp: 35 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }], '20': [{ id: 'walk', label: 'Caminhada 20 min', xp: 55 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }], '40': [{ id: 'walk', label: 'Caminhada 30 min', xp: 65 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }] },
      iniciante: { '10': [{ id: 'walk', label: 'Caminhada rápida 10 min', xp: 40 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }], '20': [{ id: 'walk', label: 'Caminhada rápida 20 min', xp: 60 }, { id: 'bars', label: '10 barras ou australianas', xp: 30 }], '40': [{ id: 'run', label: 'Cardio 25 min', xp: 70 }, { id: 'bars', label: '12 barras ou australianas', xp: 35 }] },
      intermediario: { '10': [{ id: 'run', label: 'Cardio 10 min', xp: 45 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }], '20': [{ id: 'run', label: 'Cardio 20 min', xp: 65 }, { id: 'bars', label: '15 barras', xp: 40 }], '40': [{ id: 'run', label: 'Cardio 30 min', xp: 80 }, { id: 'bars', label: '20 barras', xp: 45 }] },
    },
    academia: {
      sedentario: { '10': [{ id: 'bike', label: 'Bike 10 min', xp: 35 }, { id: 'food', label: 'Alimentação limpa', xp: 30 }], '20': [{ id: 'bike', label: 'Bike 20 min', xp: 55 }, { id: 'mach', label: '1 exercício leve', xp: 20 }], '40': [{ id: 'bike', label: 'Cardio 20 min', xp: 55 }, { id: 'mach', label: 'Circuito 20 min', xp: 35 }] },
      iniciante: { '10': [{ id: 'bike', label: 'Cardio 10 min', xp: 40 }, { id: 'mach', label: '1 exercício', xp: 25 }], '20': [{ id: 'bike', label: 'Cardio 15 min', xp: 55 }, { id: 'mach', label: '2 exercícios', xp: 35 }], '40': [{ id: 'bike', label: 'Cardio 20 min', xp: 65 }, { id: 'mach', label: 'Treino 20 min', xp: 45 }] },
      intermediario: { '10': [{ id: 'bike', label: 'Cardio 10 min', xp: 45 }, { id: 'mach', label: '2 exercícios', xp: 30 }], '20': [{ id: 'bike', label: 'Cardio 15 min', xp: 55 }, { id: 'mach', label: 'Treino 20 min', xp: 40 }], '40': [{ id: 'bike', label: 'Cardio 20 min', xp: 65 }, { id: 'mach', label: 'Treino 25 min', xp: 50 }] },
    },
  },
} as const;

function playClickSound() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 720;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}

function enhanceAdvancedMissions(
  missions: ReadonlyArray<{ id: string; label: string; xp: number }>
): { id: string; label: string; xp: number }[] {
  return missions.map((mission) => ({
    id: mission.id,
    label:
      mission.id === 'food' || mission.id === 'water'
        ? mission.label
        : `${mission.label} • modo avançado`,
    xp: mission.xp + 15,
  }));
}

function bmiTarget(height: number) {
  const healthyUpper = 24.9 * height * height;
  const safeTarget = Math.round((healthyUpper - 2) * 10) / 10;
  const firstTarget = Math.round((safeTarget + 5) * 10) / 10;
  return { firstTarget, safeTarget };
}

function buildClass(goal: Goal, place: Place) {
  if (goal === 'emagrecer') return 'Caçador da Queima';
  if (goal === 'forca') return place === 'rua' ? 'Executor de Ferro' : 'Guardião da Força';
  if (goal === 'condicionamento') return 'Predador Cardio';
  return 'Caçador da Disciplina';
}

function buildFocus(goal: Goal) {
  if (goal === 'emagrecer') return 'Redução de gordura + constância';
  if (goal === 'forca') return 'Força funcional + progressão';
  if (goal === 'condicionamento') return 'Fôlego + resistência';
  return 'Disciplina + consistência diária';
}
function getBaseLevel(levelType: LevelType): LevelType {
  if (levelType === 'sedentario') return 'iniciante';
  if (levelType === 'iniciante') return 'iniciante';
  if (levelType === 'intermediario') return 'intermediario';
  if (levelType === 'avancado') return 'avancado';
  return 'iniciante';
function generatePlan(profile: Profile): GeneratedPlan {
  const baseLevel = getBaseLevel(profile.levelType);
  let missions: { id: string; label: string; xp: number }[] = [
  ...exerciseBank[profile.goal][profile.place][baseLevel][profile.timeType],
];
  if (profile.levelType === 'avancado') {
    missions = enhanceAdvancedMissions(missions);
  }

  if (profile.equipment === 'barra' && profile.place !== 'academia') {
    missions.push({
      id: 'barra_bonus',
      label:
        profile.levelType === 'sedentario'
          ? '5 barras ou australianas'
          : profile.levelType === 'iniciante'
          ? '10 barras ou australianas'
          : profile.levelType === 'intermediario'
          ? '15 barras'
          : '20 barras',
      xp: profile.levelType === 'avancado' ? 50 : 35,
    });
  }

  if (profile.equipment === 'halter') {
    missions.push({
      id: 'halter_bonus',
      label:
        profile.levelType === 'sedentario'
          ? 'Rosca/ombro leve com halter'
          : profile.levelType === 'avancado'
          ? 'Circuito pesado com halter'
          : 'Circuito com halter',
      xp: profile.levelType === 'avancado' ? 45 : 30,
    });
  }

  if (!missions.some((m) => m.id === 'water')) {
    missions.push({ id: 'water', label: '2L+ de água', xp: 20 });
  }

  if (!missions.some((m) => m.id === 'food')) {
    missions.push({
      id: 'food',
      label: profile.goal === 'forca' ? 'Proteína em 2 refeições' : 'Alimentação limpa',
      xp: 30,
    });
  }

  const { firstTarget, safeTarget } = bmiTarget(profile.height);
  const targetWeight =
    profile.goal === 'forca'
      ? `${Math.max(profile.weight - 3, Math.round(firstTarget))}kg primeiro, depois recomposição`
      : `${Math.min(profile.weight - 3, firstTarget)}kg primeiro, meta saudável ${safeTarget}kg`;

  return {
    className: buildClass(profile.goal, profile.place),
    focus: buildFocus(profile.goal),
    targetWeight,
    missions,
  };
}

function defaultBosses(): Boss[] {
  return [
    { name: 'Rei da Preguiça', description: 'Complete 3 dias seguidos de treino.', rewardXp: 180, done: false },
    { name: 'General da Água', description: 'Conclua a missão de água em 4 dias.', rewardXp: 120, done: false },
    { name: 'Besta da Rotina', description: 'Complete um dia perfeito na semana.', rewardXp: 240, done: false },
  ];
}

export default function SoloUpV4() {
  const [screen, setScreen] = useState<'welcome' | 'onboarding' | 'system'>('welcome');
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: 25,
    height: 1.7,
    weight: 89,
    goal: 'emagrecer',
    place: 'casa',
    levelType: 'iniciante',
    timeType: '20',
    equipment: 'nenhum',
  });
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [attributePoints, setAttributePoints] = useState(0);
  const [attributes, setAttributes] = useState<Attributes>({ forca: 5, vitalidade: 5, agilidade: 5, disciplina: 5 });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [history, setHistory] = useState<{ day: string; xp: number; perfect: boolean }[]>([]);
  const [typedQuestion, setTypedQuestion] = useState('');
  const [showArise, setShowArise] = useState(false);
  const [bosses, setBosses] = useState<Boss[]>(defaultBosses());
  const [warning, setWarning] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [waterDays, setWaterDays] = useState(0);

  const rank = useMemo(() => {
    if (level >= 15) return 'S';
    if (level >= 11) return 'A';
    if (level >= 7) return 'B';
    if (level >= 4) return 'C';
    if (level >= 2) return 'D';
    return 'E';
  }, [level]);

  const totalToday = useMemo(() => {
    const total = missions.reduce((sum, m) => sum + (m.done ? m.xp : 0), 0);
    return missions.length > 0 && missions.every((m) => m.done) ? total + 100 : total;
  }, [missions]);

  const perfectDay = missions.length > 0 && missions.every((m) => m.done);
  const bmi = useMemo(() => profile.weight / (profile.height * profile.height), [profile.height, profile.weight]);
  const bmiLabel = useMemo(() => (bmi < 18.5 ? 'Abaixo do peso' : bmi < 25 ? 'Saudável' : bmi < 30 ? 'Sobrepeso' : 'Obesidade'), [bmi]);

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
    if (streak >= 10 || perfectCount >= 4) return 'Alta';
    if (streak >= 4 || perfectCount >= 2) return 'Média';
    return 'Base';
  }, [history, streak]);

  const unlockedSkills = useMemo(() => {
    return {
      bruteForce: attributes.forca >= 8,
      ironLung: attributes.vitalidade >= 8,
      shadowStep: attributes.agilidade >= 8,
      monarchMind: attributes.disciplina >= 8,
      eliteHunter: level >= 10,
    };
  }, [attributes, level]);

  useEffect(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      setScreen(saved.screen ?? 'welcome');
      setCurrentStep(saved.currentStep ?? 0);
      setProfile(saved.profile ?? profile);
      setPlan(saved.plan ?? null);
      setXp(saved.xp ?? 0);
      setLevel(saved.level ?? 1);
      setStreak(saved.streak ?? 0);
      setBestStreak(saved.bestStreak ?? 0);
      setAttributePoints(saved.attributePoints ?? 0);
      setAttributes(saved.attributes ?? { forca: 5, vitalidade: 5, agilidade: 5, disciplina: 5 });
      setMissions(saved.missions ?? []);
      setHistory(saved.history ?? []);
      setBosses(saved.bosses ?? defaultBosses());
      setWaterDays(saved.waterDays ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ screen, currentStep, profile, plan, xp, level, streak, bestStreak, attributePoints, attributes, missions, history, bosses, waterDays })
    );
  }, [screen, currentStep, profile, plan, xp, level, streak, bestStreak, attributePoints, attributes, missions, history, bosses, waterDays]);

  useEffect(() => {
    if (screen !== 'onboarding') return;
    const stepKey = questionOrder[currentStep];
    const textMap: Record<StepKey, string> = {
      name: 'Sistema detectou um novo jogador. Qual é o seu nome?',
      age: `${profile.name || 'Caçador'}, qual é a sua idade?`,
      height: 'Informe sua altura para o sistema calcular sua evolução.',
      weight: 'Agora informe seu peso atual.',
      goal: 'Qual é o seu objetivo principal?',
      place: 'Onde você treina com mais frequência?',
      levelType: 'Qual é o seu nível atual de atividade física?',
      timeType: 'Quanto tempo por dia você consegue treinar?',
      equipment: 'Qual equipamento você tem disponível?',
    };
    const full = textMap[stepKey];
    setTypedQuestion('');
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTypedQuestion(full.slice(0, i));
      if (i >= full.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [screen, currentStep, profile.name]);

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
    const generated = generatePlan(profile);
    setPlan(generated);
    setMissions(generated.missions.map((m) => ({ ...m, done: false })));
    setShowArise(true);
    setTimeout(() => {
      setShowArise(false);
      setScreen('system');
    }, 1200);
  }

  function toggleMission(id: string) {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  }

  function addAttribute(attr: AttributeKey) {
    if (attributePoints <= 0) return;
    setAttributes((prev) => ({ ...prev, [attr]: prev[attr] + 1 }));
    setAttributePoints((prev) => prev - 1);
  }

  function concludeDay() {
    if (totalToday === 0) {
      setWarning('⚠️ Sistema detectou negligência. Nenhuma missão foi concluída.');
      setStreak(0);
      return;
    }

    setWarning('');
    const waterDone = missions.some((m) => m.id === 'water' && m.done);
    const totalXp = xp + totalToday + streakBonus;
    const levelGain = Math.floor(totalXp / 100);
    const nextXp = totalXp % 100;

    if (levelGain > 0) {
      setLevel((prev) => prev + levelGain);
      setAttributePoints((prev) => prev + levelGain * 3);
      alert('⚡ LEVEL UP ⚡ Novos pontos de atributo disponíveis.');
    }

    setXp(nextXp);

    const newStreak = streak + 1;
    setStreak(newStreak);
    setBestStreak((prev) => Math.max(prev, newStreak));
    if (waterDone) setWaterDays((prev) => prev + 1);

    setHistory((prev) => [
      { day: new Date().toLocaleDateString('pt-BR'), xp: totalToday + streakBonus, perfect: perfectDay },
      ...prev,
    ]);

    setBosses((prev) =>
      prev.map((boss) => {
        if (boss.done) return boss;
        if (boss.name === 'Rei da Preguiça' && newStreak >= 3) return { ...boss, done: true };
        if (boss.name === 'General da Água' && (waterDone ? waterDays + 1 : waterDays) >= 4) return { ...boss, done: true };
        if (boss.name === 'Besta da Rotina' && perfectDay) return { ...boss, done: true };
        return boss;
      })
    );

    setMissions((prev) => prev.map((m) => ({ ...m, done: false })));
  }

  function failDay() {
    setWarning('⚠️ Sistema detectou falha. Missão de recuperação aplicada.');
    setStreak(0);
    setXp((prev) => Math.max(0, prev - 20));
    setMissions((prev) =>
      prev.map((m, idx) =>
        idx === 0 ? { ...m, label: `${m.label} + recuperação extra`, done: false } : { ...m, done: false }
      )
    );
  }

  function resetAll() {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }

  async function shareBuild() {
    const text = `SOLOUP BUILD
Nome: ${profile.name}
Classe: ${plan?.className ?? '-'}
Rank: ${rank}
Level: ${level}
Foco: ${plan?.focus ?? '-'}
Meta: ${plan?.targetWeight ?? '-'}
Atributos -> Força ${attributes.forca} | Vitalidade ${attributes.vitalidade} | Agilidade ${attributes.agilidade} | Disciplina ${attributes.disciplina}
Dificuldade semanal: ${weeklyDifficulty}`;
    try {
      await navigator.clipboard.writeText(text);
      setShareMessage('Build copiada.');
      setTimeout(() => setShareMessage(''), 2000);
    } catch {
      setShareMessage('Não foi possível copiar.');
      setTimeout(() => setShareMessage(''), 2000);
    }
  }

  if (screen === 'welcome') {
    return (
      <main style={welcomeMain}>
        <SystemBG />
        <div style={overlay} />
        <section style={centerCard}>
          <p style={miniLabel}>SOLOUP SYSTEM</p>
          <h1 style={heroTitle}>Desperte.</h1>
          <p style={heroText}>O sistema fitness inspirado em Solo Leveling. Crie seu personagem, receba um plano automático e suba de rank na vida real.</p>
          <button style={primaryButton} onClick={() => click(() => setScreen('onboarding'))}>Criar personagem</button>
        </section>
      </main>
    );
  }

  if (screen === 'onboarding') {
    const stepKey = questionOrder[currentStep];
    return (
      <main style={welcomeMain}>
        <SystemBG />
        <div style={overlay} />
        <section style={questionCard}>
          <p style={miniLabel}>CRIAÇÃO DE PERSONAGEM</p>
          <p style={counterText}>Etapa {currentStep + 1} / {questionOrder.length}</p>
          <h2 style={questionTitle}>{typedQuestion}<span style={cursor}>|</span></h2>
          {stepKey === 'name' && <input style={inputStyle} placeholder="Seu nome" value={profile.name} onChange={(e) => updateProfile('name', e.target.value)} />}
          {stepKey === 'age' && <input style={inputStyle} type="number" value={profile.age} onChange={(e) => updateProfile('age', Number(e.target.value || 0))} />}
          {stepKey === 'height' && <input style={inputStyle} type="number" step="0.01" value={profile.height} onChange={(e) => updateProfile('height', Number(e.target.value || 0))} />}
          {stepKey === 'weight' && <input style={inputStyle} type="number" step="0.1" value={profile.weight} onChange={(e) => updateProfile('weight', Number(e.target.value || 0))} />}
          {stepKey === 'goal' && <div style={choiceGrid}><Choice label="Emagrecer" active={profile.goal === 'emagrecer'} onClick={() => click(() => updateProfile('goal', 'emagrecer'))} /><Choice label="Ganhar força" active={profile.goal === 'forca'} onClick={() => click(() => updateProfile('goal', 'forca'))} /><Choice label="Condicionamento" active={profile.goal === 'condicionamento'} onClick={() => click(() => updateProfile('goal', 'condicionamento'))} /><Choice label="Disciplina" active={profile.goal === 'disciplina'} onClick={() => click(() => updateProfile('goal', 'disciplina'))} /></div>}
          {stepKey === 'place' && <div style={choiceGrid}><Choice label="Casa" active={profile.place === 'casa'} onClick={() => click(() => updateProfile('place', 'casa'))} /><Choice label="Rua" active={profile.place === 'rua'} onClick={() => click(() => updateProfile('place', 'rua'))} /><Choice label="Academia" active={profile.place === 'academia'} onClick={() => click(() => updateProfile('place', 'academia'))} /></div>}
          {stepKey === 'levelType' && <div style={choiceGrid}><Choice label="Sedentário" active={profile.levelType === 'sedentario'} onClick={() => click(() => updateProfile('levelType', 'sedentario'))} /><Choice label="Iniciante" active={profile.levelType === 'iniciante'} onClick={() => click(() => updateProfile('levelType', 'iniciante'))} /><Choice label="Intermediário" active={profile.levelType === 'intermediario'} onClick={() => click(() => updateProfile('levelType', 'intermediario'))} /><Choice label="Avançado" active={profile.levelType === 'avancado'} onClick={() => click(() => updateProfile('levelType', 'avancado'))} /></div>}
          {stepKey === 'timeType' && <div style={choiceGrid}><Choice label="10 min" active={profile.timeType === '10'} onClick={() => click(() => updateProfile('timeType', '10'))} /><Choice label="20 min" active={profile.timeType === '20'} onClick={() => click(() => updateProfile('timeType', '20'))} /><Choice label="40 min" active={profile.timeType === '40'} onClick={() => click(() => updateProfile('timeType', '40'))} /></div>}
          {stepKey === 'equipment' && <div style={choiceGrid}><Choice label="Nenhum" active={profile.equipment === 'nenhum'} onClick={() => click(() => updateProfile('equipment', 'nenhum'))} /><Choice label="Barra" active={profile.equipment === 'barra'} onClick={() => click(() => updateProfile('equipment', 'barra'))} /><Choice label="Halter" active={profile.equipment === 'halter'} onClick={() => click(() => updateProfile('equipment', 'halter'))} /><Choice label="Academia completa" active={profile.equipment === 'academia'} onClick={() => click(() => updateProfile('equipment', 'academia'))} /></div>}
          <button style={primaryButton} onClick={() => click(nextStep)}>{currentStep === questionOrder.length - 1 ? 'Gerar sistema' : 'Próximo'}</button>
        </section>
        {showArise && <Arise />}
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
            <p style={heroTextSmall}>{plan?.className} • {plan?.focus}</p>
          </div>
          <div style={rankBadge}>Rank {rank}</div>
        </section>

        {warning && <div style={warningBox}>{warning}</div>}

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
          <InfoLine label="Classe" value={plan?.className ?? '-'} />
          <InfoLine label="Foco" value={plan?.focus ?? '-'} />
          <InfoLine label="Meta inicial" value={plan?.targetWeight ?? '-'} />
          <InfoLine label="Altura / Peso" value={`${profile.height.toFixed(2)}m / ${profile.weight}kg`} />
          <InfoLine label="Objetivo" value={labelGoal(profile.goal)} />
          <InfoLine label="Local" value={labelPlace(profile.place)} />
          <InfoLine label="Nível atual" value={labelLevel(profile.levelType)} />
          <InfoLine label="Tempo por dia" value={`${profile.timeType} min`} />
          <InfoLine label="Equipamento" value={labelEquipment(profile.equipment)} />
          <InfoLine label="Faixa corporal" value={bmiLabel} />
        </Panel>

        <section style={twoCol}>
          <Panel title="Boss semanal e guia">
            <div style={box}><p style={mutedTitle}>Como derrotar os bosses</p><p style={mutedText}>Rei da Preguiça: mantenha 3 dias seguidos. General da Água: conclua a missão de água em 4 dias. Besta da Rotina: feche um dia perfeito com todas as quests marcadas.</p></div>
            {bosses.map((boss, index) => (
              <div key={`${boss.name}-${index}`} style={bossRow}>
                <div>
                  <div style={{ fontWeight: 700 }}>{boss.name}</div>
                  <div style={smallHint}>{boss.description}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: boss.done ? '#4ade80' : '#67e8f9', fontWeight: 700 }}>{boss.done ? 'Derrotado' : `+${boss.rewardXp} XP`}</div>
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Diretiva do sistema">
            <div style={box}><p style={mutedTitle}>Alimentação</p><p style={mutedText}>Baseie a rotina em comida simples: ovos, frango, arroz, feijão, carne, banana, aveia, legumes e água. Segure refrigerante, doce diário e belisco noturno.</p></div>
            <div style={box}><p style={mutedTitle}>Recompensas</p><p style={mutedText}>Dias perfeitos rendem mais EXP. Manter streaks libera bônus progressivos e ajuda a derrotar bosses semanais.</p></div>
            <div style={box}><p style={mutedTitle}>Penalidade</p><p style={mutedText}>Falhar zera o streak atual, reduz XP e pode gerar missão de recuperação. O sistema recompensa constância, não perfeição absoluta.</p></div>
          </Panel>
        </section>

        <section style={twoCol}>
          <Panel title="Skill Tree do Caçador">
            <div style={box}><p style={mutedTitle}>Dificuldade semanal</p><p style={mutedText}>Estado atual do sistema: <strong>{weeklyDifficulty}</strong>. Quanto mais dias perfeitos e streak, mais o SoloUp vai endurecendo sua jornada.</p></div>
            <div style={skillGrid}>
              <SkillCard title="Brute Force" unlocked={unlockedSkills.bruteForce} description="Desbloqueado com Força 8. Representa evolução de treino funcional." />
              <SkillCard title="Iron Lung" unlocked={unlockedSkills.ironLung} description="Desbloqueado com Vitalidade 8. Marca seu avanço em cardio e recuperação." />
              <SkillCard title="Shadow Step" unlocked={unlockedSkills.shadowStep} description="Desbloqueado com Agilidade 8. Indica melhora de velocidade e mobilidade." />
              <SkillCard title="Monarch Mind" unlocked={unlockedSkills.monarchMind} description="Desbloqueado com Disciplina 8. Simboliza constância acima da média." />
              <SkillCard title="Elite Hunter" unlocked={unlockedSkills.eliteHunter} description="Desbloqueado no level 10. Seu primeiro marco de jogador sério." />
            </div>
          </Panel>

          <Panel title="Compartilhar build">
            <div style={box}><p style={mutedTitle}>Resumo social</p><p style={mutedText}>Copie sua build e mande para amigos. Isso já prepara o SoloUp para um futuro ranking e comparação de rotinas.</p></div>
            <div style={infoLine}><span style={mutedText}>Classe</span><strong>{plan?.className ?? '-'}</strong></div>
            <div style={infoLine}><span style={mutedText}>Rank / Level</span><strong>{rank} / {level}</strong></div>
            <div style={infoLine}><span style={mutedText}>Dificuldade semanal</span><strong>{weeklyDifficulty}</strong></div>
            <div style={infoLine}><span style={mutedText}>Melhor streak</span><strong>{bestStreak}</strong></div>
            <button style={primaryButton} onClick={() => click(shareBuild)}>Copiar minha build</button>
            {shareMessage ? <p style={{ ...mutedText, marginTop: 10 }}>{shareMessage}</p> : null}
          </Panel>
        </section>

        <Panel title="Registro">
          {history.length === 0 ? <p style={mutedText}>Nenhum dia concluído ainda.</p> : history.map((h, i) => <div key={`${h.day}-${i}`} style={historyRow}><span>{h.day}{h.perfect ? ' • dia perfeito' : ''}</span><strong>+{h.xp} XP</strong></div>)}
        </Panel>

        <div style={{ display: 'flex', justifyContent: 'center' }}><button style={secondaryButton} onClick={() => click(resetAll)}>Resetar tudo</button></div>
      </div>
    </main>
  );
}

function Choice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} style={{ ...choiceButton, ...(active ? choiceActive : {}) }}>{label}</button>;
}
function StatCard({ title, value }: { title: string; value: string }) {
  return <div style={statCard}><p style={statTitle}>{title}</p><div style={statValue}>{value}</div></div>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={panel}><h2 style={panelTitle}>{title}</h2>{children}</section>;
}
function InfoLine({ label, value }: { label: string; value: string }) {
  return <div style={infoLine}><span style={mutedText}>{label}</span><strong>{value}</strong></div>;
}
function QuestRow({ label, xp, checked, onClick }: { label: string; xp: number; checked: boolean; onClick: () => void }) {
  return <button onClick={onClick} style={questRow}><div><div>{label}</div><div style={smallHint}>+{xp} XP</div></div><span style={{ ...checkBox, ...(checked ? checkedBox : {}) }} /></button>;
}
function AttributeRow({ label, value, onAdd, disabled }: { label: string; value: number; onAdd: () => void; disabled: boolean }) {
  return <div style={attributeRow}><span>{label}</span><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><strong>{value}</strong><button onClick={onAdd} disabled={disabled} style={{ ...addButton, opacity: disabled ? 0.4 : 1 }}>+</button></div></div>;
}
function SystemBG() { return <><div style={glowA} /><div style={glowB} /><div style={grid} /><div style={scan} /></>; }
function HudBG() { return <><div style={hudGlow} /><div style={hudGrid} /></>; }
function Arise() { return <div style={ariseOverlay}><div style={ariseText}>ARISE</div></div>; }
function SkillCard({ title, unlocked, description }: { title: string; unlocked: boolean; description: string }) {
  return <div style={{ ...skillCard, ...(unlocked ? skillUnlocked : {}) }}><div style={{ fontWeight: 700 }}>{title}</div><div style={smallHint}>{description}</div><div style={{ marginTop: 8, color: unlocked ? '#4ade80' : '#67e8f9', fontWeight: 700 }}>{unlocked ? 'Desbloqueada' : 'Bloqueada'}</div></div>;
}
function labelGoal(goal: Goal) { return goal === 'emagrecer' ? 'Emagrecer' : goal === 'forca' ? 'Ganhar força' : goal === 'condicionamento' ? 'Condicionamento' : 'Disciplina'; }
function labelPlace(place: Place) { return place === 'casa' ? 'Casa' : place === 'rua' ? 'Rua' : 'Academia'; }
function labelLevel(levelType: LevelType) { return levelType === 'sedentario' ? 'Sedentário' : levelType === 'iniciante' ? 'Iniciante' : levelType === 'intermediario' ? 'Intermediário' : 'Avançado'; }
function labelEquipment(equipment: Equipment) { return equipment === 'nenhum' ? 'Nenhum' : equipment === 'barra' ? 'Barra' : equipment === 'halter' ? 'Halter' : 'Academia completa'; }

const welcomeMain: React.CSSProperties = { minHeight: '100vh', background: 'radial-gradient(circle at top, #102c4d 0%, #050816 40%, #02040c 100%)', color: '#67e8f9', fontFamily: 'Arial, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: 20 };
const appMain: React.CSSProperties = { minHeight: '100vh', background: 'radial-gradient(circle at top, #0f2d4a 0%, #050816 35%, #02040c 100%)', color: '#67e8f9', fontFamily: 'Arial, sans-serif', padding: 16, position: 'relative', overflow: 'hidden' };
const overlay: React.CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.45))' };
const centerCard: React.CSSProperties = { width: '100%', maxWidth: 720, border: '2px solid rgba(34,211,238,0.35)', borderRadius: 24, padding: 32, background: 'rgba(2, 6, 23, 0.78)', boxShadow: '0 0 50px rgba(34, 211, 238, 0.18)', backdropFilter: 'blur(10px)', display: 'grid', gap: 12, zIndex: 2 };
const questionCard: React.CSSProperties = { width: '100%', maxWidth: 760, border: '2px solid rgba(34,211,238,0.35)', borderRadius: 24, padding: 32, background: 'rgba(2, 6, 23, 0.82)', boxShadow: '0 0 50px rgba(34, 211, 238, 0.18)', backdropFilter: 'blur(10px)', display: 'grid', gap: 14, zIndex: 2 };
const container: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 20, position: 'relative', zIndex: 1 };
const heroPanel: React.CSSProperties = { border: '2px solid #22d3ee33', borderRadius: 20, padding: 24, background: 'rgba(5, 8, 22, 0.85)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' };
const heroTitle: React.CSSProperties = { margin: '4px 0 0', fontSize: 54, fontWeight: 900, lineHeight: 1 };
const heroTitleSmall: React.CSSProperties = { margin: '6px 0 8px', fontSize: 36, fontWeight: 900 };
const heroText: React.CSSProperties = { margin: 0, color: '#a5f3fc', fontSize: 18, lineHeight: 1.7, maxWidth: 620 };
const heroTextSmall: React.CSSProperties = { margin: 0, color: '#a5f3fc', lineHeight: 1.6 };
const miniLabel: React.CSSProperties = { margin: 0, fontSize: 12, letterSpacing: '0.35em', color: '#22d3ee' };
const counterText: React.CSSProperties = { margin: 0, color: '#22d3ee', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' };
const questionTitle: React.CSSProperties = { margin: 0, fontSize: 36, lineHeight: 1.2, fontWeight: 900, minHeight: 88 };
const cursor: React.CSSProperties = { opacity: 0.8 };
const rankBadge: React.CSSProperties = { border: '1px solid rgba(34,211,238,0.4)', color: '#67e8f9', padding: '10px 16px', borderRadius: 999, fontWeight: 800, background: 'rgba(34,211,238,0.08)' };
const primaryButton: React.CSSProperties = { borderRadius: 12, border: 'none', background: 'linear-gradient(90deg, #06b6d4, #67e8f9)', color: '#001018', padding: '14px 16px', fontWeight: 800, cursor: 'pointer', width: '100%' };
const secondaryButton: React.CSSProperties = { borderRadius: 12, border: '1px solid rgba(34,211,238,0.2)', background: 'transparent', color: '#67e8f9', padding: '14px 16px', cursor: 'pointer', width: '100%' };
const buttonRow: React.CSSProperties = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 16 };
const inputStyle: React.CSSProperties = { width: '100%', borderRadius: 12, border: '1px solid rgba(34,211,238,0.2)', background: '#020617', color: '#67e8f9', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' };
const choiceGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 };
const choiceButton: React.CSSProperties = { borderRadius: 14, border: '1px solid rgba(34,211,238,0.16)', background: '#020617', color: '#67e8f9', padding: '14px 16px', cursor: 'pointer', transition: '0.2s' };
const choiceActive: React.CSSProperties = { background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.5)', boxShadow: '0 0 18px rgba(34,211,238,0.12)' };
const grid4: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 };
const statCard: React.CSSProperties = { border: '2px solid #22d3ee33', borderRadius: 18, padding: 18, background: 'rgba(5, 8, 22, 0.85)' };
const statTitle: React.CSSProperties = { margin: '0 0 10px', color: '#a5f3fc', fontSize: 14 };
const statValue: React.CSSProperties = { fontSize: 30, fontWeight: 800 };
const panel: React.CSSProperties = { border: '2px solid #22d3ee33', borderRadius: 20, padding: 22, background: 'rgba(5, 8, 22, 0.85)' };
const panelTitle: React.CSSProperties = { marginTop: 0, marginBottom: 18, fontSize: 24 };
const infoLine: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(34,211,238,0.08)', flexWrap: 'wrap' };
const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 };
const questRow: React.CSSProperties = { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', borderRadius: 16, border: '1px solid rgba(34,211,238,0.12)', background: '#020617', color: '#67e8f9', padding: '14px 16px', cursor: 'pointer', marginBottom: 10 };
const attributeRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, border: '1px solid rgba(34,211,238,0.12)', background: '#020617', padding: '14px 16px', marginBottom: 10 };
const addButton: React.CSSProperties = { width: 32, height: 32, borderRadius: 999, border: 'none', background: 'linear-gradient(90deg, #06b6d4, #67e8f9)', color: '#001018', fontWeight: 800, cursor: 'pointer' };
const smallHint: React.CSSProperties = { color: '#a5f3fc', fontSize: 13, marginTop: 4 };
const checkBox: React.CSSProperties = { width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(34,211,238,0.3)', display: 'inline-block' };
const checkedBox: React.CSSProperties = { border: '1px solid #22d3ee', background: '#22d3ee' };
const footerRow: React.CSSProperties = { marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' };
const box: React.CSSProperties = { marginTop: 16, borderRadius: 16, border: '1px solid rgba(34,211,238,0.12)', background: '#020617', padding: 16 };
const mutedTitle: React.CSSProperties = { fontWeight: 700, marginBottom: 8 };
const mutedText: React.CSSProperties = { color: '#a5f3fc', fontSize: 14, lineHeight: 1.5 };
const historyRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(34, 211, 238, 0.12)', background: '#020617', marginBottom: 10, gap: 12, flexWrap: 'wrap' };
const bossRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '14px 16px', borderRadius: 16, border: '1px solid rgba(34,211,238,0.12)', background: '#020617', marginBottom: 10 };
const skillGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 };
const skillCard: React.CSSProperties = { borderRadius: 16, border: '1px solid rgba(34,211,238,0.12)', background: '#020617', padding: 14 };
const skillUnlocked: React.CSSProperties = { border: '1px solid rgba(74,222,128,0.4)', boxShadow: '0 0 18px rgba(74,222,128,0.08)' };
const warningBox: React.CSSProperties = { border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(127,29,29,0.25)', color: '#fecaca', padding: '12px 16px', borderRadius: 14 };
const glowA: React.CSSProperties = { position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.28), transparent 60%)', top: -80, left: -80, filter: 'blur(20px)' };
const glowB: React.CSSProperties = { position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18), transparent 60%)', bottom: -120, right: -90, filter: 'blur(20px)' };
const grid: React.CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)', backgroundSize: '42px 42px', opacity: 0.22 };
const scan: React.CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.08) 48%, transparent 52%, transparent 100%)', backgroundSize: '100% 180px', opacity: 0.5 };
const hudGlow: React.CSSProperties = { position: 'absolute', inset: '-20% -10% auto -10%', height: 320, background: 'radial-gradient(circle at top, rgba(34,211,238,0.14), transparent 60%)' };
const hudGrid: React.CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)', backgroundSize: '38px 38px', pointerEvents: 'none' };
const ariseOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const ariseText: React.CSSProperties = { fontSize: 'clamp(52px, 10vw, 120px)', fontWeight: 900, letterSpacing: '0.16em', color: '#67e8f9', textShadow: '0 0 30px rgba(34,211,238,0.5)' };

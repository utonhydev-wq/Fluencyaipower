import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-step',
    title: 'Primeiros Passos',
    description: 'Conclua sua primeira lição interativa no EnglishFlow.',
    icon: 'Sparkles',
    xpReward: 50,
    isUnlocked: false,
    category: 'xp'
  },
  {
    id: 'ach-streak-3',
    title: 'Chama Acesa',
    description: 'Mantenha 3 dias consecutivos de estudo ativo.',
    icon: 'Flame',
    xpReward: 100,
    isUnlocked: false,
    category: 'streak'
  },
  {
    id: 'ach-streak-7',
    title: 'Hábito de Ferro',
    description: 'Alcance uma semana ininterrupta (7 dias) de prática.',
    icon: 'ShieldCheck',
    xpReward: 250,
    isUnlocked: false,
    category: 'streak'
  },
  {
    id: 'ach-flashcards-master',
    title: 'Memória Ativa',
    description: 'Revise 15 ou mais cartões de vocabulário no sistema SRS.',
    icon: 'Brain',
    xpReward: 120,
    isUnlocked: false,
    category: 'vocab'
  },
  {
    id: 'ach-pronunciation-star',
    title: 'Pronúncia Afiada',
    description: 'Obtenha avaliação "Excelente" (>90%) no treino de voz.',
    icon: 'Mic',
    xpReward: 150,
    isUnlocked: false,
    category: 'pronunciation'
  },
  {
    id: 'ach-roleplay-first',
    title: 'Sem Medo de Falar',
    description: 'Complete uma simulação de conversa realista com a IA.',
    icon: 'MessageSquare',
    xpReward: 180,
    isUnlocked: false,
    category: 'conversation'
  },
  {
    id: 'ach-level-up',
    title: 'Evolução Visível',
    description: 'Alcance 500 XP totais e suba de nível no aplicativo.',
    icon: 'Trophy',
    xpReward: 200,
    isUnlocked: false,
    category: 'xp'
  }
];

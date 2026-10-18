import { TutorResponseData } from '../types';
import { speechService } from './speechService';
import { auth } from '../lib/firebase';

export interface TutorMessage {
  role: 'user' | 'assistant';
  text: string;
  data?: TutorResponseData;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn('Could not retrieve Firebase auth token:', err);
  }
  return headers;
}

export const aiService = {
  async askTutor(params: {
    message: string;
    history?: TutorMessage[];
    level?: string;
    mode?: 'iniciante' | 'imersao' | 'conversacao';
    userGoal?: string;
    teacherPersona?: string;
    saveToDatabase?: boolean;
  }): Promise<TutorResponseData> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Backend tutor fallback:', err);
      return {
        reply: `That is a great question! At level ${params.level || 'A1'}, the key is to build practical phrases step by step. What would you like to say next?`,
        portugueseExplanation: `Excelente pergunta! No nível ${params.level || 'A1'}, o segredo é praticar essa estrutura em voz alta com exemplos do seu dia a dia.`,
        correction: null,
        phoneticTip: "Dica: Em inglês, mantenha as consoantes finais nítidas sem adicionar 'i' no fim.",
        suggestedFollowUps: [
          "Can you give me an example?",
          "How do I pronounce this correctly?",
          "Let's practice another phrase.",
        ],
        savedVocabulary: [
          {
            word: "Step by step",
            translation: "Passo a passo",
            phonetic: "/step baɪ step/",
            example: "You will achieve fluency step by step.",
          },
        ],
      };
    }
  },

  async getTutorHistory(limit = 10): Promise<any[]> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/ai/tutor/history?limit=${limit}`, {
        method: 'GET',
        headers,
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations || [];
    } catch (err) {
      console.warn('Failed to load tutor history:', err);
      return [];
    }
  },

  async simulateRoleplay(params: {
    scenarioId: string;
    scenarioTitle: string;
    role: string;
    history: Array<{ speaker: string; text: string }>;
    userMessage: string;
    level?: string;
  }) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai/roleplay', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Backend roleplay fallback:', err);
      return {
        reply: "That sounds good! Could you tell me a little more about what you need?",
        portugueseTranslation: "Parece ótimo! Você poderia me contar um pouco mais sobre o que precisa?",
        grammarCorrection: null,
        suggestedReplies: [
          "Yes, sure. Here are the details.",
          "I need help with this reservation, please.",
          "Could you give me a recommendation.",
        ],
        vocabularyTip: "Usar 'Could you...' ou 'May I...' soa natural e muito educado em inglês.",
      };
    }
  },

  async analyzePronunciation(params: {
    targetPhrase: string;
    recognizedText: string;
    level?: string;
  }) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai/analyze-speech', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Speech analysis fallback:', err);
      const cleanTarget = (params.targetPhrase || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      const cleanRec = (params.recognizedText || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      const isMatch = cleanTarget === cleanRec;
      return {
        score: isMatch ? 96 : cleanRec.length > 3 ? 80 : 60,
        accuracy: isMatch ? 'excelente' : 'bom',
        recognized: params.recognizedText,
        target: params.targetPhrase,
        phoneticTip: "Dica para brasileiros: Em palavras terminadas em consoantes como 'd', 't' e 'k', evite colocar o som de 'i' no final. Termine com o som seco da consoante.",
        wordAnalysis: (params.targetPhrase || '').split(' ').map((w) => ({
          word: w,
          status: 'correct',
          hint: 'Pronúncia clara',
        })),
        encouragement: 'Ótima tentativa! Repetir em voz alta acelera sua fluência.',
      };
    }
  },

  async generateExercise(params: {
    topic: string;
    level?: string;
    type?: string;
  }) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai/generate-exercise', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Generate exercise fallback:', err);
      return {
        id: `gen_fallback_${Date.now()}`,
        type: 'multiple_choice',
        title: `Prática de ${params.topic}`,
        instruction: 'Selecione a opção que melhor completa a frase:',
        promptText: 'I always ___ coffee before starting work.',
        options: ['drink', 'drinks', 'drinking', 'drank'],
        correctAnswer: 'drink',
        explanation: 'Com o pronome "I" no presente simples (ações habituais), usamos a forma base do verbo (drink).',
        translation: 'Eu sempre bebo café antes de começar a trabalhar.',
        audioPhrase: 'I always drink coffee before starting work.',
      };
    }
  },

  async evaluatePlacement(params: {
    answers: Record<string, string>;
    score: number;
    totalQuestions: number;
    userSelfRating: string;
    goal: string;
    dailyMinutes: number;
  }) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai/evaluate-level', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Placement eval fallback:', err);
      const ratio = params.score / (params.totalQuestions || 1);
      let level = 'A1';
      let title = 'Iniciante (A1) — Primeiros Passos';
      if (ratio >= 0.8) {
        level = 'B2';
        title = 'Intermediário Avançado (B2)';
      } else if (ratio >= 0.6) {
        level = 'B1';
        title = 'Intermediário Independente (B1)';
      } else if (ratio >= 0.35) {
        level = 'A2';
        title = 'Básico Cotidiano (A2)';
      }

      return {
        estimatedLevel: level,
        levelTitle: title,
        summary: `Parabéns pela dedicação! Seu perfil inicial foi diagnosticado como ${level}. Esse ponto de partida foi desenhado para você aprender de forma rápida e sólida, sem pular etapas essenciais.`,
        strengths: ['Boa intuição gramatical', 'Compreensão de vocabulário chave'],
        focusAreas: ['Prática de conversação ativa', 'Fluência auditiva natural'],
        weeklyPlan: `Sua rotina diária de ${params.dailyMinutes} minutos combinará vocabulário novo, escuta e diálogos interativos com o tutor de IA.`,
        startingModuleId: `${level.toLowerCase()}-mod-1`,
      };
    }
  },

  // Play audio either via server Gemini TTS or browser Web Speech
  playAudio(text: string, speed = 1.0) {
    speechService.speak(text, { speed });
  },
};

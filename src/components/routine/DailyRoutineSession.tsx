import React, { useState } from 'react';
import { UserProfile, DailyTimeMinutes } from '../../types';
import { soundService } from '../../services/soundService';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  Play,
  RotateCw,
  BookOpen,
  Mic,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Award
} from 'lucide-react';

interface RoutineStep {
  title: string;
  duration: number; // in minutes
  description: string;
  icon: 'review' | 'lesson' | 'pronunciation' | 'roleplay' | 'summary';
  targetTab: string;
}

interface DailyRoutineSessionProps {
  userProfile: UserProfile;
  onNavigateToTab: (tabId: string) => void;
  onClose: () => void;
}

export const DailyRoutineSession: React.FC<DailyRoutineSessionProps> = ({
  userProfile,
  onNavigateToTab,
  onClose
}) => {
  const dailyMin = userProfile.preferences.dailyMinutes || 15;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Configure steps based on requested daily mode (10, 15, or 25 min)
  const getRoutineSteps = (minutes: DailyTimeMinutes): RoutineStep[] => {
    if (minutes === 10) {
      return [
        { title: 'Revisão Inteligente', duration: 2, description: 'Revise flashcards pendentes com repetição espaçada.', icon: 'review', targetTab: 'vocab' },
        { title: 'Conteúdo Novo', duration: 3, description: 'Conceito rápido, gramática prática e vocabulário.', icon: 'lesson', targetTab: 'track' },
        { title: 'Escuta & Pronúncia', duration: 3, description: 'Ouça áudio nativo e pratique os sons no microfone.', icon: 'pronunciation', targetTab: 'pronunciation' },
        { title: 'Desafio Final', duration: 2, description: 'Perguntas rápidas de consolidação do dia.', icon: 'lesson', targetTab: 'track' },
      ];
    } else if (minutes === 25) {
      return [
        { title: 'Revisão Espaçada', duration: 4, description: 'Fixe vocabulário e expressões antes da curva de esquecimento.', icon: 'review', targetTab: 'vocab' },
        { title: 'Conteúdo Novo', duration: 6, description: 'Lição estruturada com foco em situações práticas.', icon: 'lesson', targetTab: 'track' },
        { title: 'Escuta & Pronúncia', duration: 5, description: 'Treino de ritmo, sons difíceis para brasileiros e fala.', icon: 'pronunciation', targetTab: 'pronunciation' },
        { title: 'Conversação Realista', duration: 6, description: 'Simulação de diálogo no restaurante, hotel ou trabalho com a IA.', icon: 'roleplay', targetTab: 'roleplay' },
        { title: 'Exercícios de Consolidação', duration: 3, description: 'Prática de recuperação ativa e formação de frases.', icon: 'lesson', targetTab: 'track' },
        { title: 'Resumo & Progresso', duration: 1, description: 'Avaliação dos pontos fortes e XP conquistado.', icon: 'summary', targetTab: 'progress' },
      ];
    } else {
      // 15 minutes (default) or 20 minutes
      return [
        { title: 'Revisão de Vocabulário', duration: 3, description: 'Reativação de palavras e expressões memorizadas.', icon: 'review', targetTab: 'vocab' },
        { title: 'Aula Nova do Seu Nível', duration: 4, description: 'Nova lição de microaprendizagem no nível ' + userProfile.level, icon: 'lesson', targetTab: 'track' },
        { title: 'Compreensão Auditiva & Fala', duration: 4, description: 'Treino fonético e audição em velocidade normal/lenta.', icon: 'pronunciation', targetTab: 'pronunciation' },
        { title: 'Exercícios Práticos', duration: 3, description: 'Construção de frases e fixação sem tradução palavra por palavra.', icon: 'lesson', targetTab: 'track' },
        { title: 'Avaliação & Planejamento', duration: 1, description: 'Fechamento do dia e contagem da sequência de estudos.', icon: 'summary', targetTab: 'progress' },
      ];
    }
  };

  const steps = getRoutineSteps(dailyMin);
  const currentStep = steps[currentStepIdx];
  const isAllDone = completedSteps.length === steps.length;

  const handleStepAction = (step: RoutineStep, idx: number) => {
    soundService.playClick();
    if (!completedSteps.includes(idx)) {
      setCompletedSteps([...completedSteps, idx]);
      storageService.addXP(20);
    }
    onNavigateToTab(step.targetTab);
  };

  const handleFinishSession = () => {
    soundService.playLevelUp();
    storageService.addXP(50);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  const getStepIcon = (type: RoutineStep['icon']) => {
    switch (type) {
      case 'review': return <RotateCw className="w-4 h-4 text-amber-400" />;
      case 'lesson': return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'pronunciation': return <Mic className="w-4 h-4 text-indigo-400" />;
      case 'roleplay': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'summary': return <Award className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Sessão Guiada</span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Rotina Diária: {dailyMin} Minutos</h2>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{completedSteps.length} de {steps.length} etapas</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
        />
      </div>

      {/* Routine Steps List */}
      <div className="space-y-3">
        {steps.map((st, idx) => {
          const isCompleted = completedSteps.includes(idx);
          const isCurrent = idx === currentStepIdx;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                isCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : getStepIcon(st.icon)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">Passo {idx + 1} ({st.duration} min)</span>
                    <h4 className="font-bold text-sm text-white">{st.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{st.description}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentStepIdx(idx);
                  handleStepAction(st, idx);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                  isCompleted
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                }`}
              >
                <span>{isCompleted ? 'Refazer' : 'Iniciar'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Finish Session Card */}
      {isAllDone && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/40 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <Award className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-lg font-black text-white">Parabéns! Sessão Diária Completa!</h3>
          <p className="text-xs text-slate-300">
            Você cumpriu sua meta de {dailyMin} minutos hoje. Consistência é o verdadeiro segredo para falar com naturalidade.
          </p>
          <button
            onClick={handleFinishSession}
            className="w-full py-3 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg transition"
          >
            Salvar e Concluir (+50 XP)
          </button>
        </div>
      )}

    </div>
  );
};

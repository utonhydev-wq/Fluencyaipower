import React from 'react';
import { UserProfile, Lesson, Flashcard } from '../../types';
import { CURRICULUM_MODULES } from '../../data/curriculum';
import { soundService } from '../../services/soundService';
import {
  Play,
  Flame,
  Zap,
  Clock,
  RotateCw,
  Sparkles,
  BookOpen,
  MessageSquare,
  Mic,
  Brain,
  ArrowRight,
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  userProfile: UserProfile;
  flashcards: Flashcard[];
  onStartLesson: (lesson: Lesson) => void;
  onStartRoutine: () => void;
  onNavigate: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  flashcards,
  onStartLesson,
  onStartRoutine,
  onNavigate
}) => {
  // Find current/next lesson
  const currentModule = CURRICULUM_MODULES.find(m => m.level === userProfile.level) || CURRICULUM_MODULES[0];
  const allLessons = currentModule.units.flatMap(u => u.lessons);
  const nextLesson = allLessons.find(l => !userProfile.completedLessonIds.includes(l.id)) || allLessons[0];

  // Due flashcards
  const dueCards = flashcards.filter(c => {
    const next = new Date(c.nextReviewDate).getTime();
    return next <= Date.now() + 1000 * 60 * 60 * 12;
  });

  const dailyGoalMinutes = userProfile.preferences.dailyMinutes || 15;
  const progressPercent = Math.min(100, Math.round((userProfile.todayMinutesStudied / dailyGoalMinutes) * 100));

  const handleContinue = () => {
    soundService.playClick();
    onStartLesson(nextLesson);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Olá, {userProfile.name}! 👋
            </h1>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {userProfile.level}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Meta de hoje: <strong>{dailyGoalMinutes} minutos</strong> de estudo ativo.
          </p>
        </div>

        {/* Quick Streak & XP Badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{userProfile.streak} {userProfile.streak === 1 ? 'dia' : 'dias'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-xs shadow-sm">
            <Zap className="w-4 h-4 fill-sky-400" />
            <span>{userProfile.xp} XP</span>
          </div>
        </div>
      </div>

      {/* HERO CARD: "CONTINUAR APRENDENDO" (Primary Action) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-sky-900/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Próxima Lição Recomendada
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {nextLesson.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              {nextLesson.subtitle} — {nextLesson.description}
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end text-xs text-slate-400 flex-shrink-0">
            <span className="flex items-center gap-1 font-mono font-bold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              {nextLesson.durationMinutes} min
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">Microaprendizagem</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleContinue}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Continuar Aprendendo ({nextLesson.durationMinutes} min)</span>
          </button>

          <button
            onClick={onStartRoutine}
            className="py-3.5 px-5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Iniciar Rotina Completa ({dailyGoalMinutes} min)</span>
          </button>
        </div>
      </div>

      {/* DAILY PROGRESS & SRS REVIEW REMINDER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Daily Study Target */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Meta Diária de Estudo</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {userProfile.todayMinutesStudied} / {dailyGoalMinutes} min
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            {progressPercent >= 100
              ? '🎉 Parabéns! Meta do dia atingida. Continue se quiser mais XP!'
              : `Faltam apenas ${Math.max(0, dailyGoalMinutes - userProfile.todayMinutesStudied)} minutos para completar sua meta.`}
          </p>
        </div>

        {/* Spaced Repetition Priority */}
        <div
          onClick={() => onNavigate('vocab')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <RotateCw className="w-4 h-4" />
              <span>Revisão do Dia (SRS)</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {dueCards.length} pendentes
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {dueCards.length > 0
              ? `Você tem ${dueCards.length} cartões programados para revisão hoje antes de esquecer.`
              : 'Seu vocabulário está 100% em dia! Pratique palavras novas no dicionário.'}
          </p>

          <div className="flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition">
            <span>Abrir Flashcards</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* QUICK SHORTCUTS TO APP MODULES */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Pilares de Treinamento
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('track')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-850 text-left transition space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-105 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Trilha A1–C2</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Aulas estruturadas</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('tutor')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-850 text-left transition space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Professor IA</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Tire qualquer dúvida</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('roleplay')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-850 text-left transition space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Conversação</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Simulação de diálogos</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('pronunciation')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-850 text-left transition space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-105 transition">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Pronúncia</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Treino no microfone</p>
            </div>
          </button>
        </div>
      </div>

      {/* WEEKLY PEDAGOGICAL SUMMARY */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Relatório Semanal de Evolução</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {userProfile.weeklyMinutesStudied} min estudados esta semana
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Você já realizou <strong>{userProfile.completedExerciseCount} exercícios</strong> com uma taxa de acerto de <strong>{userProfile.accuracyRate}%</strong>. Sua consistência diária está fortalecendo sua base linguística sem depender de tradução mental!
        </p>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Próximo foco sugerido: Prática de perguntas espontâneas</span>
          <button
            onClick={() => onNavigate('progress')}
            className="text-sky-400 font-semibold hover:text-sky-300 flex items-center gap-1"
          >
            <span>Ver Relatório Completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

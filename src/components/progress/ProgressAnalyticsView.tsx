import React from 'react';
import { UserProfile, CEFRLevel } from '../../types';
import {
  TrendingUp,
  Clock,
  Flame,
  Award,
  CheckCircle2,
  BookOpen,
  Mic,
  Brain,
  Headphones,
  FileText,
  Target
} from 'lucide-react';

interface ProgressAnalyticsViewProps {
  userProfile: UserProfile;
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({ userProfile }) => {
  const levels: Array<{ id: CEFRLevel; label: string; pct: number }> = [
    { id: 'A1', label: 'A1: Primeiros Passos', pct: userProfile.completedLessonIds.length > 0 ? Math.min(100, userProfile.completedLessonIds.length * 40) : 25 },
    { id: 'A2', label: 'A2: Comunicação Cotidiana', pct: userProfile.level === 'A1' ? 10 : 60 },
    { id: 'B1', label: 'B1: Independência', pct: ['B1', 'B2', 'C1', 'C2'].includes(userProfile.level) ? 55 : 5 },
    { id: 'B2', label: 'B2: Comunicação Avançada', pct: ['B2', 'C1', 'C2'].includes(userProfile.level) ? 40 : 0 },
    { id: 'C1', label: 'C1: Fluência Avançada', pct: ['C1', 'C2'].includes(userProfile.level) ? 30 : 0 },
    { id: 'C2', label: 'C2: Domínio & Maestria', pct: userProfile.level === 'C2' ? 20 : 0 },
  ];

  const competencies = [
    { name: 'Compreensão Auditiva (Listening)', score: 85, icon: Headphones, color: 'text-sky-400', bar: 'bg-sky-500' },
    { name: 'Produção Oral & Pronúncia (Speaking)', score: 78, icon: Mic, color: 'text-indigo-400', bar: 'bg-indigo-500' },
    { name: 'Vocabulário & Expressões (SRS)', score: 92, icon: Brain, color: 'text-emerald-400', bar: 'bg-emerald-500' },
    { name: 'Leitura & Interpretação (Reading)', score: 88, icon: BookOpen, color: 'text-amber-400', bar: 'bg-amber-500' },
    { name: 'Estruturas Gramaticais (Grammar)', score: 82, icon: FileText, color: 'text-pink-400', bar: 'bg-pink-500' },
  ];

  const weeklyDays = [
    { day: 'Seg', min: 15, done: true },
    { day: 'Ter', min: 10, done: true },
    { day: 'Qua', min: 20, done: true },
    { day: 'Qui', min: 15, done: true },
    { day: 'Sex', min: 25, done: true },
    { day: 'Sáb', min: 15, done: true },
    { day: 'Dom', min: userProfile.todayMinutesStudied, done: userProfile.todayMinutesStudied > 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Métricas & Evolução</span>
        <h2 className="text-2xl font-black text-white">Painel de Progresso</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
          Acompanhamento transparente das suas competências e tempo de imersão.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Tempo Total</span>
          </div>
          <span className="text-2xl font-black text-white">
            {userProfile.weeklyMinutesStudied} <span className="text-xs font-normal text-slate-400">min/sem</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Sequência</span>
          </div>
          <span className="text-2xl font-black text-amber-400">
            {userProfile.streak} <span className="text-xs font-normal text-slate-400">dias</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Taxa de Acerto</span>
          </div>
          <span className="text-2xl font-black text-emerald-400">
            {userProfile.accuracyRate}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Exercícios Feitos</span>
          </div>
          <span className="text-2xl font-black text-white">
            {userProfile.completedExerciseCount}
          </span>
        </div>
      </div>

      {/* WEEKLY ACTIVITY GRAPH */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            Atividade Semanal de Estudo
          </h3>
          <span className="text-xs text-slate-400 font-mono">Meta: {userProfile.preferences.dailyMinutes} min/dia</span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center pt-2">
          {weeklyDays.map((d, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-28 bg-slate-800/80 rounded-xl p-1 flex flex-col justify-end">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    d.done ? 'bg-gradient-to-t from-sky-600 to-indigo-500' : 'bg-slate-700'
                  }`}
                  style={{ height: `${Math.min(100, (d.min / 25) * 100)}%` }}
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{d.day}</span>
                <span className="text-[10px] text-slate-400 font-mono">{d.min}m</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SKILLS RADAR / COMPETENCY BREAKDOWN */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">
          Domínio das 5 Competências Linguísticas
        </h3>

        <div className="space-y-3.5">
          {competencies.map((comp, idx) => {
            const Icon = comp.icon;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${comp.color}`} />
                    {comp.name}
                  </span>
                  <span className="font-mono font-bold text-white">{comp.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${comp.bar} transition-all duration-500`}
                    style={{ width: `${comp.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CEFR LEVELS ESTIMATE */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Estimativa por Nível CEFR</h3>
            <p className="text-xs text-slate-400">Quadro Europeu Comum de Referência para Línguas</p>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            Atual: {userProfile.level}
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {levels.map(lvl => (
            <div key={lvl.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{lvl.label}</span>
                <span className="font-mono text-slate-400 text-[11px]">{lvl.pct}% consolidado</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${lvl.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

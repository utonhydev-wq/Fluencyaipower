import React, { useState } from 'react';
import { UserProfile, Achievement } from '../../types';
import { storageService } from '../../services/storageService';
import {
  Trophy,
  Sparkles,
  Flame,
  ShieldCheck,
  Brain,
  Mic,
  MessageSquare,
  Lock,
  CheckCircle2,
  Award
} from 'lucide-react';

interface AchievementsViewProps {
  userProfile: UserProfile;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ userProfile }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => storageService.getAchievements());

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-sky-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Brain': return <Brain className="w-5 h-5 text-indigo-400" />;
      case 'Mic': return <Mic className="w-5 h-5 text-pink-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-cyan-400" />;
      default: return <Trophy className="w-5 h-5 text-amber-400" />;
    }
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Gamificação Inteligente</span>
          <h2 className="text-2xl font-black text-white">Conquistas & Níveis</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Comemore marcos reais de consistência e domínio do idioma.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2 self-start">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">{unlockedCount} de {achievements.length} desbloqueadas</span>
        </div>
      </div>

      {/* Level Progress Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase">Patente Atual</span>
            <h3 className="text-xl font-black text-white mt-0.5">
              {userProfile.xp >= 1000 ? 'Mestre da Fluência' : userProfile.xp >= 500 ? 'Comunicador Confiante' : 'Explorador Dedicado'}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400">{userProfile.xp}</span>
            <span className="text-xs text-slate-400 block">XP Acumulado</span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (userProfile.xp / 1000) * 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Próxima patente em {Math.max(0, 1000 - userProfile.xp)} XP adicionais.
        </p>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
              ach.isUnlocked
                ? 'bg-slate-900 border-amber-500/40 shadow-sm'
                : 'bg-slate-900/50 border-slate-800/80 opacity-70'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                ach.isUnlocked
                  ? 'bg-amber-500/20 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {ach.isUnlocked ? getIcon(ach.icon) : <Lock className="w-5 h-5 text-slate-500" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">{ach.title}</h4>
                <span className="text-[11px] font-black text-amber-400">+{ach.xpReward} XP</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ach.description}</p>
              
              <div className="mt-2 text-[10px]">
                {ach.isUnlocked ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Desbloqueada
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Em progresso...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

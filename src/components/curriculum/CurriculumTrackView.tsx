import React, { useState } from 'react';
import { UserProfile, CEFRLevel, Lesson } from '../../types';
import { CURRICULUM_MODULES } from '../../data/curriculum';
import { soundService } from '../../services/soundService';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react';

interface CurriculumTrackViewProps {
  userProfile: UserProfile;
  onSelectLesson: (lesson: Lesson) => void;
}

export const CurriculumTrackView: React.FC<CurriculumTrackViewProps> = ({ userProfile, onSelectLesson }) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(userProfile.level || 'A1');

  const levels: Array<{ id: CEFRLevel; title: string; subtitle: string }> = [
    { id: 'A1', title: 'A1: Primeiros Passos', subtitle: 'Base sólida, saudações, to be e dia a dia' },
    { id: 'A2', title: 'A2: Comunicação Cotidiana', subtitle: 'Passado simples, pedidos, viagens e rotina' },
    { id: 'B1', title: 'B1: Independência', subtitle: 'Present Perfect, opiniões e fluência prática' },
    { id: 'B2', title: 'B2: Avançado & Profissional', subtitle: 'Debates, negociações e linguagem executiva' },
    { id: 'C1', title: 'C1: Fluência & Nuances', subtitle: 'Inversões de ênfase e comunicação espontânea' },
    { id: 'C2', title: 'C2: Domínio & Maestria', subtitle: 'Textos complexos, subtexto e ironia cultural' },
  ];

  const currentModule = CURRICULUM_MODULES.find(m => m.level === selectedLevel) || CURRICULUM_MODULES[0];

  const isLessonCompleted = (lessonId: string) => {
    return userProfile.completedLessonIds.includes(lessonId);
  };

  const handleOpenLesson = (lesson: Lesson) => {
    soundService.playClick();
    onSelectLesson(lesson);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Track Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Currículo Estruturado CEFR</span>
        <h2 className="text-2xl font-black text-white">Trilha de Aprendizagem</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
          Avanço progressivo do zero absoluto ao domínio completo, focado em aplicação prática.
        </p>
      </div>

      {/* Level Selector Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {levels.map(lvl => {
          const isCurrent = userProfile.level === lvl.id;
          const isSelected = selectedLevel === lvl.id;

          return (
            <button
              key={lvl.id}
              onClick={() => {
                soundService.playClick();
                setSelectedLevel(lvl.id);
              }}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center relative ${
                isSelected
                  ? 'border-sky-500 bg-sky-500/20 text-white shadow-md shadow-sky-500/20'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-slate-950" title="Seu nível atual" />
              )}
              <span className="text-base font-black">{lvl.id}</span>
              <span className="text-[10px] font-semibold truncate max-w-[80px]">
                {lvl.id === 'A1' ? 'Iniciante' : lvl.id === 'A2' ? 'Básico' : lvl.id === 'B1' ? 'Interm.' : lvl.id === 'B2' ? 'Avançado' : 'Fluente'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Level Info Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-sky-500 text-slate-950">
              {selectedLevel}
            </span>
            <h3 className="text-base font-extrabold text-white">{currentModule.title}</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">{currentModule.description}</p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-right flex-shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Unidades</span>
            <span className="text-sm font-extrabold text-white">{currentModule.units.length} módulos</span>
          </div>
        </div>
      </div>

      {/* Units & Lessons List */}
      <div className="space-y-6">
        {currentModule.units.map((unit, uIdx) => (
          <div key={unit.id} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h4 className="text-sm font-extrabold text-sky-300">{unit.title}</h4>
                <p className="text-xs text-slate-400">{unit.description}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {unit.lessons.map((lesson, lIdx) => {
                const completed = isLessonCompleted(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleOpenLesson(lesson)}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-850 transition cursor-pointer flex items-center justify-between gap-3 shadow-sm group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition ${
                          completed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105'
                        }`}
                      >
                        {completed ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-sm text-white group-hover:text-sky-300 transition">
                            {lesson.title}
                          </h5>
                          {completed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                              Concluído
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{lesson.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
                      <span className="hidden sm:flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.durationMinutes} min
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

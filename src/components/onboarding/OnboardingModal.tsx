import React, { useState } from 'react';
import { UserProfile, CEFRLevel, DailyTimeMinutes, LearningGoal, LearningStyle, MainDifficulty } from '../../types';
import { PLACEMENT_QUESTIONS } from '../../data/placementQuestions';
import { aiService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Volume2,
  Check,
  Brain,
  Award,
  Zap,
  Target
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'intro' | 'goals' | 'test_choice' | 'placement_test' | 'evaluating' | 'result'>('intro');

  // Preferences form state
  const [selfLevel, setSelfLevel] = useState<string>('zero');
  const [goal, setGoal] = useState<LearningGoal>('conversas_gerais');
  const [dailyMinutes, setDailyMinutes] = useState<DailyTimeMinutes>(15);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('combinacao');
  const [difficulty, setDifficulty] = useState<MainDifficulty>('falar');
  const [userName, setUserName] = useState<string>('Estudante');

  // Placement test state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Result state
  const [testResult, setTestResult] = useState<{
    estimatedLevel: CEFRLevel;
    levelTitle: string;
    summary: string;
    strengths: string[];
    focusAreas: string[];
    weeklyPlan: string;
  } | null>(null);

  const handleNextFromIntro = () => {
    soundService.playClick();
    setStep('goals');
  };

  const handleGoalsSubmit = () => {
    soundService.playClick();
    setStep('test_choice');
  };

  const handleStartTest = () => {
    soundService.playClick();
    setCurrentQIndex(0);
    setTestAnswers({});
    setSelectedOption(null);
    setStep('placement_test');
  };

  const handleSkipTest = (defaultLevel: CEFRLevel = 'A1') => {
    soundService.playClick();
    const titles: Record<CEFRLevel, string> = {
      A1: 'Iniciante (A1) — Primeiros Passos',
      A2: 'Básico (A2) — Comunicação Cotidiana',
      B1: 'Intermediário (B1) — Independência',
      B2: 'Intermediário Avançado (B2) — Fluência Prática',
      C1: 'Avançado (C1) — Comunicação Espontânea',
      C2: 'Domínio (C2) — Maestria e Nuances',
    };

    finishOnboarding({
      estimatedLevel: defaultLevel,
      levelTitle: titles[defaultLevel],
      summary: 'Seu plano foi configurado para começar com segurança e focar nas suas metas diárias.',
      strengths: ['Compromisso com o aprendizado diário', 'Objetivo claro definido'],
      focusAreas: ['Construção de frases práticas', 'Compreensão auditiva'],
      weeklyPlan: `Rotina de ${dailyMinutes} minutos/dia para evolução constante.`
    });
  };

  const handleAnswerQuestion = (option: string) => {
    soundService.playClick();
    setSelectedOption(option);
  };

  const handleConfirmQuestion = async () => {
    if (!selectedOption) return;
    const q = PLACEMENT_QUESTIONS[currentQIndex];
    const newAnswers = { ...testAnswers, [q.id]: selectedOption };
    setTestAnswers(newAnswers);

    if (currentQIndex < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Evaluate test
      setStep('evaluating');
      soundService.playClick();

      let score = 0;
      PLACEMENT_QUESTIONS.forEach(question => {
        if (newAnswers[question.id] === question.correctAnswer) {
          score += 1;
        }
      });

      try {
        const evalData = await aiService.evaluatePlacement({
          answers: newAnswers,
          score,
          totalQuestions: PLACEMENT_QUESTIONS.length,
          userSelfRating: selfLevel,
          goal,
          dailyMinutes
        });
        setTestResult(evalData as any);
        setStep('result');
        soundService.playLevelUp();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        handleSkipTest('A1');
      }
    }
  };

  const finishOnboarding = (resultData = testResult) => {
    soundService.playLevelUp();
    onComplete({
      name: userName.trim() || 'Estudante',
      level: resultData?.estimatedLevel || 'A1',
      levelTitle: resultData?.levelTitle || 'Iniciante (A1) — Primeiros Passos',
      preferences: {
        dailyMinutes,
        learningStyle,
        primaryGoal: goal,
        mainDifficulty: difficulty,
        soundEffects: true,
        voicePlaybackSpeed: 1.0,
        preferredAccent: 'US',
        theme: 'dark',
        autoPlayAudio: true,
      },
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative text-slate-100 my-auto">
        
        {/* STEP 1: INTRO */}
        {step === 'intro' && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shadow-lg shadow-sky-500/20">
              <img
                src="https://i.postimg.cc/nh6qbwQ8/upscalemedia-transformed.png"
                alt="fluencyaipower logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('/logo.png')) target.src = '/logo.png';
                }}
              />
            </div>

            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3 lowercase font-mono">
                bem-vindo ao fluencyaipower
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Aprenda inglês do zero ao avançado no seu próprio ritmo
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-md mx-auto">
                Uma metodologia pensada para falantes de português, combinando conversação real, inteligência artificial Google e repetição inteligente em 10 a 25 minutos por dia.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left py-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <Brain className="w-5 h-5 text-sky-400 mb-1.5" />
                <h4 className="text-xs font-bold text-white">Tutor com IA</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Explicações claras em português quando precisar</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <Clock className="w-5 h-5 text-indigo-400 mb-1.5" />
                <h4 className="text-xs font-bold text-white">Rotina Diária</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">10 a 25 minutos de microaprendizagem</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <Award className="w-5 h-5 text-emerald-400 mb-1.5" />
                <h4 className="text-xs font-bold text-white">Quadro CEFR</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Do básico A1 ao domínio avançado C2</p>
              </div>
            </div>

            <button
              onClick={handleNextFromIntro}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/30 transition active:scale-[0.98]"
            >
              <span>Personalizar Meu Estudo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: GOALS & TIME CONFIG */}
        {step === 'goals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Passo 1 de 2</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Configure suas preferências</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Isso ajuda o fluencyaipower a calibrar os exemplos e o ritmo das suas lições.</p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Como prefere ser chamado?</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Seu nome ou apelido"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Goal */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Qual é seu principal objetivo?</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'conversas_gerais', label: 'Conversas Cotidianas', desc: 'Falar com amigos e nativos' },
                    { id: 'viagens', label: 'Viagens & Turismo', desc: 'Aeroporto, hotel e passeios' },
                    { id: 'trabalho', label: 'Trabalho & Carreira', desc: 'Reuniões, emails e entrevistas' },
                    { id: 'tecnologia', label: 'Tecnologia & Tech', desc: 'Programação e inovação' },
                    { id: 'estudos', label: 'Estudos & Certificações', desc: 'Artigos, TOEFL e provas' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id as LearningGoal)}
                      className={`p-3 rounded-xl text-left border transition ${
                        goal === item.id
                          ? 'border-sky-500 bg-sky-500/15 text-white'
                          : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{item.label}</span>
                        {goal === item.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily time */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quanto tempo pode estudar por dia?</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 25].map(min => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDailyMinutes(min as DailyTimeMinutes)}
                      className={`py-2.5 rounded-xl text-center border font-semibold text-xs transition ${
                        dailyMinutes === min
                          ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                          : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Main difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Qual é sua maior dificuldade atual?</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'falar', label: 'Falar (Pronúncia/Trava)' },
                    { id: 'ouvir', label: 'Ouvir (Entender nativos)' },
                    { id: 'vocabulario', label: 'Vocabulário' },
                    { id: 'gramatica', label: 'Gramática Prática' },
                    { id: 'ler', label: 'Ler Textos' },
                    { id: 'escrever', label: 'Escrever Frases' },
                  ].map(diff => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setDifficulty(diff.id as MainDifficulty)}
                      className={`p-2 rounded-xl text-center border font-medium transition ${
                        difficulty === diff.id
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                          : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGoalsSubmit}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/30 transition"
            >
              <span>Avançar para Nivelamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: TEST CHOICE */}
        {step === 'test_choice' && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Compass className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Como deseja definir seu nível inicial?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
                Você pode fazer um teste de nivelamento rápido (10 questões rápidas) ou escolher começar diretamente do zero (A1).
              </p>
            </div>

            <div className="space-y-3 text-left">
              <button
                onClick={handleStartTest}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-sky-600/20 to-indigo-600/20 border-2 border-sky-500/60 hover:border-sky-400 flex items-center justify-between transition group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Fazer Teste de Nivelamento (Recomendado)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500 text-white font-bold">~3 min</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Classificação estimada segundo o Quadro Europeu (CEFR: A1 a C2)</p>
                </div>
                <ArrowRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => handleSkipTest('A1')}
                className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-left transition flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">Começar do Zero Absoluto (A1)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Para quem nunca estudou ou quer reconstruir a base desde o início.</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSkipTest('B1')}
                className="w-full p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 text-left transition flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-xs text-slate-300">Já entendo o básico, pular para Intermediário (B1)</h4>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              * O teste tem caráter pedagógico para orientar seus estudos e pode ser refeito a qualquer momento.
            </p>
          </div>
        )}

        {/* STEP 4: PLACEMENT TEST IN PROGRESS */}
        {step === 'placement_test' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="font-semibold text-sky-400">Questão {currentQIndex + 1} de {PLACEMENT_QUESTIONS.length}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                Nível Alvo: {PLACEMENT_QUESTIONS[currentQIndex].targetLevel}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400">{PLACEMENT_QUESTIONS[currentQIndex].instruction}</p>
              <h4 className="text-base sm:text-lg font-bold text-white bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 leading-relaxed">
                {PLACEMENT_QUESTIONS[currentQIndex].question}
              </h4>
            </div>

            {PLACEMENT_QUESTIONS[currentQIndex].audioPhrase && (
              <button
                type="button"
                onClick={() => aiService.playAudio(PLACEMENT_QUESTIONS[currentQIndex].audioPhrase!)}
                className="flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Ouvir frase em inglês</span>
              </button>
            )}

            <div className="space-y-2.5">
              {PLACEMENT_QUESTIONS[currentQIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerQuestion(option)}
                  className={`w-full p-3.5 rounded-xl text-left border text-sm font-medium transition flex items-center justify-between ${
                    selectedOption === option
                      ? 'border-sky-500 bg-sky-500/20 text-white font-semibold'
                      : 'border-slate-800 bg-slate-800/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span>{option}</span>
                  {selectedOption === option && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirmQuestion}
              disabled={!selectedOption}
              className={`w-full py-3 px-6 rounded-2xl font-semibold shadow-md transition flex items-center justify-center gap-2 ${
                selectedOption
                  ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>{currentQIndex === PLACEMENT_QUESTIONS.length - 1 ? 'Finalizar e Ver Diagnóstico' : 'Próxima Questão'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 5: EVALUATING */}
        {step === 'evaluating' && (
          <div className="py-12 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
            <h3 className="text-lg font-bold text-white">Analisando suas respostas com IA...</h3>
            <p className="text-xs text-slate-400">Classificando competências segundo o Quadro Comum Europeu de Línguas (CEFR).</p>
          </div>
        )}

        {/* STEP 6: RESULT */}
        {step === 'result' && testResult && (
          <div className="space-y-6 animate-in zoom-in-95 fade-in duration-200">
            <div className="text-center">
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                Avaliação Concluída!
              </span>
              <h3 className="text-2xl font-black text-white">{testResult.levelTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {testResult.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="font-bold text-sky-400 flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-3.5 h-3.5" /> Pontos Fortes
                </span>
                <ul className="space-y-1 text-slate-300">
                  {testResult.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="font-bold text-indigo-400 flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5" /> Foco Prioritário
                </span>
                <ul className="space-y-1 text-slate-300">
                  {testResult.focusAreas.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/50 text-xs text-sky-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Seu Plano Diário: {dailyMinutes} minutos/dia</span>
                <p className="text-[11px] text-sky-300/90 mt-0.5">{testResult.weeklyPlan}</p>
              </div>
            </div>

            <button
              onClick={() => finishOnboarding()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 transition active:scale-[0.98]"
            >
              Começar Minha Jornada no fluencyaipower
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

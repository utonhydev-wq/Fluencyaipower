import React, { useState } from 'react';
import { Lesson, Exercise } from '../../types';
import { aiService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import { speechService } from '../../services/speechService';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Sparkles,
  Trophy,
  ChevronLeft
} from 'lucide-react';

interface LessonPlayerProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: (correctCount: number, totalQuestions: number) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ lesson, onClose, onComplete }) => {
  // Lesson stages: 'intro' | 'vocabulary' | 'dialogue' | 'exercise' | 'summary'
  const [stage, setStage] = useState<'intro' | 'vocabulary' | 'dialogue' | 'exercise' | 'summary'>('intro');
  const [currentExIndex, setCurrentExIndex] = useState(0);

  // Exercise answering state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [wordOrderSelected, setWordOrderSelected] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedVoiceText, setRecognizedVoiceText] = useState('');
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  const currentExercise: Exercise | undefined = lesson.exercises[currentExIndex];

  const handleNextStage = () => {
    soundService.playClick();
    if (stage === 'intro') {
      setStage('vocabulary');
    } else if (stage === 'vocabulary') {
      if (lesson.dialogue && lesson.dialogue.length > 0) {
        setStage('dialogue');
      } else {
        setStage('exercise');
      }
    } else if (stage === 'dialogue') {
      setStage('exercise');
    }
  };

  const playPhrase = (text: string, speed = audioSpeed) => {
    aiService.playAudio(text, speed);
  };

  // Word Order toggle word
  const handleToggleWord = (word: string) => {
    if (isAnswered) return;
    soundService.playClick();
    if (wordOrderSelected.includes(word)) {
      setWordOrderSelected(wordOrderSelected.filter(w => w !== word));
    } else {
      setWordOrderSelected([...wordOrderSelected, word]);
    }
  };

  // Speech recording for pronunciation exercises
  const handleStartVoiceRecording = () => {
    if (!speechService.isRecognitionSupported) {
      alert('Seu navegador não suporta reconhecimento de voz direto. Digite a resposta ou selecione outra opção.');
      return;
    }
    setIsRecording(true);
    setRecognizedVoiceText('');

    speechService.startListening({
      onResult: (text, isFinal) => {
        setRecognizedVoiceText(text);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onError: (err) => {
        setIsRecording(false);
        console.warn('Voice error:', err);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });
  };

  const handleStopVoiceRecording = () => {
    speechService.stopListening();
    setIsRecording(false);
  };

  // Check answer for current exercise
  const handleCheckAnswer = () => {
    if (!currentExercise || isAnswered) return;

    let correct = false;
    const target = currentExercise.correctAnswer;

    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') {
      correct = selectedOption === target;
    } else if (currentExercise.type === 'word_order') {
      const sentence = wordOrderSelected.join(' ').trim();
      correct = sentence.toLowerCase().replace(/[.,?!]/g, '') === (target as string).toLowerCase().replace(/[.,?!]/g, '');
    } else if (currentExercise.type === 'pronunciation') {
      const cleanTarget = (target as string).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      const cleanRec = recognizedVoiceText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      correct = cleanTarget === cleanRec || cleanRec.includes(cleanTarget.split(' ')[0]);
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      soundService.playCorrect();
      setScoreCount(prev => prev + 1);
    } else {
      soundService.playIncorrect();
    }
  };

  // Move to next exercise or summary
  const handleNextExercise = () => {
    soundService.playClick();
    if (currentExIndex < lesson.exercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
      setSelectedOption(null);
      setWordOrderSelected([]);
      setIsAnswered(false);
      setIsCorrect(false);
      setRecognizedVoiceText('');
    } else {
      // Completed all exercises
      setStage('summary');
      soundService.playLevelUp();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleFinishLesson = () => {
    onComplete(scoreCount, lesson.exercises.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {lesson.level}
              </span>
              <span className="text-xs text-slate-400">{lesson.title}</span>
            </div>
            <h2 className="text-sm font-bold text-white truncate max-w-xs">{lesson.subtitle}</h2>
          </div>
        </div>

        {stage === 'exercise' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {currentExIndex + 1}/{lesson.exercises.length}
            </span>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${((currentExIndex + 1) / lesson.exercises.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">

        {/* STAGE 1: INTRO & GRAMMAR EXPLANATION */}
        {stage === 'intro' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Objetivo da Lição</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{lesson.title}</h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">{lesson.description}</p>
            </div>

            {/* Practical Grammar Tip in Portuguese */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-sky-500/30 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Dica Prática para Brasileiros</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lesson.grammarTip}
              </p>
            </div>

            <button
              onClick={handleNextStage}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>Ver Vocabulário Chave</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 2: VOCABULARY LIST WITH AUDIO */}
        {stage === 'vocabulary' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-sky-400">Vocabulário & Pronúncia</span>
                <h3 className="text-xl font-bold text-white">Palavras e Expressões da Lição</h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setAudioSpeed(1.0)}
                  className={`px-2 py-1 rounded-lg font-bold ${audioSpeed === 1.0 ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                >
                  1.0x
                </button>
                <button
                  onClick={() => setAudioSpeed(0.75)}
                  className={`px-2 py-1 rounded-lg font-bold ${audioSpeed === 0.75 ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                >
                  0.75x Lento
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {lesson.vocabulary.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-white">{item.word}</h4>
                        <span className="text-xs text-sky-400 font-mono">{item.phonetic}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{item.translation}</p>
                    </div>

                    <button
                      onClick={() => playPhrase(item.word)}
                      className="p-2 rounded-xl bg-sky-600/20 text-sky-400 hover:bg-sky-600 hover:text-white transition active:scale-95"
                      title="Ouvir pronúncia"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
                    <div>
                      <p className="italic text-slate-200">"{item.example}"</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.exampleTranslation}</p>
                    </div>
                    <button
                      onClick={() => playPhrase(item.example)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                      title="Ouvir frase completa"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNextStage}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>{lesson.dialogue && lesson.dialogue.length > 0 ? 'Ouvir Diálogo Real' : 'Começar Exercícios'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 3: DIALOGUE IN CONTEXT (IF APPLICABLE) */}
        {stage === 'dialogue' && lesson.dialogue && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase text-sky-400">Situação Real</span>
              <h3 className="text-xl font-bold text-white">Diálogo em Contexto</h3>
              <p className="text-xs text-slate-400 mt-0.5">Toque no ícone de som para ouvir cada fala com entonação nativa.</p>
            </div>

            <div className="space-y-3">
              {lesson.dialogue.map((line, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-sky-400 flex-shrink-0">
                    {line.speaker[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">{line.speaker}</span>
                      <button
                        onClick={() => playPhrase(line.text)}
                        className="p-1 rounded-md text-sky-400 hover:bg-slate-800"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-white mt-0.5">{line.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{line.translation}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStage('exercise')}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>Praticar com Exercícios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 4: INTERACTIVE EXERCISES */}
        {stage === 'exercise' && currentExercise && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase text-sky-400">{currentExercise.title}</span>
              <h3 className="text-sm sm:text-base font-semibold text-slate-300 mt-0.5">{currentExercise.instruction}</h3>
            </div>

            {/* Prompt Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentExercise.promptText}
              </h4>

              {currentExercise.audioPhrase && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => playPhrase(currentExercise.audioPhrase!, 1.0)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ouvir Áudio (1.0x)</span>
                  </button>
                  <button
                    onClick={() => playPhrase(currentExercise.audioPhrase!, 0.75)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
                  >
                    <span>0.75x Lento</span>
                  </button>
                </div>
              )}
            </div>

            {/* MULTIPLE CHOICE & FILL IN BLANK */}
            {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') && currentExercise.options && (
              <div className="space-y-2.5">
                {currentExercise.options.map((option, idx) => (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedOption(option);
                    }}
                    className={`w-full p-4 rounded-2xl text-left font-semibold text-sm border transition flex items-center justify-between ${
                      selectedOption === option
                        ? isAnswered
                          ? isCorrect
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                            : 'border-rose-500 bg-rose-500/20 text-rose-200'
                          : 'border-sky-500 bg-sky-500/15 text-white'
                        : isAnswered && option === currentExercise.correctAnswer
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{option}</span>
                    {isAnswered && option === currentExercise.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {isAnswered && selectedOption === option && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* WORD ORDER / SENTENCE BUILDER */}
            {currentExercise.type === 'word_order' && currentExercise.words && (
              <div className="space-y-4">
                {/* Assembled sentence area */}
                <div className="min-h-[64px] p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap gap-2 items-center">
                  {wordOrderSelected.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Toque nas palavras abaixo para construir a frase</span>
                  ) : (
                    wordOrderSelected.map((word, idx) => (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleToggleWord(word)}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white font-semibold text-sm shadow-sm transition hover:bg-sky-500"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Available word tiles */}
                <div className="flex flex-wrap gap-2">
                  {currentExercise.words.map((word, idx) => {
                    const isUsed = wordOrderSelected.includes(word);
                    return (
                      <button
                        key={idx}
                        disabled={isUsed || isAnswered}
                        onClick={() => handleToggleWord(word)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                          isUsed
                            ? 'opacity-30 border-slate-800 bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'border-slate-700 bg-slate-800 hover:border-sky-500 text-slate-200'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PRONUNCIATION / VOICE REPETITION */}
            {currentExercise.type === 'pronunciation' && (
              <div className="space-y-4 text-center">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={isRecording ? handleStopVoiceRecording : handleStartVoiceRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition active:scale-95 ${
                        isRecording
                          ? 'bg-rose-500 animate-pulse text-white'
                          : 'bg-sky-600 hover:bg-sky-500 text-white'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    {isRecording ? 'Gravando sua voz... fale agora!' : 'Toque no microfone e pronuncie a frase em inglês'}
                  </p>

                  {recognizedVoiceText && (
                    <div className="p-3 rounded-xl bg-slate-800/80 text-xs text-sky-300 font-mono">
                      Reconhecido: "{recognizedVoiceText}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Immediate Pedagogical Feedback Box */}
            {isAnswered && (
              <div
                className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Excelente! Resposta correta</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>A resposta certa é: {Array.isArray(currentExercise.correctAnswer) ? currentExercise.correctAnswer[0] : currentExercise.correctAnswer}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {currentExercise.explanation}
                </p>
                {currentExercise.translation && (
                  <p className="text-xs text-slate-400 mt-1 italic">
                    Tradução: "{currentExercise.translation}"
                  </p>
                )}
              </div>
            )}

            {/* Action Bar */}
            {!isAnswered ? (
              <button
                onClick={handleCheckAnswer}
                disabled={
                  (currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank')
                    ? !selectedOption
                    : currentExercise.type === 'word_order'
                    ? wordOrderSelected.length === 0
                    : !recognizedVoiceText
                }
                className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm shadow-md transition"
              >
                Verificar Resposta
              </button>
            ) : (
              <button
                onClick={handleNextExercise}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
              >
                <span>{currentExIndex < lesson.exercises.length - 1 ? 'Próximo Exercício' : 'Ver Conclusão da Lição'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* STAGE 5: SUMMARY & COMPLETION */}
        {stage === 'summary' && (
          <div className="text-center space-y-6 animate-in zoom-in-95 fade-in duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Lição Concluída com Sucesso!</span>
              <h2 className="text-2xl font-black text-white mt-1">{lesson.title}</h2>
              <p className="text-xs text-slate-400 mt-1">Você concluiu todos os módulos de conteúdo e exercícios.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Acertos</span>
                <span className="text-lg font-black text-emerald-400">{scoreCount} / {lesson.exercises.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">XP Ganho</span>
                <span className="text-lg font-black text-amber-400">+50 XP</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Tempo</span>
                <span className="text-lg font-black text-sky-400">{lesson.durationMinutes} min</span>
              </div>
            </div>

            <button
              onClick={handleFinishLesson}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 transition"
            >
              Continuar Aprendendo
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

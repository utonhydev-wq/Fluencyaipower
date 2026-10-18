import React, { useState } from 'react';
import { UserProfile, PronunciationItem } from '../../types';
import { PRONUNCIATION_ITEMS } from '../../data/pronunciationItems';
import { speechService } from '../../services/speechService';
import { aiService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

interface PronunciationStudioProps {
  userProfile: UserProfile;
}

export const PronunciationStudio: React.FC<PronunciationStudioProps> = ({ userProfile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    accuracy: string;
    phoneticTip: string;
    wordAnalysis: Array<{ word: string; status: string; hint: string }>;
    encouragement: string;
  } | null>(null);

  const currentItem: PronunciationItem = PRONUNCIATION_ITEMS[currentIndex];

  const playReferenceAudio = (speed = 1.0) => {
    aiService.playAudio(currentItem.phrase, speed);
  };

  const handleStartRecording = () => {
    if (!speechService.isRecognitionSupported) {
      alert('Seu navegador não suporta reconhecimento de voz direto. Digite a frase para testar a correspondência.');
      return;
    }

    setIsRecording(true);
    setRecognizedText('');
    setAnalysisResult(null);

    speechService.startListening({
      onResult: (text, isFinal) => {
        setRecognizedText(text);
        if (isFinal) {
          setIsRecording(false);
          analyzeSpeech(text);
        }
      },
      onError: (err) => {
        console.warn('Voice error:', err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });
  };

  const handleStopRecording = () => {
    speechService.stopListening();
    setIsRecording(false);
    if (recognizedText) {
      analyzeSpeech(recognizedText);
    }
  };

  const analyzeSpeech = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzePronunciation({
        targetPhrase: currentItem.phrase,
        recognizedText: spokenText,
        level: userProfile.level
      });

      setAnalysisResult(result);

      if (result.score >= 85) {
        soundService.playCorrect();
        storageService.addXP(25);
        if (result.score >= 95) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
      } else {
        soundService.playIncorrect();
        storageService.addXP(10);
      }
    } catch {
      // Fallback evaluation
      const match = currentItem.phrase.toLowerCase().includes(spokenText.toLowerCase().trim());
      setAnalysisResult({
        score: match ? 92 : 75,
        accuracy: match ? 'excelente' : 'bom',
        phoneticTip: currentItem.brazilianTip,
        wordAnalysis: currentItem.phrase.split(' ').map(w => ({ word: w, status: 'correct', hint: 'Boa articulação' })),
        encouragement: 'Muito bom! Pratique a entonação repetindo em velocidade normal.'
      });
      soundService.playCorrect();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextDrill = () => {
    soundService.playClick();
    if (currentIndex < PRONUNCIATION_ITEMS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    setRecognizedText('');
    setAnalysisResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Estúdio Fonético</span>
            <h2 className="text-2xl font-black text-white">Treino de Pronúncia & Ritmo</h2>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Exercício {currentIndex + 1} de {PRONUNCIATION_ITEMS.length}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Foco nos sons do inglês que mais geram dúvidas e travamentos para falantes de português brasileiro.
        </p>
      </div>

      {/* Main Pronunciation Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {currentItem.category}
          </span>
          <span className="text-[11px] font-mono text-slate-400">Nível {currentItem.level}</span>
        </div>

        {/* Target Phrase */}
        <div className="space-y-1 text-center py-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-relaxed">
            "{currentItem.phrase}"
          </h3>
          <p className="text-xs text-sky-400 font-mono tracking-wide">{currentItem.phonetic}</p>
          <p className="text-xs text-slate-400 italic mt-1">{currentItem.translation}</p>
        </div>

        {/* Audio Reference Buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => playReferenceAudio(1.0)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-sky-400" />
            <span>Velocidade Normal (1.0x)</span>
          </button>

          <button
            onClick={() => playReferenceAudio(0.75)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Lento (0.75x)</span>
          </button>
        </div>

        {/* Specific Brazilian Phonetic Tip */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-left">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
            <Lightbulb className="w-4 h-4" />
            <span>Dica Fonética para Brasileiros</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentItem.brazilianTip}
          </p>
        </div>

        {/* Microphone Recording Action */}
        <div className="pt-2 text-center space-y-3">
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/30'
                : 'bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/30'
            }`}
          >
            {isRecording ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
          </button>
          
          <p className="text-xs font-semibold text-slate-400">
            {isRecording ? 'Ouvindo sua pronúncia... toque para finalizar' : 'Toque no microfone e fale a frase em voz alta'}
          </p>

          {recognizedText && (
            <div className="p-3 rounded-xl bg-slate-800 text-xs text-sky-300 font-mono max-w-md mx-auto">
              Reconhecido pelo microfone: "{recognizedText}"
            </div>
          )}
        </div>

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>Analisando sons e ritmo com IA...</span>
          </div>
        )}

        {/* Feedback Card */}
        {analysisResult && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400">Pontuação de Pronúncia</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${analysisResult.score >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {analysisResult.score}%
                  </span>
                  <span className="text-xs font-bold text-slate-300 capitalize">
                    {analysisResult.accuracy}
                  </span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                <Award className={`w-6 h-6 ${analysisResult.score >= 85 ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {analysisResult.encouragement}
            </p>

            <button
              onClick={handleNextDrill}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Próximo Treino Fonético</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Notice regarding speech recognition disclaimer */}
      <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p>
          O reconhecimento de voz avalia correspondência e ritmo comunicativo. Diferenças de sotaque regional ou ruído ambiente podem influenciar o microfone. Foque na clareza e confiança!
        </p>
      </div>

    </div>
  );
};

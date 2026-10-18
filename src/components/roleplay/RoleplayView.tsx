import React, { useState } from 'react';
import { UserProfile, RoleplayScenario } from '../../types';
import { ROLEPLAY_SCENARIOS } from '../../data/roleplayScenarios';
import { aiService } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';
import { storageService } from '../../services/storageService';
import { conversationService } from '../../services/conversationService';
import { progressService } from '../../services/progressService';
import { useAuth } from '../../contexts/AuthContext';
import confetti from 'canvas-confetti';
import {
  MessageSquare,
  Volume2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Award,
  Compass,
  Briefcase,
  Utensils,
  Building,
  Plane,
  ShoppingBag,
  Users,
  Laptop
} from 'lucide-react';

interface RoleplayViewProps {
  userProfile: UserProfile;
}

export const RoleplayView: React.FC<RoleplayViewProps> = ({ userProfile }) => {
  const { currentUser } = useAuth();
  const [activeScenario, setActiveScenario] = useState<RoleplayScenario | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    speaker: string;
    text: string;
    translation?: string;
    correction?: string | null;
    timestamp: string;
    isUser: boolean;
  }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [vocabularyTip, setVocabularyTip] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Post-session summary state
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const getScenarioIcon = (name: string) => {
    switch (name) {
      case 'Utensils': return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Building': return <Building className="w-5 h-5 text-sky-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'Users': return <Users className="w-5 h-5 text-pink-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-emerald-400" />;
      case 'Plane': return <Plane className="w-5 h-5 text-blue-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-purple-400" />;
      case 'Laptop': return <Laptop className="w-5 h-5 text-cyan-400" />;
      default: return <MessageSquare className="w-5 h-5 text-sky-400" />;
    }
  };

  const handleStartScenario = (scenario: RoleplayScenario) => {
    soundService.playClick();
    setActiveScenario(scenario);
    setSessionCompleted(false);
    setSuggestedReplies(scenario.suggestedPhrases || []);
    setVocabularyTip(null);

    setMessages([
      {
        id: 'sc-init',
        speaker: scenario.partnerName,
        text: scenario.initialMessage,
        translation: 'Olá! Sou seu parceiro de diálogo para esta simulação.',
        timestamp: 'Agora',
        isUser: false
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text || !activeScenario || isLoading) return;

    soundService.playClick();
    const userMsg = {
      id: 'usr_' + Date.now(),
      speaker: userProfile.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const historyPayload = updatedMessages.map(m => ({
        speaker: m.isUser ? 'Aluno' : activeScenario.partnerName,
        text: m.text
      }));

      const replyData = await aiService.simulateRoleplay({
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        role: activeScenario.partnerRole,
        history: historyPayload,
        userMessage: text,
        level: userProfile.level
      });

      const partnerMsg = {
        id: 'partner_' + Date.now(),
        speaker: activeScenario.partnerName,
        text: replyData.reply,
        translation: replyData.portugueseTranslation,
        correction: replyData.grammarCorrection,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false
      };

      setMessages(prev => [...prev, partnerMsg]);
      if (replyData.suggestedReplies && replyData.suggestedReplies.length > 0) {
        setSuggestedReplies(replyData.suggestedReplies);
      }
      if (replyData.vocabularyTip) {
        setVocabularyTip(replyData.vocabularyTip);
      }

      soundService.playClick();
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'partner_err_' + Date.now(),
          speaker: activeScenario.partnerName,
          text: "I see! Could you elaborate a bit more on that?",
          translation: "Entendi! Você poderia falar um pouco mais sobre isso?",
          timestamp: 'Agora',
          isUser: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecord = () => {
    if (!speechService.isRecognitionSupported) {
      alert('Seu navegador não suporta reconhecimento de voz direto. Digite sua mensagem.');
      return;
    }

    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    speechService.startListening({
      onResult: (text, isFinal) => {
        setUserInput(text);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onError: () => setIsRecording(false),
      onEnd: () => setIsRecording(false)
    });
  };

  const handleFinishSession = async () => {
    soundService.playLevelUp();
    storageService.addXP(40);
    setSessionCompleted(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    if (currentUser?.uid && activeScenario) {
      try {
        const convId = `conv_${Date.now()}`;
        await conversationService.saveConversation(currentUser.uid, {
          id: convId,
          scenarioId: activeScenario.id,
          scenarioTitle: activeScenario.title,
          difficultyLevel: activeScenario.difficulty,
          summary: `Sessão de conversação com ${activeScenario.partnerName} (${activeScenario.title}).`,
          strengths: 'Manteve a linha de raciocínio da conversa com naturalidade e respondeu prontamente.',
          improvements: 'Utilizar frases mais polidas como "Could I have..." e contrações normais.',
          timestamp: new Date().toISOString()
        });

        await progressService.recordDailyStudy(currentUser.uid, {
          minutesToAdd: 5,
          exercisesToAdd: 1,
          correctToAdd: 1,
          mistakesToAdd: 0,
          xpToAdd: 40,
          dailyGoalMinutes: userProfile.preferences.dailyMinutes || 15
        });
      } catch (err) {
        console.warn('Error saving conversation to Firestore:', err);
      }
    }
  };

  const playAudio = (text: string) => {
    aiService.playAudio(text, userProfile.preferences.voicePlaybackSpeed);
  };

  // If no scenario chosen, show gallery of scenarios
  if (!activeScenario) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Prática Realista</span>
          <h2 className="text-2xl font-black text-white">Simulações de Conversação com IA</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Escolha uma situação da vida real para conversar como nativos fazem. Receba sugestões de falas, dicas culturais e correções gentis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ROLEPLAY_SCENARIOS.map(sc => (
            <div
              key={sc.id}
              onClick={() => handleStartScenario(sc)}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-800/60 transition cursor-pointer shadow-md group space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700/60 group-hover:scale-105 transition">
                    {getScenarioIcon(sc.avatarIcon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition">{sc.title}</h3>
                    <span className="text-[11px] text-slate-400">{sc.category}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 border border-slate-700">
                  {sc.difficulty}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{sc.description}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Meta: {sc.goal}</span>
                <span className="text-sky-400 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                  Iniciar <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ACTIVE SCENARIO CHAT OR SUMMARY
  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] p-3 sm:p-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveScenario(null)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{activeScenario.title}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {activeScenario.difficulty}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs">{activeScenario.partnerRole}</p>
          </div>
        </div>

        {!sessionCompleted && messages.length >= 3 && (
          <button
            onClick={handleFinishSession}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
          >
            Concluir Simulação
          </button>
        )}
      </div>

      {!sessionCompleted ? (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Goal reminder */}
            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span><strong>Sua meta:</strong> {activeScenario.goal}</span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                    msg.isUser
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                    <span>{msg.speaker}</span>
                    <button
                      onClick={() => playAudio(msg.text)}
                      className="text-sky-400 hover:text-sky-300"
                      title="Ouvir"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="font-medium text-white">{msg.text}</p>

                  {msg.translation && (
                    <p className="text-[11px] text-slate-400 mt-1 italic pt-1 border-t border-slate-800">
                      {msg.translation}
                    </p>
                  )}

                  {msg.correction && (
                    <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Dica de Naturalidade:</strong> {msg.correction}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 max-w-xs">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>{activeScenario.partnerName} está digitando...</span>
              </div>
            )}
          </div>

          {/* Vocabulary tip if present */}
          {vocabularyTip && (
            <div className="my-2 p-2 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>{vocabularyTip}</span>
            </div>
          )}

          {/* Suggested replies */}
          {suggestedReplies.length > 0 && (
            <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex-shrink-0">Sugestões:</span>
              {suggestedReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(reply)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-sky-300 transition active:scale-95 text-left"
                >
                  "{reply}"
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-2">
            <button
              onClick={handleVoiceRecord}
              className={`p-2.5 rounded-xl transition ${
                isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Falar em inglês pelo microfone"
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isRecording ? 'Ouvindo sua voz...' : 'Digite sua resposta em inglês...'}
              className="flex-1 bg-transparent px-2 text-sm text-white placeholder-slate-500 focus:outline-none"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim() || isLoading}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        /* POST-SESSION DIAGNOSTIC REPORT */
        <div className="flex-1 overflow-y-auto space-y-5 p-2 animate-in zoom-in-95 duration-200">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-600 flex items-center justify-center text-white mb-2 shadow-lg shadow-emerald-500/20">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Relatório da Simulação</h3>
            <p className="text-xs text-slate-400">Parabéns por praticar conversação real! Veja o seu feedback pedagógico:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pontos Fortes Demonstrados</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                <li>• Manteve a linha de raciocínio da conversa sem hesitar</li>
                <li>• Boa escolha de vocabulário para o contexto de {activeScenario.title}</li>
                <li>• Iniciativa para responder e fazer perguntas ao interlocutor</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="font-bold text-sky-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Sugestões para Soar Mais Natural</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                <li>• Prefira "Could I get..." ou "Would you mind..." para fazer pedidos corteses</li>
                <li>• Use contrações como "I'd like" em vez de "I would like" na fala informal</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-center justify-between">
            <div>
              <span className="font-bold block text-white">Recompensa da Sessão</span>
              <span className="text-[11px] text-indigo-300">+40 XP somados ao seu perfil e avanço no nível {userProfile.level}</span>
            </div>
            <span className="text-lg font-black text-amber-400">+40 XP</span>
          </div>

          <button
            onClick={() => setActiveScenario(null)}
            className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition"
          >
            Escolher Outra Situação
          </button>
        </div>
      )}

    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, TutorResponseData } from '../../types';
import { aiService, TutorMessage } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';
import { storageService } from '../../services/storageService';
import { reviewService } from '../../services/reviewService';
import { conversationService } from '../../services/conversationService';
import { progressService } from '../../services/progressService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Send,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  User,
  GraduationCap,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  RefreshCw,
  Gauge,
  HelpCircle,
  MessageCircle,
  Briefcase,
  Plane,
  HeartHandshake
} from 'lucide-react';

interface AITutorViewProps {
  userProfile: UserProfile;
}

interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  accent: 'US' | 'UK';
  description: string;
  avatar: string;
  badge: string;
}

const TEACHERS: TeacherProfile[] = [
  {
    id: 'Adam',
    name: 'Prof. Adam Walker',
    title: 'Especialista em Destravar Brasileiros',
    accent: 'US',
    description: 'Didático, paciente, com foco em eliminar a tradução mental e vícios de linguagem.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    badge: 'Recomendado para A1-B1'
  },
  {
    id: 'Sarah',
    name: 'Profª. Sarah Jenkins',
    title: 'Expressões & Inglês Americano Real',
    accent: 'US',
    description: 'Ensina como os nativos realmente conversam no dia a dia com gírias e idioms.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    badge: 'Fluência Cotidiana'
  },
  {
    id: 'Oliver',
    name: 'Prof. Oliver Hughes',
    title: 'Business English & Entrevistas',
    accent: 'UK',
    description: 'Inglês corporativo, reuniões, apresentações e preparação para o mercado global.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    badge: 'Carreira & Negócios'
  },
  {
    id: 'Emma',
    name: 'Profª. Emma Davies',
    title: 'Viagens & Sobrevivência no Exterior',
    accent: 'UK',
    description: 'Aeroportos, alfândega, reservas, pedidos e situações de emergência sem estresse.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    badge: 'Viagens & Turismo'
  }
];

interface ChatItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: TutorResponseData;
}

export const AITutorView: React.FC<AITutorViewProps> = ({ userProfile }) => {
  const { currentUser } = useAuth();
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile>(TEACHERS[0]);
  const [tutorMode, setTutorMode] = useState<'iniciante' | 'conversacao' | 'imersao'>('iniciante');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [savedVocabIds, setSavedVocabIds] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      text: `Hello ${userProfile.name}! I am ${TEACHERS[0].name}, your personal English professor on fluencyaipower. 

I'm here to guide your journey from your current level (${userProfile.level}) to complete confidence. We will work on pronunciation, natural sentences, and practical speaking without fear of making mistakes.

What would you like to explore today? You can ask a grammar doubt in Portuguese, practice a daily dialogue in English, or test your pronunciation!`,
      timestamp: 'Agora',
      data: {
        reply: `Hello ${userProfile.name}! I am ${TEACHERS[0].name}, your personal English professor on fluencyaipower.`,
        portugueseExplanation: 'Eu sou o seu professor particular. Você pode falar comigo em português se tiver dúvidas ou praticar em inglês diretamente. Sempre que houver um jeito mais natural de falar, eu darei dicas gentis e fonéticas!',
        suggestedFollowUps: [
          'How can I improve my English speaking every day?',
          'What is the difference between make and do?',
          'I want to practice ordering food at a restaurant.'
        ],
        savedVocabulary: [
          {
            word: 'Step by step',
            translation: 'Passo a passo',
            phonetic: '/step baɪ step/',
            example: 'Step by step, you will reach fluency.'
          }
        ]
      }
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    soundService.playClick();
    const userMsgId = 'user_' + Date.now();
    const newMsg: ChatItem = {
      id: userMsgId,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const historyForAPI: TutorMessage[] = updatedMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await aiService.askTutor({
        message: text,
        history: historyForAPI,
        level: userProfile.level,
        mode: tutorMode,
        userGoal: userProfile.preferences.primaryGoal,
        teacherPersona: selectedTeacher.name
      });

      const aiMsg: ChatItem = {
        id: 'ai_' + Date.now(),
        role: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: response
      };

      setMessages(prev => [...prev, aiMsg]);
      soundService.playCorrect();

      // Persist to Cloud Firestore when user is authenticated
      if (currentUser?.uid) {
        // 1. Record daily study stats and XP
        progressService.recordDailyStudy(currentUser.uid, {
          minutesToAdd: 2,
          exercisesToAdd: 1,
          correctToAdd: response.correction ? 0 : 1,
          mistakesToAdd: response.correction ? 1 : 0,
          xpToAdd: 15,
          dailyGoalMinutes: userProfile.preferences.dailyMinutes || 15
        }).catch(err => console.warn('Could not record daily study stats:', err));

        // 2. Save conversation session in Firestore subcollection users/{uid}/conversationHistory
        conversationService.saveConversation(currentUser.uid, {
          id: 'tutor_' + Date.now(),
          scenarioId: `tutor_${selectedTeacher.name.toLowerCase()}`,
          scenarioTitle: `Aula com Prof. ${selectedTeacher.name}`,
          difficultyLevel: userProfile.level,
          summary: response.correction
            ? `Correção: "${response.correction.originalText}" -> "${response.correction.correctedText}"`
            : `Prática de conversação (${tutorMode})`,
          strengths: response.correction ? 'Prática ativa e vocabulário' : 'Excelente fala e estrutura',
          improvements: response.phoneticTip || 'Revisar cartões de vocabulário',
          timestamp: new Date().toISOString()
        }).catch(err => console.warn('Could not save conversation record:', err));
      }

      // Play audio automatically if configured
      if (userProfile.preferences?.autoPlayAudio) {
        playAudio(response.reply);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_err_' + Date.now(),
          role: 'assistant',
          text: 'Great effort! I am here to help. Could you repeat or rephrase your thought so we can practice together?',
          timestamp: 'Agora'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!speechService.isRecognitionSupported) {
      alert('Reconhecimento de voz não suportado neste navegador. Digite sua mensagem.');
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
        setInputPrompt(text);
        if (isFinal) {
          setIsRecording(false);
          handleSendMessage(text);
        }
      },
      onError: (err) => {
        console.warn('Voice recognition error:', err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });
  };

  const playAudio = (text: string, speedOverride?: number) => {
    const clean = text.replace(/[*_#]/g, '');
    const speed = speedOverride || playbackSpeed;
    aiService.playAudio(clean, speed);
  };

  const handleSaveVocabulary = async (vocabItem: { word: string; translation: string; phonetic?: string; example?: string }) => {
    soundService.playCorrect();
    setSavedVocabIds(prev => ({ ...prev, [vocabItem.word]: true }));

    // Add to local flashcards
    storageService.addCustomFlashcard({
      english: vocabItem.word,
      portuguese: vocabItem.translation,
      phonetic: vocabItem.phonetic || '',
      category: 'conversacao',
      exampleSentence: vocabItem.example || `${vocabItem.word} is a practical phrase.`,
      exampleTranslation: vocabItem.translation
    });

    // Add to Firestore if authenticated
    if (currentUser?.uid) {
      try {
        await reviewService.addCustomCard(currentUser.uid, {
          english: vocabItem.word,
          portuguese: vocabItem.translation,
          phonetic: vocabItem.phonetic || '',
          exampleSentence: vocabItem.example || '',
          exampleTranslation: vocabItem.translation,
          category: 'conversacao'
        });
      } catch (err) {
        console.warn('Could not sync flashcard to Firestore:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-3xl mx-auto p-3 sm:p-4 animate-in fade-in duration-200">
      
      {/* Teacher Profile Bar (Mobile-Optimized Header) */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Teacher Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedTeacher.avatar}
                alt={selectedTeacher.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-500/40 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white leading-tight">{selectedTeacher.name}</h2>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {selectedTeacher.accent}
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini + Firebase
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{selectedTeacher.title}</p>
            </div>
          </div>

          {/* Teacher Switcher & Speed Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaybackSpeed(prev => prev === 1.0 ? 0.75 : 1.0)}
              className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1 ${
                playbackSpeed === 0.75
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Velocidade da Voz do Professor"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{playbackSpeed}x</span>
            </button>

            <button
              onClick={() => setShowTeacherModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-400 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trocar Professor</span>
            </button>
          </div>
        </div>

        {/* Pedagogical Mode Switcher */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Modo de Aprendizado:</span>
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl">
            <button
              onClick={() => {
                soundService.playClick();
                setTutorMode('iniciante');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                tutorMode === 'iniciante' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Didático
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setTutorMode('conversacao');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                tutorMode === 'conversacao' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Conversação
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setTutorMode('imersao');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                tutorMode === 'imersao' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Imersão 100%
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {msg.role === 'user' ? (
              <div className="w-8 h-8 rounded-2xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-md">
                <User className="w-4 h-4" />
              </div>
            ) : (
              <img
                src={selectedTeacher.avatar}
                alt={selectedTeacher.name}
                className="w-8 h-8 rounded-2xl object-cover border border-sky-500/30 flex-shrink-0"
              />
            )}

            {/* Content Bubble */}
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none shadow-md shadow-sky-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-xl'
              }`}
            >
              {/* Main message text */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Structured Teacher Pedagogical Content */}
              {msg.data && msg.role === 'assistant' && (
                <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-800">
                  
                  {/* Didactic PT-BR Explanation if present */}
                  {msg.data.portugueseExplanation && (
                    <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold text-sky-400 mb-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Explicação Didática:</span>
                      </div>
                      <p className="leading-relaxed">{msg.data.portugueseExplanation}</p>
                    </div>
                  )}

                  {/* Immediate Correction Card */}
                  {msg.data.correction && (
                    <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Dica de Naturalidade & Correção:</span>
                      </div>
                      <div className="space-y-1 mt-1 text-[11px]">
                        <p><span className="text-rose-400 line-through">"{msg.data.correction.originalText}"</span></p>
                        <p className="text-emerald-300 font-semibold">👉 "{msg.data.correction.correctedText}"</p>
                        <p className="text-slate-400 mt-1">{msg.data.correction.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Phonetic Tip for Brazilians */}
                  {msg.data.phoneticTip && (
                    <div className="p-2.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 text-xs text-indigo-200 flex items-start gap-2">
                      <Volume2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-300 block mb-0.5">Dica Fonética:</span>
                        <p className="text-[11px] text-slate-300">{msg.data.phoneticTip}</p>
                      </div>
                    </div>
                  )}

                  {/* Saved Vocabulary Chip */}
                  {msg.data.savedVocabulary && msg.data.savedVocabulary.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400">Vocabulário Destaque:</span>
                      <div className="flex flex-wrap gap-2">
                        {msg.data.savedVocabulary.map((v, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs"
                          >
                            <div>
                              <span className="font-bold text-white">{v.word}</span>
                              <span className="text-slate-400 ml-1.5 text-[11px]">({v.translation})</span>
                              {v.phonetic && <span className="text-sky-400 text-[10px] ml-1">{v.phonetic}</span>}
                            </div>
                            <button
                              onClick={() => handleSaveVocabulary(v)}
                              disabled={savedVocabIds[v.word]}
                              className={`p-1 rounded-lg transition ${
                                savedVocabIds[v.word]
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : 'text-sky-400 hover:text-sky-300 hover:bg-slate-700'
                              }`}
                              title="Salvar no meu vocabulário SRS"
                            >
                              {savedVocabIds[v.word] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-Ups */}
                  {msg.data.suggestedFollowUps && msg.data.suggestedFollowUps.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Sugestões de Resposta (Toque para falar):
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {msg.data.suggestedFollowUps.map((suggested, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(suggested)}
                            className="text-left py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-[11px] text-sky-300 hover:text-white transition active:scale-[0.99] flex items-center justify-between"
                          >
                            <span>"{suggested}"</span>
                            <Send className="w-3 h-3 text-slate-500 flex-shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Bubble Footer */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => playAudio(msg.text, 0.75)}
                      className="text-slate-400 hover:text-sky-300 transition"
                      title="Ouvir Devagar"
                    >
                      0.75x
                    </button>
                    <button
                      onClick={() => playAudio(msg.text)}
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition font-bold"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Ouvir</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <img
              src={selectedTeacher.avatar}
              alt={selectedTeacher.name}
              className="w-8 h-8 rounded-2xl object-cover border border-sky-500/30 flex-shrink-0 animate-pulse"
            />
            <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-md">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce delay-150" />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce delay-300" />
              <span className="text-[11px] text-slate-400 font-medium">
                {selectedTeacher.name} está analisando sua fala e formulando o feedback...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Wave Animation when Recording */}
      {isRecording && (
        <div className="mb-2 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold">Ouvindo sua pronúncia em tempo real...</span>
          </div>
          <button
            onClick={handleVoiceInput}
            className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold"
          >
            Concluir
          </button>
        </div>
      )}

      {/* Mobile Input Container */}
      <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center gap-2">
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-3 rounded-2xl transition active:scale-95 flex-shrink-0 ${
            isRecording
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-750 text-sky-400 hover:text-white border border-slate-700'
          }`}
          title="Falar em inglês ou tirar dúvida por áudio"
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isRecording ? 'Gravando sua voz...' : 'Escreva em inglês ou tire dúvidas em português...'}
          className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isLoading}
          className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition active:scale-95 flex-shrink-0 shadow-md shadow-sky-600/30"
          title="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Teacher Selection Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-slate-100">
            <h3 className="text-base font-bold text-white mb-1">Escolha seu Professor Particular</h3>
            <p className="text-xs text-slate-400 mb-4">Cada professor possui uma especialidade pedagógica e sotaque característico.</p>

            <div className="space-y-3">
              {TEACHERS.map((teacher) => {
                const isSelected = selectedTeacher.id === teacher.id;
                return (
                  <div
                    key={teacher.id}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedTeacher(teacher);
                      setShowTeacherModal(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-sky-600/10 border-sky-500 shadow-md shadow-sky-500/10'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{teacher.name}</h4>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300">
                          {teacher.accent}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-sky-400">{teacher.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{teacher.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowTeacherModal(false)}
              className="w-full mt-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-300 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

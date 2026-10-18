import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { aiService, TutorMessage } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';
import {
  Send,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  User,
  Bot,
  Lightbulb,
  Globe,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface AITutorViewProps {
  userProfile: UserProfile;
}

export const AITutorView: React.FC<AITutorViewProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string; timestamp: string }>>([
    {
      id: 'init-msg',
      role: 'assistant',
      text: `Olá, ${userProfile.name}! Eu sou o seu Professor Particular de IA do EnglishFlow. 

Estou aqui para tirar dúvidas de gramática, explicar expressões do dia a dia, sugerir vocabulário e praticar com você sem qualquer julgamento. 

Sobre o que você gostaria de conversar ou tirar dúvidas hoje?`,
      timestamp: 'Agora'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState<'iniciante' | 'imersao' | 'conversacao'>('iniciante');
  const [isRecording, setIsRecording] = useState(false);

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
    const newMsg = {
      id: userMsgId,
      role: 'user' as const,
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
        userGoal: userProfile.preferences.primaryGoal
      });

      const aiMsg = {
        id: 'ai_' + Date.now(),
        role: 'assistant' as const,
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      soundService.playClick();
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_err_' + Date.now(),
          role: 'assistant' as const,
          text: 'Desculpe, ocorreu uma pequena oscilação na conexão. Como posso reformular ou ajudar com seu inglês?',
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

  const playAudio = (text: string) => {
    // Clean markdown/asterisks for audio playback
    const clean = text.replace(/[*_#]/g, '');
    aiService.playAudio(clean, userProfile.preferences.voicePlaybackSpeed);
  };

  const quickPrompts = [
    { label: 'Como pedir comida em inglês?', prompt: 'Como posso pedir comida e a conta em um restaurante em inglês de forma educada?' },
    { label: 'Diferença entre Make e Do', prompt: 'Qual a diferença prática entre "make" e "do"? Me dê 3 exemplos comuns.' },
    { label: 'Preposições In, On, At', prompt: 'Como não confundir "in", "on" e "at" para tempo e lugares?' },
    { label: 'Dica de Pronúncia do TH', prompt: 'Como posicionar a língua para falar o "th" de "think" e "this"?' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto p-3 sm:p-4 animate-in fade-in duration-200">
      
      {/* Tutor Header & Mode Switcher */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Tutor de Inglês com IA</h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-400">Calibrado para o seu nível: {userProfile.level}</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs">
          <button
            onClick={() => setTutorMode('iniciante')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              tutorMode === 'iniciante'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciante
          </button>
          <button
            onClick={() => setTutorMode('imersao')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              tutorMode === 'imersao'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Imersão
          </button>
          <button
            onClick={() => setTutorMode('conversacao')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              tutorMode === 'conversacao'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Conversação
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => playAudio(msg.text)}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ouvir</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse delay-150" />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse delay-300" />
              <span>O tutor está formulando uma resposta didática...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="pt-2 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(item.prompt)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-[11px] font-medium text-slate-300 transition active:scale-95"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-2">
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-2.5 rounded-xl transition ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Falar pelo microfone"
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isRecording ? 'Ouvindo sua voz...' : 'Tire uma dúvida em português ou fale em inglês...'}
          className="flex-1 bg-transparent px-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition active:scale-95"
          title="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

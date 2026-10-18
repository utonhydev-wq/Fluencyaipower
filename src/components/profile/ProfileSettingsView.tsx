import React, { useState } from 'react';
import { UserProfile, CEFRLevel, DailyTimeMinutes, LearningGoal, MainDifficulty } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { soundService } from '../../services/soundService';
import {
  User,
  Settings,
  Clock,
  Volume2,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Compass,
  Check,
  AlertTriangle,
  LogOut,
  Trash2,
  CheckCircle2,
  Database
} from 'lucide-react';

interface ProfileSettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onRetakePlacement: () => void;
  onOpenAuth: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
  onRetakePlacement,
  onOpenAuth
}) => {
  const { currentUser, logout, deleteAccount } = useAuth();

  const [name, setName] = useState(userProfile.name);
  const [level, setLevel] = useState<CEFRLevel>(userProfile.level);
  const [dailyMinutes, setDailyMinutes] = useState<DailyTimeMinutes>(userProfile.preferences.dailyMinutes || 15);
  const [primaryGoal, setPrimaryGoal] = useState<LearningGoal>(userProfile.preferences.primaryGoal || 'conversas_gerais');
  const [mainDifficulty, setMainDifficulty] = useState<MainDifficulty>(userProfile.preferences.mainDifficulty || 'falar');
  const [soundEnabled, setSoundEnabled] = useState(userProfile.preferences.soundEffects ?? true);
  const [voiceSpeed, setVoiceSpeed] = useState(userProfile.preferences.voicePlaybackSpeed ?? 1.0);
  const [theme, setTheme] = useState<'dark' | 'light'>(userProfile.preferences.theme || 'dark');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    soundService.playClick();
    const updated: UserProfile = {
      ...userProfile,
      name: name.trim() || 'Estudante',
      level,
      preferences: {
        ...userProfile.preferences,
        dailyMinutes,
        primaryGoal,
        mainDifficulty,
        soundEffects: soundEnabled,
        voicePlaybackSpeed: voiceSpeed,
        theme,
      }
    };

    await onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      await deleteAccount();
      setShowDeleteConfirm(false);
      alert('Sua conta e todos os dados no Firestore foram excluídos com sucesso.');
    } catch (err: any) {
      alert('Erro ao excluir conta. Caso tenha feito login há muito tempo, faça logout e login novamente para confirmar a exclusão.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Preferências & Nuvem</span>
        <h2 className="text-2xl font-black text-white">Perfil e Configurações</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
          Gerencie sua conta do Firebase, sincronização no Firestore e metas de estudo.
        </p>
      </div>

      {/* Firebase Account Card */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Conta Firebase & Firestore</h3>
              <p className="text-xs text-slate-400">
                {currentUser ? `Conectado como ${currentUser.email}` : 'Você está usando o modo local'}
              </p>
            </div>
          </div>

          {currentUser ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Sincronizado
            </span>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition"
            >
              Criar Conta / Entrar
            </button>
          )}
        </div>

        {currentUser && (
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">UID do Aluno:</span>
              <span className="font-mono text-slate-200">{currentUser.uid.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Banco de Dados:</span>
              <span className="font-mono text-sky-400">Cloud Firestore (Multi-device)</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        
        {/* Name & CEFR Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Seu Nome / Apelido</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nível Atual (CEFR)</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CEFRLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              <option value="A1">A1 — Iniciante (Primeiros Passos)</option>
              <option value="A2">A2 — Básico (Comunicação Cotidiana)</option>
              <option value="B1">B1 — Intermediário (Independência)</option>
              <option value="B2">B2 — Intermediário Avançado (Profissional)</option>
              <option value="C1">C1 — Avançado (Fluência Espontânea)</option>
              <option value="C2">C2 — Domínio Muito Avançado (Maestria)</option>
            </select>
          </div>
        </div>

        {/* Daily Time Goal */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meta Diária de Estudo</label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 15, 20, 25].map(min => (
              <button
                key={min}
                type="button"
                onClick={() => setDailyMinutes(min as DailyTimeMinutes)}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  dailyMinutes === min
                    ? 'border-sky-500 bg-sky-500/20 text-white'
                    : 'border-slate-800 bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        {/* Audio Preferences */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400">Áudio & Reprodução</h4>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-bold text-white block">Efeitos Sonoros</span>
                <span className="text-[11px] text-slate-400">Sons de acerto, erro e celebração</span>
              </div>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-sky-600' : 'bg-slate-700'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${soundEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div>
              <span className="text-xs font-bold text-white block">Velocidade Padrão da Voz</span>
              <span className="text-[11px] text-slate-400">Velocidade com que o tutor e frases são reproduzidos</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setVoiceSpeed(0.75)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${voiceSpeed === 0.75 ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
              >
                0.75x Lento
              </button>
              <button
                onClick={() => setVoiceSpeed(1.0)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${voiceSpeed === 1.0 ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
              >
                1.0x Normal
              </button>
            </div>
          </div>
        </div>

        {/* 4-digit PIN Quick Access Configuration */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>PIN de Acesso Rápido (4 Dígitos)</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {userProfile.securityPin ? 'PIN ativo para desbloqueio rápido no celular.' : 'Nenhum PIN configurado. Configure para entrar em segundos.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="password"
              maxLength={4}
              placeholder={userProfile.securityPin ? '••••' : 'Novo PIN (4 dígitos)'}
              value={userProfile.securityPin ? '••••' : ''}
              readOnly
              className="w-32 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-center font-mono text-white tracking-widest"
            />
            <button
              type="button"
              onClick={() => {
                const newPin = prompt('Digite um novo PIN numérico de 4 dígitos (ou deixe vazio para remover):');
                if (newPin === null) return;
                const trimmed = newPin.trim();
                if (trimmed === '') {
                  const updated = { ...userProfile, securityPin: undefined };
                  onUpdateProfile(updated);
                  alert('PIN removido com sucesso!');
                } else if (/^\d{4}$/.test(trimmed)) {
                  const updated = { ...userProfile, securityPin: trimmed };
                  onUpdateProfile(updated);
                  alert('PIN de 4 dígitos salvo com sucesso!');
                } else {
                  alert('O PIN deve conter exatamente 4 números (ex: 1234).');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-sky-400 transition"
            >
              {userProfile.securityPin ? 'Alterar / Remover PIN' : 'Criar PIN de 4 Dígitos'}
            </button>
          </div>
        </div>

        {/* Retake Placement Test */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Refazer Avaliação de Nível</h4>
            <p className="text-[11px] text-slate-400">Refaça o teste diagnóstico CEFR a qualquer momento.</p>
          </div>
          <button
            onClick={onRetakePlacement}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-sky-400 transition"
          >
            Refazer Teste
          </button>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Salvo no Cloud Firestore!</span>
            </>
          ) : (
            <span>Salvar Alterações no Firestore</span>
          )}
        </button>

      </div>

      {/* Account Deletion & Privacy */}
      {currentUser && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Privacidade e Exclusão de Conta
          </h3>
          <p className="text-xs text-slate-400">
            Você pode solicitar a exclusão permanente de sua conta e de todos os documentos associados a seu UID no Cloud Firestore (perfil, progresso, vocabulário e histórico).
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-xs font-bold text-rose-300 transition"
            >
              Solicitar Exclusão da Conta
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 space-y-3">
              <div className="flex items-start gap-2 text-rose-200 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>Tem certeza? Esta ação apagará permanentemente todo seu histórico no Firestore e não pode ser desfeita.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                >
                  Sim, Excluir Definitivamente
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brand & System Information */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center overflow-hidden shadow-md">
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
            <h4 className="text-sm font-black text-white lowercase">fluencyaipower</h4>
            <p className="text-[11px] text-slate-400">Inteligência Artificial & Ensino de Idiomas</p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          <span>v1.0.0 • Google Gemini & Cloud Firestore</span>
        </div>
      </div>

    </div>
  );
};

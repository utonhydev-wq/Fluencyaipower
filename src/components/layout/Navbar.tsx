import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { Flame, Zap, Sparkles, User, Settings, LogIn, LogOut, CheckCircle, Lock, Smartphone, Monitor } from 'lucide-react';

interface NavbarProps {
  userProfile: UserProfile;
  activeTab: string;
  isMobileViewMode: boolean;
  onToggleMobileView: () => void;
  onNavigate: (tabId: string) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onLockWithPin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  activeTab,
  isMobileViewMode,
  onToggleMobileView,
  onNavigate,
  onOpenSettings,
  onOpenAuth,
  onLockWithPin
}) => {
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white">EnglishFlow</span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 -mt-1 block font-medium hidden sm:block">
              Zero ao Avançado • CEFR {userProfile.level}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/70 p-1 rounded-2xl">
          {[
            { id: 'dashboard', label: 'Início' },
            { id: 'track', label: 'Trilha A1–C2' },
            { id: 'tutor', label: 'Professor IA' },
            { id: 'roleplay', label: 'Conversação' },
            { id: 'vocab', label: 'Vocabulário' },
            { id: 'pronunciation', label: 'Pronúncia' },
            { id: 'progress', label: 'Progresso' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Streak */}
          <div
            onClick={() => onNavigate('progress')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs cursor-pointer hover:bg-amber-500/20 transition"
            title="Sequência de dias estudados"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{userProfile.streak}</span>
          </div>

          {/* XP */}
          <div
            onClick={() => onNavigate('achievements')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-xs cursor-pointer hover:bg-sky-500/20 transition"
            title="XP acumulado"
          >
            <Zap className="w-3.5 h-3.5 fill-sky-400" />
            <span>{userProfile.xp}</span>
          </div>

          {/* User Auth Avatar / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                title={currentUser.email || 'Conta conectada'}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={userProfile.name}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-xs text-white">
                    {userProfile.name[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-300 hidden sm:inline max-w-[80px] truncate">
                  {userProfile.name}
                </span>
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 text-xs animate-in fade-in">
                  <div className="p-2 border-b border-slate-800 mb-1">
                    <span className="font-bold text-white block truncate">{userProfile.name}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{currentUser.email}</span>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Sincronizado no Firestore</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full p-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-sky-400" />
                    <span>Configurações & Metas</span>
                  </button>

                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    className="w-full p-2 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}

          {/* Mobile frame preview toggle for desktop */}
          <button
            onClick={onToggleMobileView}
            className={`hidden lg:flex items-center gap-1 p-2 rounded-xl border text-xs transition ${
              isMobileViewMode
                ? 'bg-sky-600/20 text-sky-400 border-sky-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isMobileViewMode ? 'Expandir para tela cheia' : 'Ativar simulação de celular (Mobile View)'}
          >
            {isMobileViewMode ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>

          {/* Quick PIN Lock Button */}
          {onLockWithPin && (
            <button
              onClick={onLockWithPin}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
              title="Bloquear com PIN de Segurança"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-xl transition ${
              activeTab === 'profile'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Configurações e Perfil"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};

import React from 'react';
import {
  Home,
  BookOpen,
  Sparkles,
  MessageSquare,
  Brain,
  Mic,
  Award
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (tabId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'track', label: 'Trilha', icon: BookOpen },
    { id: 'tutor', label: 'Tutor IA', icon: Sparkles },
    { id: 'roleplay', label: 'Conversa', icon: MessageSquare },
    { id: 'vocab', label: 'Vocab', icon: Brain },
    { id: 'pronunciation', label: 'Fala', icon: Mic },
    { id: 'achievements', label: 'Conquistas', icon: Award },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              isActive ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

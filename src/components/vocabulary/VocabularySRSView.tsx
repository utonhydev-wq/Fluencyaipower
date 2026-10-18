import React, { useState, useEffect } from 'react';
import { UserProfile, Flashcard, FlashcardCategory, CEFRLevel } from '../../types';
import { storageService } from '../../services/storageService';
import { reviewService } from '../../services/reviewService';
import { progressService } from '../../services/progressService';
import { aiService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Brain,
  Volume2,
  Star,
  Search,
  Filter,
  CheckCircle,
  Clock,
  RotateCw,
  Sparkles,
  BookMarked,
  ArrowRight,
  Flame,
  Cloud
} from 'lucide-react';

interface VocabularySRSViewProps {
  userProfile: UserProfile;
}

export const VocabularySRSView: React.FC<VocabularySRSViewProps> = ({ userProfile }) => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>(() => storageService.getFlashcards());
  const [selectedCategory, setSelectedCategory] = useState<FlashcardCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [studyMode, setStudyMode] = useState<'review' | 'list'>('review');

  // Review mode state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // Load from Firestore if authenticated
  useEffect(() => {
    async function loadFirestoreCards() {
      if (currentUser?.uid) {
        setIsLoadingCards(true);
        try {
          const userCards = await reviewService.getUserVocabulary(currentUser.uid);
          if (userCards && userCards.length > 0) {
            setCards(userCards);
          }
        } catch (err) {
          console.warn('Fallback to local flashcards:', err);
        } finally {
          setIsLoadingCards(false);
        }
      }
    }
    loadFirestoreCards();
  }, [currentUser]);

  // Filter cards
  const filteredCards = cards.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() ||
      c.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.portuguese.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const dueCards = cards.filter(c => {
    const next = new Date(c.nextReviewDate).getTime();
    return next <= Date.now() + 1000 * 60 * 60 * 12; // Due today or overdue
  });

  const activeReviewList = filteredCards.length > 0 ? filteredCards : cards;
  const currentCard = activeReviewList[currentCardIndex % activeReviewList.length];

  const handleFlipCard = () => {
    soundService.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleRateCard = async (rating: 'facil' | 'bom' | 'dificil' | 'repetir') => {
    if (!currentCard) return;

    soundService.playClick();
    let updatedCard: Flashcard;
    let xpGained = rating === 'facil' ? 15 : rating === 'bom' ? 10 : 5;

    if (currentUser?.uid) {
      try {
        updatedCard = await reviewService.rateCard(currentUser.uid, currentCard.id, currentCard, rating);
        await progressService.recordDailyStudy(currentUser.uid, {
          minutesToAdd: 1,
          exercisesToAdd: 1,
          correctToAdd: rating === 'facil' || rating === 'bom' ? 1 : 0,
          mistakesToAdd: rating === 'dificil' || rating === 'repetir' ? 1 : 0,
          xpToAdd: xpGained,
          dailyGoalMinutes: userProfile.preferences.dailyMinutes || 15
        });
      } catch (err) {
        console.error('Error saving SRS card in Firestore:', err);
        const res = storageService.rateFlashcard(currentCard.id, rating);
        updatedCard = res.updatedCard;
      }
    } else {
      const res = storageService.rateFlashcard(currentCard.id, rating);
      updatedCard = res.updatedCard;
    }

    // Update local state
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setIsFlipped(false);

    // Next card
    if (currentCardIndex < activeReviewList.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleToggleFavorite = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playClick();

    const targetCard = cards.find(c => c.id === cardId);
    if (!targetCard) return;

    const newFav = !targetCard.isFavorite;

    if (currentUser?.uid) {
      try {
        await reviewService.toggleFavorite(currentUser.uid, cardId, targetCard.isFavorite);
      } catch (err) {
        console.warn('Firestore favorite toggle fallback:', err);
      }
    }

    const updated = cards.map(c => c.id === cardId ? { ...c, isFavorite: newFav } : c);
    setCards(updated);
    storageService.saveFlashcards(updated);
  };

  const playAudio = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    aiService.playAudio(text, userProfile.preferences.voicePlaybackSpeed);
  };

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'essencial', label: 'Essencial' },
    { id: 'conversacao', label: 'Conversação' },
    { id: 'trabalho', label: 'Trabalho' },
    { id: 'viagens', label: 'Viagens' },
    { id: 'tecnologia', label: 'Tecnologia' },
    { id: 'phrasal_verbs', label: 'Phrasal Verbs' },
    { id: 'girias', label: 'Gírias' },
  ];

  const masteredCount = cards.filter(c => (c.intervalDays || 1) >= 7).length;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Repetição Espaçada (SRS)</span>
            {currentUser && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                Firestore Conectado
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white">Vocabulário Inteligente</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Memorize expressões e palavras no momento exato antes de esquecê-las.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs self-start">
          <button
            onClick={() => setStudyMode('review')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              studyMode === 'review'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Treinar Flashcards</span>
          </button>
          <button
            onClick={() => setStudyMode('list')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              studyMode === 'list'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Dicionário ({cards.length})</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 block">Total de Palavras</span>
          <span className="text-xl font-black text-white">{cards.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-emerald-400 block">Dominadas (7d+)</span>
          <span className="text-xl font-black text-emerald-400">{masteredCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 block">Pendentes de Revisão</span>
          <span className="text-xl font-black text-amber-400">{dueCards.length}</span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundService.playClick();
                setSelectedCategory(cat.id as any);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar palavra em inglês ou português..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* MODE 1: INTERACTIVE SRS FLASHCARD REVIEW */}
      {studyMode === 'review' && currentCard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Cartão {currentCardIndex + 1} de {activeReviewList.length}</span>
            <span className="capitalize text-sky-400 font-semibold">Categoria: {currentCard.category}</span>
          </div>

          {/* Flashcard 3D Interactive Container */}
          <div
            onClick={handleFlipCard}
            className="min-h-[280px] sm:min-h-[320px] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-slate-800 hover:border-sky-500/50 p-6 sm:p-8 cursor-pointer shadow-2xl relative flex flex-col justify-between transition-all duration-300 select-none group"
          >
            {/* Top Card Controls */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {currentCard.level} • {currentCard.partOfSpeech}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => playAudio(currentCard.english, e)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                  title="Ouvir pronúncia"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleToggleFavorite(currentCard.id, e)}
                  className={`p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition ${
                    currentCard.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Favoritar"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            {/* Front & Back Content */}
            {!isFlipped ? (
              /* FRONT */
              <div className="text-center my-auto space-y-2 py-6">
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {currentCard.english}
                </h3>
                <p className="text-xs sm:text-sm text-sky-400 font-mono tracking-wider">
                  {currentCard.phonetic}
                </p>
                <p className="text-xs text-slate-500 pt-4 flex items-center justify-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Toque para revelar tradução e exemplo</span>
                </p>
              </div>
            ) : (
              /* BACK */
              <div className="text-center my-auto space-y-4 py-4 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-400">Significado em Português</span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {currentCard.portuguese}
                  </h4>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-200">
                    <p className="font-semibold italic">"{currentCard.exampleSentence}"</p>
                    <button
                      onClick={(e) => playAudio(currentCard.exampleSentence, e)}
                      className="p-1 rounded-md text-sky-400 hover:text-white"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">{currentCard.exampleTranslation}</p>
                </div>
              </div>
            )}

            {/* Bottom Status */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-3">
              <span>Intervalo: {currentCard.intervalDays || 1} dias</span>
              <span>Revisões: {currentCard.repetitionCount || 0}</span>
            </div>
          </div>

          {/* SRS RATING BUTTONS */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <button
              onClick={() => handleRateCard('repetir')}
              className="py-3 px-2 rounded-2xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 text-rose-300 font-bold text-xs transition active:scale-95 text-center"
            >
              <div className="text-[10px] text-rose-400">Errei</div>
              <span>Repetir</span>
            </button>
            <button
              onClick={() => handleRateCard('dificil')}
              className="py-3 px-2 rounded-2xl bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/50 text-amber-300 font-bold text-xs transition active:scale-95 text-center"
            >
              <div className="text-[10px] text-amber-400">1 dia</div>
              <span>Difícil</span>
            </button>
            <button
              onClick={() => handleRateCard('bom')}
              className="py-3 px-2 rounded-2xl bg-sky-950/40 border border-sky-800/60 hover:bg-sky-900/50 text-sky-300 font-bold text-xs transition active:scale-95 text-center"
            >
              <div className="text-[10px] text-sky-400">3-5 dias</div>
              <span>Bom</span>
            </button>
            <button
              onClick={() => handleRateCard('facil')}
              className="py-3 px-2 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50 text-emerald-300 font-bold text-xs transition active:scale-95 text-center"
            >
              <div className="text-[10px] text-emerald-400">7+ dias</div>
              <span>Fácil</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: DICTIONARY LIST */}
      {studyMode === 'list' && (
        <div className="space-y-3">
          {filteredCards.length === 0 ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Nenhuma palavra encontrada com os filtros atuais.
            </div>
          ) : (
            filteredCards.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-white text-sm sm:text-base">{c.english}</h4>
                    <span className="text-xs text-sky-400 font-mono">{c.phonetic}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {c.level}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">{c.portuguese}</p>
                  <p className="text-[11px] text-slate-400 italic mt-1">"{c.exampleSentence}"</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playAudio(c.english)}
                    className="p-2 rounded-xl bg-slate-800 text-sky-400 hover:bg-sky-600 hover:text-white transition"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleToggleFavorite(c.id, e)}
                    className={`p-2 rounded-xl bg-slate-800 transition ${
                      c.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { soundService } from '../../services/soundService';
import {
  Lock,
  Unlock,
  KeyRound,
  Database,
  CloudCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Delete,
  CheckCircle2
} from 'lucide-react';

interface PinAccessModalProps {
  isOpen: boolean;
  onSuccess: (pin?: string) => void;
  onOpenFullAuth: () => void;
  savedPin?: string;
  userName?: string;
}

export const PinAccessModal: React.FC<PinAccessModalProps> = ({
  isOpen,
  onSuccess,
  onOpenFullAuth,
  savedPin,
  userName = 'Estudante'
}) => {
  const { currentUser } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [isCreatingPin, setIsCreatingPin] = useState<boolean>(!savedPin);
  const [step, setStep] = useState<'enter' | 'create_first' | 'create_confirm'>('enter');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    soundService.playClick();
    setErrorMsg(null);

    if (!savedPin) {
      // Flow to create a new PIN
      if (step === 'enter' || step === 'create_first') {
        if (pin.length < 4) {
          const next = pin + digit;
          setPin(next);
          if (next.length === 4) {
            setStep('create_confirm');
          }
        }
      } else if (step === 'create_confirm') {
        if (confirmPin.length < 4) {
          const nextConfirm = confirmPin + digit;
          setConfirmPin(nextConfirm);
          if (nextConfirm.length === 4) {
            if (nextConfirm === pin) {
              soundService.playCorrect();
              onSuccess(pin);
            } else {
              soundService.playIncorrect();
              setErrorMsg('Os PINs não conferem. Tente novamente.');
              setConfirmPin('');
              setPin('');
              setStep('create_first');
            }
          }
        }
      }
    } else {
      // Flow to unlock existing PIN
      if (pin.length < 4) {
        const next = pin + digit;
        setPin(next);
        if (next.length === 4) {
          if (next === savedPin) {
            soundService.playCorrect();
            onSuccess(next);
          } else {
            soundService.playIncorrect();
            setErrorMsg('PIN incorreto. Tente novamente.');
            setPin('');
          }
        }
      }
    }
  };

  const handleDelete = () => {
    soundService.playClick();
    setErrorMsg(null);
    if (!savedPin && step === 'create_confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleSkipOrQuickGuest = () => {
    soundService.playClick();
    onSuccess();
  };

  const activeDisplayLength = (!savedPin && step === 'create_confirm') ? confirmPin.length : pin.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/95 border border-slate-800 p-6 shadow-2xl relative text-slate-100 flex flex-col items-center">
        
        {/* Cloud database live indicator */}
        <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Firestore Conectado</span>
          </div>
          {currentUser ? (
            <span className="text-slate-300 truncate max-w-[130px]">{currentUser.email}</span>
          ) : (
            <span className="text-amber-400/90">Acesso Rápido</span>
          )}
        </div>

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 shadow-inner">
          <KeyRound className="w-8 h-8" />
        </div>

        {/* Header Text */}
        <h2 className="text-lg font-bold text-white text-center">
          {savedPin
            ? `Bem-vindo de volta, ${userName}!`
            : step === 'create_confirm'
            ? 'Confirme seu PIN de 4 Dígitos'
            : 'Crie seu PIN de Acesso Rápido'}
        </h2>
        <p className="text-xs text-slate-400 text-center mt-1 mb-5 max-w-[240px]">
          {savedPin
            ? 'Digite seu PIN de 4 números para desbloquear seus estudos sincronizados.'
            : step === 'create_confirm'
            ? 'Digite os mesmos 4 números para confirmar.'
            : 'Crie um código de 4 números para entrar rápido pelo celular.'}
        </p>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-xl animate-shake">
            {errorMsg}
          </div>
        )}

        {/* PIN Digit Indicators (Pills/Circles) */}
        <div className="flex items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < activeDisplayLength;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-sky-400 scale-125 shadow-lg shadow-sky-400/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Numeric Keypad (Native Mobile style) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-sky-600/30 border border-slate-700/80 text-xl font-bold text-white transition active:scale-95 flex items-center justify-center select-none shadow-sm"
            >
              {digit}
            </button>
          ))}
          <div className="flex items-center justify-center">
            {savedPin && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  onOpenFullAuth();
                }}
                className="text-[11px] font-medium text-slate-400 hover:text-white"
              >
                Esqueci
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-sky-600/30 border border-slate-700/80 text-xl font-bold text-white transition active:scale-95 flex items-center justify-center select-none shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95 flex items-center justify-center select-none"
            aria-label="Apagar dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Alternative Actions: Firebase Auth or Guest */}
        <div className="w-full pt-3 border-t border-slate-800/80 flex flex-col gap-2 text-center">
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              onOpenFullAuth();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-sky-400 hover:text-sky-300 border border-slate-700/50 flex items-center justify-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Entrar com E-mail ou Google</span>
          </button>

          {!savedPin && (
            <button
              type="button"
              onClick={handleSkipOrQuickGuest}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition py-1"
            >
              Pular definição de PIN por enquanto
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

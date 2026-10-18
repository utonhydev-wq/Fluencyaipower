class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  public isRecognitionSupported = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.isRecognitionSupported = true;
      }
    }
  }

  // Speak text with specified speed (normal 1.0 or slow 0.75) and accent
  speak(text: string, options?: { speed?: number; lang?: string; onEnd?: () => void }) {
    if (!this.synth) {
      options?.onEnd?.();
      return;
    }

    try {
      this.synth.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || 'en-US';
      utterance.rate = options?.speed ?? 0.95;
      utterance.pitch = 1.0;

      // Try finding preferred English voice
      const voices = this.synth.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      if (options?.onEnd) {
        utterance.onend = () => options.onEnd?.();
        utterance.onerror = () => options.onEnd?.();
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      options?.onEnd?.();
    }
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Voice recognition listener
  startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }) {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      callbacks.onError('O seu navegador atual não suporta reconhecimento de voz direto. Digite a frase para avaliar.');
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        callbacks.onResult(final || interim, Boolean(final));
      };

      rec.onerror = (event: any) => {
        callbacks.onError(event.error === 'not-allowed' ? 'Permissão de microfone negada no navegador.' : `Erro de áudio: ${event.error}`);
      };

      rec.onend = () => {
        callbacks.onEnd();
      };

      this.recognition = rec;
      rec.start();
    } catch (err: any) {
      callbacks.onError(err.message || 'Falha ao iniciar o microfone.');
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }
}

export const speechService = new SpeechService();

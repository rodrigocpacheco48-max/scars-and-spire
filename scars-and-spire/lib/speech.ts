// ─── lib/speech.ts ─────────────────────────────────────────────────────────────
// 100% browser-native Web Speech API. Zero external API calls.
// Works best in Chrome/Edge; Firefox supports TTS only.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Ambient type declarations for Web Speech API (not in default TS DOM lib) ──

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type ISpeechRecognitionCtor = new () => ISpeechRecognition;

// ─── Capability Guards ────────────────────────────────────────────────────────

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speak `text` aloud using the browser's speech synthesis.
 * Cancels any currently-playing utterance first.
 * Prefers deeper, slower voices that fit the gothic RPG tone.
 */
export function speak(text: string, onEnd?: () => void): void {
  if (!isSpeechSynthesisSupported()) return;

  cancelSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 0.85;
  utterance.volume = 1;

  // Voices may not be loaded yet (async); schedule after voices load
  const assignVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('alex') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('david'))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      activeUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      activeUtterance = null;
      onEnd?.();
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    assignVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      assignVoiceAndSpeak();
    };
  }
}

/** Stop any speech currently in progress. */
export function cancelSpeech(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
  activeUtterance = null;
}

/** Returns true if TTS is currently playing. */
export function isSpeaking(): boolean {
  return isSpeechSynthesisSupported() && window.speechSynthesis.speaking;
}

// ─── Speech-to-Text ───────────────────────────────────────────────────────────

let recognizer: ISpeechRecognition | null = null;

/**
 * Start listening for speech input.
 * @param onResult  Called with the final transcribed string when recognition ends.
 * @param onEnd     Called when recognition ends (result or not).
 */
export function startDictation(
  onResult: (text: string) => void,
  onEnd?: () => void
): void {
  if (!isSpeechRecognitionSupported()) return;

  stopDictation();

  const win = window as unknown as {
    SpeechRecognition?: ISpeechRecognitionCtor;
    webkitSpeechRecognition?: ISpeechRecognitionCtor;
  };
  const SpeechRecognitionImpl = win.SpeechRecognition || win.webkitSpeechRecognition!;

  recognizer = new SpeechRecognitionImpl();
  recognizer.lang = 'en-US';
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  let finalTranscript = '';

  recognizer.onresult = (event: SpeechRecognitionEvent) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
  };

  recognizer.onend = () => {
    recognizer = null;
    if (finalTranscript.trim()) onResult(finalTranscript.trim());
    onEnd?.();
  };

  recognizer.onerror = () => {
    recognizer = null;
    onEnd?.();
  };

  recognizer.start();
}

/** Abort the active dictation session. */
export function stopDictation(): void {
  if (recognizer) {
    recognizer.abort();
    recognizer = null;
  }
}

/** Returns true if STT is currently active. */
export function isDictating(): boolean {
  return recognizer !== null;
}

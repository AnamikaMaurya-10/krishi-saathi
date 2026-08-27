/**
 * Voice Service
 * 
 * Uses browser Web Speech API for text-to-speech
 * Falls back gracefully if not available
 */

import type { Locale } from "./i18n";

const LOCALE_MAP: Record<Locale, string> = {
  en: "en-IN",
  od: "or-IN",
  hi: "hi-IN",
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, locale: Locale = "en"): void {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis not available in this browser");
    return;
  }

  // Stop any ongoing speech
  stop();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LOCALE_MAP[locale] || "en-IN";
  utterance.rate = 0.85; // Slightly slower for clarity
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find a voice for the language
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(locale));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
  };

  utterance.onerror = () => {
    currentUtterance = null;
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stop(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking || false;
}

export function isSpeechAvailable(): boolean {
  return "speechSynthesis" in window;
}

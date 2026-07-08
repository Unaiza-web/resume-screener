import { useCallback, useEffect, useRef, useState } from 'react';

export function speak(text, onEnd) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = 'en-US';
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.speak(utterance);
  }
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone access was blocked. Allow microphone permission in your browser and try again.',
  'no-speech': "Didn't catch that — try speaking again.",
  'audio-capture': 'No microphone found. Check that a mic is connected.',
  network: 'Network error with speech recognition. Check your connection and try again.',
  aborted: '',
};


export function useSpeechToText() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const shouldBeListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let final = finalTranscriptRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += (final ? ' ' : '') + text.trim();
        } else {
          interim += text;
        }
      }
      finalTranscriptRef.current = final;
      setTranscript((final + ' ' + interim).trim());
    };

    recognition.onerror = (event) => {
      const message = ERROR_MESSAGES[event.error] ?? `Speech recognition error: ${event.error}`;
      if (message) setError(message);
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        shouldBeListeningRef.current = false;
        setListening(false);
      }
    };

    recognition.onend = () => {
      if (shouldBeListeningRef.current) {
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldBeListeningRef.current = false;
      recognition.stop();
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError('');
    finalTranscriptRef.current = '';
    setTranscript('');
    shouldBeListeningRef.current = true;
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      // Already started — ignore.
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldBeListeningRef.current = false;
    recognitionRef.current.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setError('');
  }, []);

  return { listening, transcript, supported, error, start, stop, reset };
}
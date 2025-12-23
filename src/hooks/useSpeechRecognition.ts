import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechRecognitionOptions {
  onTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onTranscript, onFinalTranscript, continuous = true, interimResults = true } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const shouldContinueRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsSupported(false);
      setError("Speech recognition is not available in this environment");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          finalTranscriptRef.current = finalTranscript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);
      onTranscriptRef.current?.(fullTranscript);
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(event.error);
      }
    };

    recognition.onend = () => {
      const hadTranscript = finalTranscriptRef.current;
      setIsListening(false);
      
      if (hadTranscript) {
        onFinalTranscriptRef.current?.(hadTranscript);
      }

      // If the user wants to keep listening, restart automatically.
      if (shouldContinueRef.current) {
        try {
          recognition.start();
        } catch (restartError) {
          console.error("Failed to restart speech recognition:", restartError);
          setError("Failed to restart speech recognition");
          shouldContinueRef.current = false;
        }
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current = recognition;

    return () => {
      shouldContinueRef.current = false;
      try {
        recognition.abort();
      } catch (abortError) {
        console.error("Failed to abort speech recognition:", abortError);
      }
    };
  }, [continuous, interimResults]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    if (isListening) return;
    
    shouldContinueRef.current = true;
    finalTranscriptRef.current = "";
    setTranscript("");
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    shouldContinueRef.current = false;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error("Failed to stop speech recognition:", err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

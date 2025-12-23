import { useCallback, useEffect, useRef, useState } from "react";

interface UseAudioVisualizerOptions {
  bars?: number;
  fftSize?: number;
  smoothingTimeConstant?: number;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export function useAudioVisualizer(options: UseAudioVisualizerOptions = {}) {
  const { bars = 24, fftSize = 512, smoothingTimeConstant = 0.8 } = options;

  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: bars }, () => 0));
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    setLevels(Array.from({ length: bars }, () => 0));
  }, [bars]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsSupported(false);
      setError("Audio input is not available in this environment");
      return;
    }

    const hasMedia = !!navigator.mediaDevices?.getUserMedia;
    const hasAudioContext = !!(window.AudioContext || window.webkitAudioContext);

    if (!hasMedia || !hasAudioContext) {
      setIsSupported(false);
      setError("Microphone input is not supported in this browser");
    }
  }, []);

  const stop = useCallback(() => {
    isActiveRef.current = false;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (disconnectError) {
        console.error("Failed to disconnect audio source:", disconnectError);
      }
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch (disconnectError) {
        console.error("Failed to disconnect analyser:", disconnectError);
      }
      analyserRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch((closeError) => {
        console.error("Failed to close audio context:", closeError);
      });
      audioContextRef.current = null;
    }

    setIsActive(false);
    setLevels(Array.from({ length: bars }, () => 0));
  }, [bars]);

  const start = useCallback(async () => {
    if (!isSupported || isActiveRef.current) return;

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor || !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
      setError("Microphone input is not supported in this browser");
      return;
    }

    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContextConstructor();
      await audioContext.resume();

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!isActiveRef.current) {
          return;
        }
        analyser.getByteFrequencyData(dataArray);

        const binSize = Math.max(1, Math.floor(bufferLength / bars));
        const nextLevels: number[] = new Array(bars).fill(0);

        for (let i = 0; i < bars; i += 1) {
          const startBin = i * binSize;
          const endBin = i === bars - 1 ? bufferLength : startBin + binSize;
          let sum = 0;

          for (let j = startBin; j < endBin; j += 1) {
            sum += dataArray[j];
          }

          const average = sum / Math.max(1, endBin - startBin);
          nextLevels[i] = average / 255;
        }

        setLevels(nextLevels);
        rafRef.current = requestAnimationFrame(update);
      };

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;
      isActiveRef.current = true;
      setIsActive(true);

      rafRef.current = requestAnimationFrame(update);
    } catch (err) {
      console.error("Failed to start audio visualizer:", err);
      setError("Unable to access the microphone");
      stop();
    }
  }, [bars, fftSize, isSupported, smoothingTimeConstant, stop]);

  useEffect(() => () => stop(), [stop]);

  return {
    levels,
    isActive,
    isSupported,
    error,
    start,
    stop,
  };
}

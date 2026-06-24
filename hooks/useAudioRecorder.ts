"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
  permissionDenied: boolean;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    cleanupStream();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setIsRecording(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    chunksRef.current = [];
    mediaRecorderRef.current = null;
  }, [audioUrl, cleanupStream]);

  const start = useCallback(async () => {
    try {
      setError(null);
      setPermissionDenied(false);
      reset();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
        cleanupStream();
      };

      mediaRecorder.start(250);
      startTimeRef.current = Date.now();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access microphone";
      if (
        message.includes("Permission") ||
        message.includes("NotAllowed") ||
        message.includes("denied")
      ) {
        setPermissionDenied(true);
        setError("Microphone permission denied. Please allow access in your browser settings.");
      } else {
        setError(message);
      }
    }
  }, [cleanupStream, reset]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupStream();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, cleanupStream]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    error,
    permissionDenied,
    start,
    stop,
    reset,
  };
}

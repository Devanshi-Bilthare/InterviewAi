"use client";

import { useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  className?: string;
  disabled?: boolean;
}

export function AudioRecorder({
  onRecordingComplete,
  className,
  disabled,
}: AudioRecorderProps) {
  const {
    isRecording,
    audioBlob,
    duration,
    error,
    permissionDenied,
    start,
    stop,
  } = useAudioRecorder();

  const handleToggle = async () => {
    if (disabled) return;
    if (isRecording) {
      stop();
    } else {
      await start();
    }
  };

  useEffect(() => {
    if (audioBlob && !isRecording && onRecordingComplete) {
      onRecordingComplete(audioBlob, duration);
    }
  }, [audioBlob, isRecording, duration, onRecordingComplete]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {isRecording && (
        <div className="flex h-12 items-end justify-center gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-intelligence-primary animate-pulse"
              style={{
                height: `${12 + Math.sin(i * 0.8) * 20 + Math.random() * 16}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || permissionDenied}
        className={cn(
          "relative flex size-20 items-center justify-center rounded-full transition-all duration-300",
          isRecording
            ? "bg-danger shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse"
            : "bg-intelligence-primary/20 hover:bg-intelligence-primary/30 hover:shadow-glow",
          (disabled || permissionDenied) && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {permissionDenied ? (
          <MicOff className="size-8 text-danger" />
        ) : (
          <Mic
            className={cn(
              "size-8",
              isRecording ? "text-white" : "text-intelligence-primary"
            )}
          />
        )}
        {isRecording && (
          <span className="absolute inset-0 rounded-full border-2 border-danger/50 animate-ping" />
        )}
      </button>

      <p className="font-mono text-lg font-semibold text-text-primary">
        {formatDuration(duration)}
      </p>

      <p className="text-sm text-text-secondary">
        {permissionDenied
          ? "Microphone access denied"
          : isRecording
            ? "Recording... Click to stop"
            : "Click to start recording"}
      </p>

      {error && !permissionDenied && (
        <p className="text-center text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

export { useAudioRecorder };

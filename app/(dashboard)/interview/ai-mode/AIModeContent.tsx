"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, PhoneOff, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AIInterviewer,
  type AIMessage,
} from "@/components/interview/AIInterviewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import {
  INTERVIEW_CATEGORIES,
  type InterviewCategoryId,
} from "@/lib/interview-categories";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type Phase = "setup" | "interview" | "completing";

const MAX_TEXT_LENGTH = 2000;

export default function AIModeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory =
    (searchParams.get("category") as InterviewCategoryId) || "mern-stack";

  const [phase, setPhase] = useState<Phase>("setup");
  const [category, setCategory] =
    useState<InterviewCategoryId>(initialCategory);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  const candidateScrollRef = useRef<HTMLDivElement>(null);
  const holdActiveRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  const {
    isRecording,
    audioBlob,
    start,
    stop,
    reset,
    permissionDenied,
    duration,
  } = useAudioRecorder();

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const categoryMeta = INTERVIEW_CATEGORIES.find((c) => c.id === category);
  const aiMessages: AIMessage[] = messages
    .filter((m) => m.role === "assistant")
    .map((m) => ({ id: m.id, role: "assistant", content: m.content }));

  const userMessages = messages.filter((m) => m.role === "user");

  useEffect(() => {
    candidateScrollRef.current?.scrollTo({
      top: candidateScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTranscribing]);

  const sendToAlex = useCallback(
    async (message: string, endInterview = false) => {
      const trimmed = message.trim();
      if (trimmed) {
        setMessages((prev) => [
          ...prev,
          { id: `user-${Date.now()}`, role: "user", content: trimmed },
        ]);
      }

      setIsSending(true);
      setIsTyping(true);
      setIsSpeaking(false);

      try {
        const response = await fetch("/api/interview/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            sessionId,
            category,
            conversationHistory: messagesRef.current.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            endInterview,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (trimmed) {
            setMessages((prev) => prev.filter((m) => m.content !== trimmed));
          }
          toast.error(data.error ?? "Failed to reach Alex");
          return;
        }

        if (data.sessionId) setSessionId(data.sessionId);

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply,
          },
        ]);

        setExchangeCount(data.exchangeCount ?? 0);
        setIsSpeaking(true);
        setIsTyping(false);

        if (data.isInterviewComplete) {
          setPhase("completing");
          toast.success("Interview complete! Generating your report...");
          setTimeout(() => {
            router.push(`/interview/results/${data.sessionId}`);
          }, 3500);
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
        setIsTyping(false);
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, category, router]
  );

  const startInterview = async () => {
    setPhase("interview");
    await sendToAlex("");
  };

  const handleTextSend = async () => {
    if (!textInput.trim() || isSending || phase !== "interview") return;
    const msg = textInput.trim();
    setTextInput("");
    await sendToAlex(msg);
  };

  const transcribeAndSend = useCallback(
    async (blob: Blob) => {
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        const res = await fetch("/api/speech/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? "Transcription failed");
          return;
        }

        if (!data.transcript?.trim()) {
          toast.error("No speech detected. Please try again.");
          return;
        }

        await sendToAlex(data.transcript.trim());
      } catch {
        toast.error("Failed to transcribe audio");
      } finally {
        setIsTranscribing(false);
        reset();
      }
    },
    [sendToAlex, reset]
  );

  useEffect(() => {
    if (audioBlob && !isRecording && !isTranscribing && holdActiveRef.current) {
      holdActiveRef.current = false;
      transcribeAndSend(audioBlob);
    }
  }, [audioBlob, isRecording, isTranscribing, transcribeAndSend]);

  const handleHoldStart = async () => {
    if (
      isSending ||
      isTranscribing ||
      phase !== "interview" ||
      permissionDenied
    )
      return;
    holdActiveRef.current = true;
    setIsHolding(true);
    reset();
    await start();
  };

  const handleHoldEnd = () => {
    if (!isHolding) return;
    setIsHolding(false);
    if (isRecording) stop();
  };

  const handleEndInterview = async () => {
    if (!sessionId || exchangeCount === 0) {
      toast.error("Answer at least one question before ending.");
      return;
    }
    await sendToAlex("", true);
  };

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold gradient-text">
            AI Interview with Alex
          </h1>
          <p className="mt-2 text-text-secondary">
            Real-time conversational mock interview — speak naturally, get live
            follow-ups
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {INTERVIEW_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                "glass-card rounded-xl border p-4 text-left transition-all",
                category === cat.id
                  ? "border-intelligence-primary shadow-glow"
                  : "border-deep-border hover:border-intelligence-primary/50"
              )}
            >
              <p className="font-medium text-text-primary">{cat.name}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {cat.description}
              </p>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={startInterview}
            disabled={isSending}
            className="h-12 border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary px-8 text-white"
          >
            {isSending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Connecting to Alex...
              </>
            ) : (
              "Start AI Interview"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-deep-border bg-deep-card/50 px-4 py-3">
        <div>
          <h1 className="font-display text-lg font-semibold text-text-primary">
            AI Interview with Alex
          </h1>
          <Badge
            variant="outline"
            className="mt-1 border-intelligence-primary/30 text-intelligence-primary"
          >
            {categoryMeta?.name ?? category}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="text-text-secondary">Exchanges</p>
            <p className="font-mono font-semibold text-text-primary">
              {exchangeCount} / 10
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEndInterview}
            disabled={isSending || phase === "completing"}
            className="border-danger/50 text-danger hover:bg-danger/10"
          >
            <PhoneOff className="size-4" />
            End Interview
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="glass-card flex min-h-[280px] flex-col rounded-2xl border border-deep-border p-4 lg:min-h-0">
          <AIInterviewer
            messages={aiMessages}
            isTyping={isTyping}
            isSpeaking={isSpeaking && !isTyping}
          />
        </div>

        <div className="glass-card flex min-h-[280px] flex-col rounded-2xl border border-deep-border p-4 lg:min-h-0">
          <p className="mb-3 text-sm font-medium text-text-secondary">
            Your Responses
          </p>
          <div
            ref={candidateScrollRef}
            className="flex-1 space-y-3 overflow-y-auto"
          >
            <AnimatePresence mode="popLayout">
              {userMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-indigo-600/80 px-4 py-3 text-sm text-white"
                >
                  {msg.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTranscribing && (
              <div className="ml-auto flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 className="size-4 animate-spin" />
                Transcribing...
              </div>
            )}

            {userMessages.length === 0 && !isTranscribing && (
              <p className="text-center text-sm text-text-secondary">
                Hold the mic button below to record your answer, or type a
                response.
              </p>
            )}
          </div>

          <div className="mt-3 flex gap-2 border-t border-deep-border pt-3">
            <Input
              value={textInput}
              onChange={(e) =>
                setTextInput(e.target.value.slice(0, MAX_TEXT_LENGTH))
              }
              onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
              placeholder="Type your answer..."
              disabled={isSending || phase === "completing"}
            />
            <Button
              size="icon"
              onClick={handleTextSend}
              disabled={!textInput.trim() || isSending}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-xl border border-deep-border bg-deep-card/50 px-4 py-4">
        <button
          type="button"
          onPointerDown={handleHoldStart}
          onPointerUp={handleHoldEnd}
          onPointerLeave={handleHoldEnd}
          onContextMenu={(e) => e.preventDefault()}
          disabled={
            isSending ||
            isTranscribing ||
            phase === "completing" ||
            permissionDenied
          }
          className={cn(
            "flex size-20 touch-none select-none items-center justify-center rounded-full transition-all",
            isRecording || isHolding
              ? "scale-110 bg-danger shadow-[0_0_30px_rgba(239,68,68,0.5)]"
              : "bg-gradient-to-br from-intelligence-primary to-indigo-600 hover:shadow-glow",
            (isSending || isTranscribing || phase === "completing") &&
              "cursor-not-allowed opacity-50"
          )}
        >
          <Mic className="size-8 text-white" />
        </button>
        <p className="text-sm text-text-secondary">
          {permissionDenied
            ? "Microphone access denied"
            : isRecording
              ? `Recording... ${duration}s — Release to send`
              : "Hold to record · Release to send"}
        </p>
        {textInput.length > 0 && (
          <p className="text-xs text-text-secondary">
            {textInput.length} / {MAX_TEXT_LENGTH}
          </p>
        )}
        {phase === "completing" && (
          <p className="flex items-center gap-2 text-sm text-intelligence-primary">
            <Loader2 className="size-4 animate-spin" />
            Generating your report...
          </p>
        )}
      </div>
    </div>
  );
}

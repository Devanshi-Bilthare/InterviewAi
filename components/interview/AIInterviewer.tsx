"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AIMessage {
  id: string;
  role: "assistant";
  content: string;
}

interface AIInterviewerProps {
  messages: AIMessage[];
  isTyping: boolean;
  isSpeaking: boolean;
  enableTTS?: boolean;
  onTTSToggle?: (enabled: boolean) => void;
}

function TypewriterText({
  text,
  active,
  onComplete,
}: {
  text: string;
  active: boolean;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState(active ? "" : text);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      return;
    }

    setDisplayed("");
    completedRef.current = false;
    let index = 0;

    const interval = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    }, 18);

    return () => clearInterval(interval);
  }, [text, active, onComplete]);

  return <span>{displayed}</span>;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-intelligence-primary"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

export function AIInterviewer({
  messages,
  isTyping,
  isSpeaking,
  enableTTS = false,
  onTTSToggle,
}: AIInterviewerProps) {
  const [ttsEnabled, setTtsEnabled] = useState(enableTTS);
  const [typewriterDone, setTypewriterDone] = useState(false);
  const spokenRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const latestMessage = messages[messages.length - 1];

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Google")
    );
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    setTypewriterDone(false);
  }, [latestMessage?.id]);

  useEffect(() => {
    if (
      ttsEnabled &&
      latestMessage &&
      typewriterDone &&
      spokenRef.current !== latestMessage.id
    ) {
      spokenRef.current = latestMessage.id;
      speak(latestMessage.content);
    }
  }, [latestMessage, ttsEnabled, typewriterDone, speak]);

  const handleTTSToggle = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    onTTSToggle?.(next);
    if (!next) window.speechSynthesis?.cancel();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center pb-4">
        <div
          className={cn(
            "relative flex size-24 items-center justify-center rounded-full",
            isSpeaking || isTyping
              ? "animate-pulse"
              : ""
          )}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br from-intelligence-primary to-intelligence-secondary p-[3px]",
              (isSpeaking || isTyping) && "shadow-[0_0_24px_rgba(99,102,241,0.5)]"
            )}
          >
            <div className="flex size-full items-center justify-center rounded-full bg-deep-bg">
              <Bot className="size-10 text-intelligence-primary" />
            </div>
          </div>
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold text-text-primary">
          Alex
        </h2>
        <p className="text-sm text-text-secondary">
          Senior Technical Interviewer
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTTSToggle}
          className="mt-2 text-text-secondary hover:text-text-primary"
        >
          {ttsEnabled ? (
            <>
              <Volume2 className="size-4" />
              Voice On
            </>
          ) : (
            <>
              <VolumeX className="size-4" />
              Voice Off
            </>
          )}
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto pr-1"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => {
              const isLatest = index === messages.length - 1;
              return (
                <motion.div
                  key={msg.id}
                  variants={itemVariants}
                  layout
                  className="glass-card rounded-2xl rounded-tl-sm border border-deep-border p-4"
                >
                  <p className="text-sm leading-relaxed text-text-primary">
                    <TypewriterText
                      text={msg.content}
                      active={isLatest && !typewriterDone}
                      onComplete={() => setTypewriterDone(true)}
                    />
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card w-fit rounded-2xl rounded-tl-sm border border-deep-border px-4 py-2"
            >
              <TypingIndicator />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

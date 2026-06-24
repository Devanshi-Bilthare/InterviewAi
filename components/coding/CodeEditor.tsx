"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";

import type { CodingLanguage, StarterCode } from "@/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-text-secondary">
      Loading editor...
    </div>
  ),
});

interface CodeEditorProps {
  language: CodingLanguage;
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  fontSize?: number;
  theme?: "vs-dark" | "light";
  height?: string;
}

export function CodeEditor({
  language,
  value,
  onChange,
  onRun,
  fontSize = 14,
  theme = "vs-dark",
  height = "100%",
}: CodeEditorProps) {
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  const handleMount = useCallback(
    (editor: {
      addCommand: (keybinding: number, handler: () => void) => void;
    }) => {
      editor.addCommand(
        // eslint-disable-next-line no-bitwise
        2048 | 3,
        () => onRunRef.current?.()
      );
    },
    []
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onRunRef.current?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <MonacoEditor
      height={height}
      language={monacoLanguage(language)}
      theme={theme}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      options={{
        fontSize,
        fontFamily: "JetBrains Mono, monospace",
        minimap: { enabled: false },
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 12 },
      }}
    />
  );
}

function monacoLanguage(language: CodingLanguage): string {
  switch (language) {
    case "javascript":
      return "javascript";
    case "python":
      return "python";
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    default:
      return "javascript";
  }
}

export function getStarterCode(
  starterCode: StarterCode,
  language: CodingLanguage
): string {
  return starterCode[language] || starterCode.javascript || "";
}

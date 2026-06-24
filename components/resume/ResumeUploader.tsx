"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ResumeUploaderProps {
  analyzing: boolean;
  onFile: (file: File) => void;
  pastedText: string;
  onPastedTextChange: (text: string) => void;
  onAnalyzeText: () => void;
}

export function ResumeUploader({
  analyzing,
  onFile,
  pastedText,
  onPastedTextChange,
  onAnalyzeText,
}: ResumeUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-intelligence-primary bg-intelligence-primary/5"
            : "border-deep-border"
        )}
      >
        <Upload className="mx-auto size-10 text-intelligence-primary" />
        <p className="mt-3 font-medium text-text-primary">
          Drag & drop your resume here
        </p>
        <p className="mt-1 text-sm text-text-secondary">PDF or TXT · Max 5MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
        <Button
          className="mt-4 border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary text-white"
          disabled={analyzing}
          onClick={() => fileRef.current?.click()}
        >
          {analyzing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <FileText className="size-4" />
              Choose File
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium text-text-secondary">
          Or paste resume text
        </p>
        <Textarea
          value={pastedText}
          onChange={(e) => onPastedTextChange(e.target.value)}
          placeholder="Paste your resume content here..."
          rows={6}
          className="resize-none"
        />
        <Button
          variant="outline"
          disabled={analyzing || !pastedText.trim()}
          onClick={onAnalyzeText}
          className="border-deep-border"
        >
          {analyzing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="size-4" />
              Analyze Text
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

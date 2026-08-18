"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  FileArchive,
  X,
  Loader2,
  Globe,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Search,
  CheckCircle2,
  FileCode2,
  Database,
  Server,
  Container,
  Cpu,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ANALYSIS_STEPS = [
  { icon: FileArchive, label: "Extracting ZIP archive…", key: "extract" },
  { icon: FileCode2, label: "Detecting framework & language…", key: "framework" },
  { icon: Cpu, label: "Identifying runtime & package manager…", key: "runtime" },
  { icon: Database, label: "Scanning for database usage…", key: "database" },
  { icon: Wifi, label: "Checking for WebSockets & workers…", key: "websocket" },
  { icon: Container, label: "Looking for Docker configuration…", key: "docker" },
  { icon: Server, label: "Evaluating platform compatibility…", key: "rules" },
  { icon: Sparkles, label: "Generating results…", key: "results" },
];

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(".zip")) {
      setFile(droppedFile);
    } else {
      setError("Only .zip files are supported.");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const selectedFile = e.target.files?.[0];
      if (selectedFile?.name.endsWith(".zip")) {
        setFile(selectedFile);
      } else if (selectedFile) {
        setError("Only .zip files are supported.");
      }
    },
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setCurrentStep(0);

    // Animate through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      // Navigate to results
      setCurrentStep(ANALYSIS_STEPS.length - 1);
      setTimeout(() => {
        router.push(`/results/${data.id}`);
      }, 500);
    } catch {
      clearInterval(stepInterval);
      setError("Network error. Please check your connection and try again.");
      setIsAnalyzing(false);
    }
  }, [file, router]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Host<span className="gradient-text">Where</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          {!isAnalyzing ? (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 border border-primary/20">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                  Analyze your project
                </h1>
                <p className="text-muted-foreground">
                  Upload a ZIP file of your project. We&apos;ll analyze it and tell
                  you where it can run.
                </p>
              </div>

              {/* Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`upload-zone rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragging ? "drag-over" : ""
                } ${file ? "border-primary/30 bg-primary/5" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />

                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <FileArchive className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5 border border-border/60">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium mb-1">
                      Drop your project ZIP here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Max 50MB • .zip files only • No data stored
                    </p>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={!file}
                size="lg"
                className="w-full mt-6 gap-2 h-12 text-base glow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Compatibility
              </Button>

              {/* Info */}
              <p className="text-xs text-muted-foreground/60 text-center mt-6 max-w-sm mx-auto">
                Your code is never executed or stored. We perform read-only
                static analysis in memory.
              </p>
            </>
          ) : (
            /* Analysis in progress */
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Analyzing your project…
              </h2>
              <p className="text-sm text-muted-foreground mb-10">
                {file?.name}
              </p>

              <div className="space-y-3 text-left max-w-sm mx-auto">
                {ANALYSIS_STEPS.map((step, i) => {
                  const isComplete = i < currentStep;
                  const isCurrent = i === currentStep;

                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        isCurrent
                          ? "bg-primary/10 border border-primary/20"
                          : isComplete
                          ? "opacity-50"
                          : "opacity-20"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                      ) : (
                        <step.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

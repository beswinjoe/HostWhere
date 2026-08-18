"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileArchive,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  FileCode2,
  Database,
  Server,
  Container,
  Cpu,
  Wifi,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";

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
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-xl hero-animate">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Analyze your project
            </h1>
            <p className="text-neutral-400">
              Upload a ZIP of your codebase to discover where it can run.
            </p>
          </div>

          <div className="glass p-2 sm:p-4 rounded-3xl relative shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="bg-black/80 rounded-2xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
              
              {!isAnalyzing ? (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".zip"
                    className="hidden"
                  />

                  {/* Upload State */}
                  {!file ? (
                    <div
                      className={`upload-zone relative flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl cursor-pointer ${
                        isDragging ? "drag-over" : ""
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                        <Upload className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Drop your project ZIP</h3>
                      <p className="text-sm text-neutral-500 mb-6 max-w-xs">
                        Supports Next.js, Node, Python, static sites, and more. Max 50MB.
                      </p>
                      <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-medium transition-colors">
                        Browse Files
                      </button>
                    </div>
                  ) : (
                    /* File Selected State */
                    <div className="flex flex-col items-center">
                      <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileArchive className="w-5 h-5 text-primary" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neutral-400 hover:text-white shrink-0"
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={handleAnalyze}
                        className="cta-glow w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-bold text-lg transition-all"
                      >
                        Start Analysis
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                      {error}
                    </div>
                  )}
                </>
              ) : (
                /* Analyzing State */
                <div className="py-8">
                  <div className="flex flex-col items-center justify-center text-center mb-10">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                      <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileCode2 className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Analyzing your project</h3>
                    <p className="text-sm text-neutral-400">
                      This usually takes just a few seconds
                    </p>
                  </div>

                  <div className="space-y-4">
                    {ANALYSIS_STEPS.map((step, index) => {
                      const isActive = index === currentStep;
                      const isPast = index < currentStep;
                      
                      return (
                        <div
                          key={step.key}
                          className={`flex items-center gap-4 transition-all duration-300 ${
                            isPast ? "opacity-100" : isActive ? "opacity-100" : "opacity-30"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isPast 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : isActive 
                                ? "bg-primary/20 text-primary" 
                                : "bg-white/5 text-neutral-500"
                          }`}>
                            {isPast ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : isActive ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <step.icon className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`text-sm font-medium ${
                            isPast ? "text-neutral-300" : isActive ? "text-white" : "text-neutral-500"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

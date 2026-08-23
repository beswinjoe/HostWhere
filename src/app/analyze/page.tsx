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
  ArrowRight,
  GitBranch,
  CloudUpload
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { createClient } from "@/lib/supabase/auth-client";
import { AnalysisSource } from "@/lib/analyzer/types";

const ANALYSIS_STEPS = [
  { icon: FileArchive, label: "Fetching & extracting project…", key: "extract" },
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

  const [mode, setMode] = useState<"zip" | "github">("zip");
  const [file, setFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (mode === "zip") setIsDragging(true);
  }, [mode]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (mode !== "zip") return;
    
    setError(null);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(".zip")) {
      setFile(droppedFile);
    } else {
      setError("Only .zip files are supported.");
    }
  }, [mode]);

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
    if (mode === "zip" && !file) return;
    if (mode === "github" && !githubUrl) return;

    setIsUploading(true);
    setError(null);
    setCurrentStep(0);

    let payload: AnalysisSource | null = null;
    let stepInterval: NodeJS.Timeout | undefined;

    try {
      if (mode === "zip" && file) {
        const supabase = createClient();
        // Generate random UUID using web crypto
        const uuid = crypto.randomUUID();
        // Sanitize file name for storage path (remove spaces and special chars)
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filePath = `uploads/${uuid}/${safeName}`;

        // 1. Get signed URL
        const tokenRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath })
        });
        
        if (!tokenRes.ok) {
           const errData = await tokenRes.json().catch(() => null);
           if (errData?.details) {
             throw new Error(errData.details);
           }
           throw new Error("Failed to initialize upload.");
        }
        
        const { token, path } = await tokenRes.json();

        // 2. Upload using signed URL
        const { error: uploadError } = await supabase.storage
          .from("hostwhere-uploads")
          .uploadToSignedUrl(path, token, file);

        if (uploadError) {
          throw new Error("Upload failed. Please try again.");
        }

        payload = {
          type: "storage",
          storagePath: filePath,
          projectName: file.name,
          size: file.size,
        };
      } else if (mode === "github") {
        payload = { type: "github", url: githubUrl };
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      // Animate through steps
      stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 800);

      if (!payload) {
        throw new Error("No payload generated.");
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    } catch (err: unknown) {
      if (typeof stepInterval !== 'undefined') {
        clearInterval(stepInterval);
      }
      const errorMessage = err instanceof Error ? err.message : "Network error. Please check your connection and try again.";
      setError(errorMessage);
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  }, [mode, file, githubUrl, router]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900 selection:bg-blue-100 relative overflow-hidden">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-100" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-xl hero-animate">
          
          <div className="text-center mb-10">
            <h1 className="font-display text-[48px] md:text-[64px] font-extrabold tracking-[-0.035em] mb-4 leading-tight">
              Analyze your project
            </h1>
            <p className="text-[18px] md:text-[20px] text-neutral-600 font-medium">
              Upload a ZIP or provide a public GitHub URL to discover where it can run.
            </p>
          </div>

          <div className="glass p-2 sm:p-4 rounded-3xl relative shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            
            <div className="bg-white/80 rounded-2xl p-6 sm:p-10 border border-neutral-200 relative overflow-hidden">
              
              {!isAnalyzing ? (
                <>
                  {/* Mode Toggle */}
                  <div className="flex p-1 bg-neutral-100 rounded-xl mb-8 border border-neutral-200">
                    <button
                      onClick={() => { setMode("zip"); setError(null); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        mode === "zip" 
                          ? "bg-white text-neutral-900 shadow-sm" 
                          : "text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload ZIP
                    </button>
                    <button
                      onClick={() => { setMode("github"); setError(null); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        mode === "github" 
                          ? "bg-white text-neutral-900 shadow-sm" 
                          : "text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      <GitBranch className="w-4 h-4" />
                      GitHub URL
                    </button>
                  </div>

                  {mode === "zip" ? (
                    /* ZIP UPLOAD MODE */
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".zip"
                        className="hidden"
                      />

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
                          <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-6 shadow-inner">
                            <Upload className="w-8 h-8 text-neutral-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Drop your project ZIP</h3>
                          <p className="text-[14px] md:text-[16px] text-neutral-500 mb-6 max-w-xs">
                            Supports Next.js, Node, Python, static sites, and more. Max 50MB.
                          </p>
                          <button className="px-6 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-full text-sm font-medium transition-colors text-neutral-700 shadow-sm">
                            Browse Files
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                <FileArchive className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-medium text-sm text-neutral-900 truncate">{file.name}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveFile}
                              className="p-2 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-500 hover:text-neutral-900 shrink-0"
                              aria-label="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={handleAnalyze}
                            className="cta-glow w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-full font-bold text-lg transition-all"
                          >
                            Start Analysis
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* GITHUB MODE */
                    <div className="flex flex-col items-center">
                      <div className="w-full mb-8">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Repository URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/owner/repo"
                          value={githubUrl}
                          onChange={(e) => {
                            setGithubUrl(e.target.value);
                            setError(null);
                          }}
                          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                        />
                        <p className="text-[14px] md:text-[16px] text-neutral-500 mt-3">
                          Public repositories only. Uses the `main` or `master` branch. Max 50MB archive.
                        </p>
                      </div>

                      <button
                        onClick={handleAnalyze}
                        disabled={!githubUrl}
                        className="cta-glow disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-full font-bold text-lg transition-all"
                      >
                        Start Analysis
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
                      {error}
                    </div>
                  )}
                </>
              ) : isUploading ? (
                /* Uploading State */
                <div className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CloudUpload className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Uploading project...</h3>
                    <p className="text-sm text-neutral-500">
                      Transferring to secure storage. This depends on your internet speed.
                    </p>
                  </div>
                </div>
              ) : (
                /* Analyzing State */
                <div className="py-8">
                  <div className="flex flex-col items-center justify-center text-center mb-10">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileCode2 className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Analyzing your project</h3>
                    <p className="text-sm text-neutral-500">
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
                              ? "bg-green-50 text-green-600" 
                              : isActive 
                                ? "bg-blue-100 text-blue-600" 
                                : "bg-neutral-100 text-neutral-400"
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
                            isPast ? "text-neutral-700" : isActive ? "text-neutral-900" : "text-neutral-400"
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/auth-client";
import { Navbar } from "@/components/landing/Navbar";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      setError("Username must be 3-20 characters and contain only letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    // Check if username is taken
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existingProfile) {
      setError("Username is already taken.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center px-6 mt-14 mb-14">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-extrabold tracking-tight mb-2">Create an account</h1>
            <p className="text-neutral-400">Join the HostWhere community</p>
          </div>

          <div className="glass p-8 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 relative z-10">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors text-white placeholder:text-neutral-600"
                  placeholder="cool_dev_99"
                />
                <p className="text-xs text-neutral-500 mt-1.5">This will be your public identifier.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors text-white placeholder:text-neutral-600"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors text-white placeholder:text-neutral-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cta-glow flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:hover:bg-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] arrow-hover mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up"}
                {!loading && <ArrowRight className="w-4 h-4 arrow-icon" />}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-neutral-500 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-primary transition-colors font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

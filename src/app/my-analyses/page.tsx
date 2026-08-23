import { createClient } from "@/lib/supabase/auth-server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { History, Code2, Globe, Lock, ArrowRight, CheckCircle2, FileArchive } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MyAnalysesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch analyses for this user
  const { data: analyses, error } = await supabase
    .from("user_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[My Analyses Error]", error);
  }

  const projects = analyses || [];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative flex flex-col">
      <Navbar />
      
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-20 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="flex-1 relative z-10 pt-32 pb-24 px-6 max-w-6xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            My Analyses
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">
            A history of all projects you&apos;ve analyzed on HostWhere.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="glass p-12 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No analyses yet</h3>
            <p className="text-neutral-400 mb-6 max-w-sm">
              You haven&apos;t analyzed any projects while logged in. Analyze a GitHub repository or ZIP file to see it here.
            </p>
            <Link href="/analyze">
              <button className="cta-glow flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] arrow-hover">
                Analyze a Project
                <ArrowRight className="w-4 h-4 arrow-icon" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((item) => {
              const compSummary = item.compatibility_summary || { compatible: 0, possible: 0, incompatible: 0 };
              
              return (
                <Link key={item.id} href={`/results/${item.analysis_id}`}>
                  <div className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all flex flex-col h-full group hover:bg-white/[0.04]">
                    <div className="flex-grow mb-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-xl tracking-tight truncate group-hover:text-primary transition-colors">
                          {item.project_name}
                        </h3>
                        <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                          {item.source_type === 'github' ? (
                            <Globe className="w-3.5 h-3.5 text-neutral-400" />
                          ) : (
                            <FileArchive className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            {item.source_type}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-500 font-mono truncate">
                        {item.github_url?.replace("https://github.com/", "") || item.analysis_id.substring(0, 15)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-neutral-300 font-medium flex items-center gap-1.5 border border-white/5">
                          <Code2 className="w-3 h-3" />
                          {item.framework || "unknown"}
                        </span>
                        
                        <span className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {compSummary.compatible} Compatible
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-white/5 pt-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          {item.is_public ? (
                            <span className="flex items-center gap-1 text-blue-400 font-medium">
                              <Globe className="w-3.5 h-3.5" /> Public
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-neutral-400 font-medium">
                              <Lock className="w-3.5 h-3.5" /> Private
                            </span>
                          )}
                        </div>
                        <span>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

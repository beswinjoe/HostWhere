import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, Play, MousePointerClick, TrendingUp, Settings, MessageSquare, Briefcase, UserCircle } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/auth-server";
import type { FeaturedProject } from "@/lib/featured/types";
import { FEATURED_PLANS, type PlanType } from "@/lib/featured/types";

async function getProject(id: string): Promise<FeaturedProject | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("featured_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as FeaturedProject;
}

export default async function ProjectProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const supabaseAuth = await getSupabaseServerClient();
  
  const { data: { user } } = await supabaseAuth.auth.getUser();
  const canManage = !!user && user.id === project.owner_id && (project.plan === "featured" || project.plan === "spotlight");
  const planConfig = project.plan ? FEATURED_PLANS[project.plan as PlanType] : null;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 relative overflow-hidden">
      <Navbar />
      
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-100" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <Link href="/featured" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
        </Link>

        <div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-8 md:p-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-neutral-900 mb-2">{project.project_name}</h1>
              {project.short_description && (
                <p className="text-xl text-neutral-600 mb-4">{project.short_description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <a 
                  href={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 font-mono hover:text-blue-600 flex items-center gap-2 transition-colors text-sm bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200"
                >
                  {project.repository_url.replace("https://github.com/", "")}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                
                {project.category && (
                  <span className="text-sm font-medium px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                    {project.category}
                  </span>
                )}
                
                {project.project_type && (
                  <span className="text-sm font-medium px-3 py-1.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg capitalize">
                    {project.project_type}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0 mt-2 md:mt-0">
              {canManage && (
                <Link href={`/featured/project/${project.id}/manage`}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium transition-colors text-neutral-700 shadow-sm">
                    <Settings className="w-4 h-4" /> Manage
                  </button>
                </Link>
              )}
              <Link href={`/featured/checkout?repo=${encodeURIComponent(project.repository_url)}&name=${encodeURIComponent(project.project_name)}&framework=${encodeURIComponent(project.framework)}&host=${encodeURIComponent(project.recommended_host)}&existing=true`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-xl text-sm font-bold transition-colors">
                  <TrendingUp className="w-4 h-4" /> Extend Plan
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Framework</div>
              <div className="font-semibold text-neutral-900">{project.framework}</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Host</div>
              <div className="font-semibold text-neutral-900">{project.recommended_host || "Unknown"}</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Clicks</div>
              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <MousePointerClick className="w-4 h-4 text-neutral-500" />
                {project.total_clicks}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Plan</div>
              <div className="font-semibold text-neutral-900 capitalize">{planConfig?.name || "Featured"}</div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3 border-b border-neutral-200 pb-2">About the Project</h3>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                {project.description || "No detailed description provided."}
              </p>
            </div>

            {/* Use Case */}
            {project.use_case_description && (
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-3 border-b border-neutral-200 pb-2">Use Case</h3>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                  {project.use_case_description}
                </p>
              </div>
            )}

            {/* Owner Section */}
            {(project.owner_name || project.company_name) && (
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-3 border-b border-neutral-200 pb-2">Creator</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div>
                    {project.owner_name && <p className="font-bold text-neutral-900">{project.owner_name}</p>}
                    {project.company_name && <p className="text-sm text-neutral-500">{project.company_name}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Links Section */}
            {(project.website_url || project.demo_url || project.social_links) && (
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Project Links</h3>
                <div className="flex flex-wrap gap-4">
                  {project.website_url && (
                    <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 shadow-sm rounded-lg hover:bg-neutral-50 transition-colors text-sm text-neutral-700 font-medium">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                  {project.demo_url && (
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 shadow-sm rounded-lg hover:bg-neutral-50 transition-colors text-sm text-neutral-700 font-medium">
                      <Play className="w-4 h-4" /> Live Demo
                    </a>
                  )}
                  {project.social_links && typeof project.social_links.twitter === 'string' && (
                    <a href={`https://twitter.com/${project.social_links.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 shadow-sm rounded-lg hover:bg-neutral-50 transition-colors text-sm text-neutral-700 font-medium">
                      <MessageSquare className="w-4 h-4 text-blue-400" /> Twitter
                    </a>
                  )}
                  {project.social_links && typeof project.social_links.linkedin === 'string' && (
                    <a href={project.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 shadow-sm rounded-lg hover:bg-neutral-50 transition-colors text-sm text-neutral-700 font-medium">
                      <Briefcase className="w-4 h-4 text-blue-700" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

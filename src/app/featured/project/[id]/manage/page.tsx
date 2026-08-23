"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import type { FeaturedProject } from "@/lib/featured/types";

export default function ProjectManagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<FeaturedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    website_url: "",
    demo_url: "",
    project_type: "",
    use_case_description: "",
    owner_name: "",
    company_name: "",
    short_description: "",
    category: "",
    twitter: "",
    linkedin: ""
  });

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/featured/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
          setFormData({
            website_url: data.project.website_url || "",
            demo_url: data.project.demo_url || "",
            project_type: data.project.project_type || "",
            use_case_description: data.project.use_case_description || "",
            owner_name: data.project.owner_name || "",
            company_name: data.project.company_name || "",
            short_description: data.project.short_description || "",
            category: data.project.category || "",
            twitter: data.project.social_links?.twitter || "",
            linkedin: data.project.social_links?.linkedin || ""
          });
        }
      } catch (e) {
        // Handle error quietly or redirect
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        social_links: {
          twitter: formData.twitter,
          linkedin: formData.linkedin
        }
      };

      const res = await fetch(`/api/featured/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        router.push(`/featured/project/${id}`);
      } else {
        alert("Failed to save changes.");
      }
    } catch (e) {
      alert("Error saving changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 relative overflow-hidden">
      <Navbar />
      
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-100" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-2xl mx-auto">
        <Link href={`/featured/project/${id}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Project
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
          </div>
        ) : !project ? (
          <div className="text-center py-20">
            <p className="text-neutral-600">Project not found or you don&apos;t have access.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200 shadow-sm">
            <h1 className="font-display text-3xl font-bold mb-2">Manage Project</h1>
            <p className="text-neutral-500 mb-8">Update optional metadata for {project.project_name}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Website URL</label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website_url}
                  onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Live Demo URL</label>
                <input
                  type="url"
                  placeholder="https://demo.yourwebsite.com"
                  value={formData.demo_url}
                  onChange={e => setFormData({ ...formData, demo_url: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Project Type</label>
                <input
                  type="text"
                  placeholder="e.g. SaaS, E-commerce, Portfolio, Open Source Library"
                  value={formData.project_type}
                  onChange={e => setFormData({ ...formData, project_type: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Short Description</label>
                <input
                  type="text"
                  placeholder="A one-sentence summary of your project"
                  value={formData.short_description}
                  onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Use Case / Long Description</label>
                <textarea
                  rows={4}
                  placeholder="Explain what problem your project solves..."
                  value={formData.use_case_description}
                  onChange={e => setFormData({ ...formData, use_case_description: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Creator / Owner Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.owner_name}
                    onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={formData.company_name}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Twitter Handle</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formData.twitter}
                    onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white shadow-sm font-bold rounded-xl px-6 py-4 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import type { FeaturedProject } from "@/lib/featured/types";

function isValidUrl(value: string): boolean {
  if (!value) return true; // empty is ok (optional)
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProjectManagePage() {
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<FeaturedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
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
    linkedin: "",
    github_url: "",
    discord: "",
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
            linkedin: data.project.social_links?.linkedin || "",
            github_url: data.project.social_links?.github || "",
            discord: data.project.social_links?.discord || "",
          });
        } else if (res.status === 403) {
          setErrorMessage("You don't have permission to edit this project. Only Featured and Spotlight plan owners can edit.");
        } else if (res.status === 401) {
          setErrorMessage("Please log in to manage your project.");
        }
      } catch {
        setErrorMessage("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("idle");
    setErrorMessage("");

    // Client-side URL validation
    const urlFields = [
      { key: "website_url", label: "Website URL" },
      { key: "demo_url", label: "Live Demo URL" },
      { key: "linkedin", label: "LinkedIn URL" },
      { key: "github_url", label: "GitHub URL" },
    ];
    for (const field of urlFields) {
      const value = formData[field.key as keyof typeof formData];
      if (value && !isValidUrl(value)) {
        setErrorMessage(`${field.label} is not a valid URL. Include https://.`);
        setSaveStatus("error");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        website_url: formData.website_url || null,
        demo_url: formData.demo_url || null,
        project_type: formData.project_type || null,
        use_case_description: formData.use_case_description || null,
        owner_name: formData.owner_name || null,
        company_name: formData.company_name || null,
        short_description: formData.short_description || null,
        category: formData.category || null,
        social_links: {
          twitter: formData.twitter || null,
          linkedin: formData.linkedin || null,
          github: formData.github_url || null,
          discord: formData.discord || null,
        },
      };

      const res = await fetch(`/api/featured/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        setErrorMessage(data.error || "Failed to save changes.");
        setSaveStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (saveStatus !== "idle") setSaveStatus("idle");
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
        ) : errorMessage && !project ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <p className="text-neutral-700 font-medium">{errorMessage}</p>
            <Link href={`/featured/project/${id}`} className="text-blue-600 hover:text-blue-700 text-sm mt-4 inline-block">
              Return to project page
            </Link>
          </div>
        ) : project ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200 shadow-sm">
            <h1 className="font-display text-3xl font-bold mb-2">Manage Project</h1>
            <p className="text-neutral-500 mb-8">Update optional metadata for <strong>{project.project_name}</strong></p>

            {/* Success / Error Banners */}
            {saveStatus === "success" && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                <CheckCircle className="w-5 h-5 shrink-0" />
                Changes saved successfully!
              </div>
            )}
            {saveStatus === "error" && errorMessage && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ── Basic Info ─────────────────────────────── */}
              <fieldset>
                <legend className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">Basic Info</legend>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Website URL</label>
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.website_url}
                      onChange={e => updateField("website_url", e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Live Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://demo.yourwebsite.com"
                      value={formData.demo_url}
                      onChange={e => updateField("demo_url", e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Creator / Owner Name</label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        maxLength={100}
                        value={formData.owner_name}
                        onChange={e => updateField("owner_name", e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name <span className="text-neutral-400">(optional)</span></label>
                      <input
                        type="text"
                        placeholder="Acme Corp"
                        maxLength={100}
                        value={formData.company_name}
                        onChange={e => updateField("company_name", e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Project Type</label>
                      <input
                        type="text"
                        placeholder="e.g. SaaS, E-commerce, Open Source"
                        maxLength={60}
                        value={formData.project_type}
                        onChange={e => updateField("project_type", e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Developer Tools, Marketing"
                        maxLength={60}
                        value={formData.category}
                        onChange={e => updateField("category", e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-neutral-700">Short Description</label>
                      <span className="text-xs text-neutral-400">{formData.short_description.length}/160</span>
                    </div>
                    <input
                      type="text"
                      placeholder="A one-sentence summary of your project"
                      maxLength={160}
                      value={formData.short_description}
                      onChange={e => updateField("short_description", e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-neutral-700">Use Case / Description</label>
                      <span className="text-xs text-neutral-400">{formData.use_case_description.length}/500</span>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="Explain what problem your project solves..."
                      maxLength={500}
                      value={formData.use_case_description}
                      onChange={e => updateField("use_case_description", e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </fieldset>

              {/* ── Social Links ───────────────────────────── */}
              <fieldset className="pt-6 border-t border-neutral-200">
                <legend className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">Social Links <span className="text-neutral-400 font-normal normal-case">(all optional)</span></legend>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">X / Twitter</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={formData.twitter}
                      onChange={e => updateField("twitter", e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">LinkedIn</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin}
                      onChange={e => updateField("linkedin", e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">GitHub</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={formData.github_url}
                      onChange={e => updateField("github_url", e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Discord</label>
                    <input
                      type="text"
                      placeholder="https://discord.gg/... or username"
                      value={formData.discord}
                      onChange={e => updateField("discord", e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </fieldset>

              {/* ── Submit ─────────────────────────────────── */}
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
        ) : null}
      </main>
    </div>
  );
}

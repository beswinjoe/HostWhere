"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight, LogOut, History, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/auth-client";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Featured", href: "/featured" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Platforms", href: "/#platforms" },
  { label: "Features", href: "/#features" },
  { label: "Documentation", href: "https://github.com/beswinjoe/HostWhere", external: true },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      }
      setLoadingAuth(false);
    }
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setProfile(null);
      } else {
        getUser(); // Refetch profile
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/[0.06] border border-white/[0.08]">
            <img src="/logo.png" alt="HostWhere Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-extrabold text-[19px] md:text-[22px] tracking-tight text-white">
            HostWhere
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="px-3 py-1.5 text-[13px] text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-neutral-500 border-r border-white/10 mr-1 pr-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Status
          </div>
          
          {loadingAuth ? (
            <div className="w-20 h-9 bg-white/5 rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
              >
                <UserCircle className="w-4 h-4 text-primary" />
                @{profile?.username || "user"}
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-black/90 border border-white/10 shadow-2xl backdrop-blur-xl z-50 overflow-hidden py-1">
                    <Link 
                      href="/my-analyses"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
                    >
                      <History className="w-4 h-4" />
                      My Analyses
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left border-t border-white/5"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-[13px] font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-[13px] font-medium text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}

          <Link
            href="/analyze"
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-black bg-white hover:bg-neutral-200 rounded-full transition-all duration-200 ml-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            Analyze Project
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-4.5 h-4.5 text-white" />
          ) : (
            <Menu className="w-4.5 h-4.5 text-white" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-2xl">
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            <div className="pt-3 border-t border-white/[0.06] mt-3 space-y-1">
              {!loadingAuth && user ? (
                <>
                  <Link
                    href="/my-analyses"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                  >
                    <History className="w-4 h-4" />
                    My Analyses
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out (@{profile?.username})
                  </button>
                </>
              ) : !loadingAuth && !user ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium text-neutral-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium text-white bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              ) : null}
              
              <Link
                href="/analyze"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-black bg-white hover:bg-neutral-200 rounded-xl transition-all mt-4"
              >
                Analyze Project
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

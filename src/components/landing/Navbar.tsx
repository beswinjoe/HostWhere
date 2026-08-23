"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight, LogOut, History, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/auth-client";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Featured", href: "/featured" },
  { label: "Affiliates", href: "/affiliate" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white/70 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-neutral-200">
            <img src="/logo.png" alt="HostWhere Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-extrabold text-[19px] md:text-[22px] tracking-tight text-neutral-900">
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
              className="px-3 py-1.5 text-[13px] text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-neutral-500 border-r border-neutral-200 mr-1 pr-4">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse" />
            Status
          </div>
          
          {loadingAuth ? (
            <div className="w-20 h-9 bg-neutral-100 rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
              >
                <UserCircle className="w-4 h-4 text-neutral-700" />
                @{profile?.username || "user"}
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-neutral-200 shadow-xl backdrop-blur-xl z-50 overflow-hidden py-1">
                    <Link 
                      href="/my-analyses"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors w-full text-left"
                    >
                      <History className="w-4 h-4" />
                      My Analyses
                    </Link>
                    <Link 
                      href="/affiliate/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors w-full text-left border-t border-neutral-100"
                    >
                      <UserCircle className="w-4 h-4" />
                      Affiliate Hub
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors w-full text-left border-t border-neutral-100"
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
                className="px-4 py-2 text-[13px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-[13px] font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}

          <Link
            href="/analyze"
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200 ml-2 shadow-sm"
          >
            Analyze Project
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-4.5 h-4.5 text-neutral-900" />
          ) : (
            <Menu className="w-4.5 h-4.5 text-neutral-900" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-2xl">
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            <div className="pt-3 border-t border-neutral-200 mt-3 space-y-1">
              {!loadingAuth && user ? (
                <>
                  <Link
                    href="/my-analyses"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <History className="w-4 h-4" />
                    My Analyses
                  </Link>
                  <Link
                    href="/affiliate/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    Affiliate Hub
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors w-full text-left"
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
                    className="flex-1 text-center py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              ) : null}
              
              <Link
                href="/analyze"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all mt-4"
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

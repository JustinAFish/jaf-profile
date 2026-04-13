"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarItem,
  link as linkStyles,
} from "@nextui-org/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { scrollToAboutSectionComplete } from "@/lib/homeAboutSection";
import { scrollToSkillsSectionComplete } from "@/lib/homeSkillsSection";
import { appUrl } from "@/lib/appOrigin";
import { Modal } from "@/components/Modal";
import { ContactForm } from "@/components/ContactForm";

const SECTION_NAV = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
] as const;

function sectionHref(pathname: string, hash: string) {
  return pathname === "/" ? hash : `/${hash}`;
}

function hrefToHash(href: string): string | null {
  const m = href.match(/#([^#]+)$/);
  return m ? `#${m[1]}` : null;
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [connectOpen, setConnectOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo(() => [...SECTION_NAV], []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHome || !mounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      },
    );

    const observeSections = () => {
      navItems.forEach(({ href }) => {
        const sectionId = href.replace("#", "");
        const el = document.getElementById(sectionId);
        if (el) observer.observe(el);
      });
    };

    const timer = setTimeout(observeSections, 100);

    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      const href = link?.getAttribute("href");
      if (!href) return;
      const hash = hrefToHash(href);
      if (hash) setActiveSection(hash);
    };

    document.addEventListener("click", handleNavClick);

    return () => {
      clearTimeout(timer);
      navItems.forEach(({ href }) => {
        const sectionId = href.replace("#", "");
        const el = document.getElementById(sectionId);
        if (el) observer.unobserve(el);
      });
      observer.disconnect();
      document.removeEventListener("click", handleNavClick);
    };
  }, [isHome, mounted, navItems]);

  useEffect(() => {
    if (isHome && mounted) {
      const hash = window.location.hash || "#home";
      setActiveSection(hash);
    }
  }, [isHome, mounted]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const renderSectionLink = useCallback(
    (
      extraClass: string,
      onAfterNavigate?: () => void,
      layout: "inline" | "stack" = "inline",
    ) =>
      navItems.map(({ href, label }) => {
        const fullHref = sectionHref(pathname, href);
        const isActive = isHome && activeSection === href;
        const borderClass =
          layout === "stack"
            ? isActive
              ? "border-l-2 border-primary text-primary"
              : "border-l-2 border-transparent text-foreground/85 hover:text-primary"
            : isActive
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-foreground/85 hover:text-primary";
        return (
          <a
            key={href}
            href={fullHref}
            onClick={(e) => {
              if (isHome && href === "#about") {
                e.preventDefault();
                window.history.pushState(null, "", "#about");
                setActiveSection("#about");
                scrollToAboutSectionComplete({ behavior: "smooth" });
                onAfterNavigate?.();
                return;
              }
              if (isHome && href === "#skills") {
                e.preventDefault();
                window.history.pushState(null, "", "#skills");
                setActiveSection("#skills");
                scrollToSkillsSectionComplete({ behavior: "smooth" });
                onAfterNavigate?.();
                return;
              }
              if (isHome) setActiveSection(href);
              onAfterNavigate?.();
            }}
            className={`shrink-0 text-sm font-heading uppercase tracking-widest transition-colors ${
              layout === "stack"
                ? "block w-full py-3 pl-3 -ml-0.5 text-left whitespace-normal"
                : "pb-1 whitespace-nowrap"
            } ${borderClass} ${extraClass}`}
          >
            {label}
          </a>
        );
      }),
    [activeSection, isHome, navItems, pathname],
  );

  const cvActive = pathname === "/" || pathname === "";
  const chatActive = pathname === "/chat" || pathname.startsWith("/chat");

  const leftCluster = (
    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
      <NextLink
        href="/"
        className="text-base sm:text-xl font-heading font-bold tracking-tighter text-primary shrink-0"
      >
        JUSTIN FISH
      </NextLink>
      <ul className="flex gap-4 sm:gap-7 items-center">
        <NavbarItem className="data-[active=true]:opacity-100">
          <NextLink
            className={linkStyles({ color: "foreground" })}
            color="foreground"
            href="/"
          >
            <span
              className={`text-label-md uppercase tracking-wider transition-colors duration-200 flex items-center gap-2 ${
                cvActive
                  ? "text-primary font-medium"
                  : "text-foreground/90 hover:text-primary-dim"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M6 3h12l4 6-10 13L2 9Z" />
                <path d="M11 3 8 9l4 13 4-13-3-6" />
                <path d="M2 9h20" />
              </svg>
              <span className="hidden sm:inline">CV</span>
            </span>
          </NextLink>
        </NavbarItem>
        <NavbarItem>
          <NextLink
            className={linkStyles({ color: "foreground" })}
            color="foreground"
            href="/chat"
          >
            <span
              className={`text-label-md uppercase tracking-wider transition-colors duration-200 flex items-center gap-2 ${
                chatActive
                  ? "text-primary font-medium"
                  : "text-foreground/90 hover:text-primary-dim"
              }`}
            >
              <svg
                fill="currentColor"
                width="25"
                height="25"
                viewBox="0 0 56 56"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 shrink-0"
              >
                <path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z" />
              </svg>
              <span className="hidden sm:inline">Chat</span>
            </span>
          </NextLink>
        </NavbarItem>
      </ul>
    </div>
  );

  const rightCluster = (
    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
      <a
        href="/data/Justin_Fish_CV_2025.pdf"
        download="Justin_Fish_CV_2025.pdf"
        className="p-2 rounded-full text-foreground/90 hover:text-primary hover:bg-surface-container-high/60 transition-colors duration-200 flex items-center gap-1 sm:gap-2"
        title="Download CV"
      >
        <svg
          className="w-5 h-5 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
        </svg>
        <span className="text-label-md uppercase tracking-wide hidden xl:inline">
          Download CV
        </span>
      </a>
      <button
        type="button"
        onClick={() => setConnectOpen(true)}
        className="px-2.5 sm:px-5 py-2 rounded-md bg-primary text-on-primary font-heading font-bold text-xs sm:text-sm uppercase tracking-wide hover:shadow-[0_0_15px_rgba(129,236,255,0.35)] transition-all active:scale-95"
      >
        Connect
      </button>
      <div className="flex items-center pl-0.5 sm:pl-1">
        <AuthStatus />
      </div>
    </div>
  );

  return (
    <>
      <NextUINavbar
        maxWidth="full"
        position="sticky"
        isBordered={false}
        className="fixed glass-surface top-0 left-0 right-0 z-50 border-b-0 shadow-[0_0_20px_rgba(129,236,255,0.08)]"
      >
        <NavbarContent className="flex flex-col gap-2 w-full max-w-full py-2 px-3 sm:px-6">
          {/* xl and up: full desktop row; below xl: hamburger */}
          <div className="hidden xl:grid xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center xl:gap-4 2xl:gap-8 w-full">
            {leftCluster}
            {isHome ? (
              <nav
                className="flex justify-center items-center gap-6 xl:gap-8 flex-wrap"
                aria-label="Section navigation"
              >
                {renderSectionLink("")}
              </nav>
            ) : (
              <div aria-hidden className="min-w-0" />
            )}
            {rightCluster}
          </div>

          {/* Below xl: brand + hamburger */}
          <div className="xl:hidden flex items-center justify-between gap-3 w-full min-w-0">
            <NextLink
              href="/"
              className="text-base sm:text-lg font-heading font-bold tracking-tighter text-primary shrink-0 min-w-0 truncate"
            >
              JUSTIN FISH
            </NextLink>
            <button
              type="button"
              id="mobile-nav-toggle"
              className="shrink-0 p-2 rounded-md text-foreground hover:bg-surface-container-high/60 transition-colors"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? (
                <X className="w-6 h-6" strokeWidth={2} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={2} />
              )}
            </button>
          </div>
        </NavbarContent>
      </NextUINavbar>

      {/* Slide-over: below xl viewports */}
      <div
        className={`xl:hidden fixed inset-0 z-[70] ${
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileNavOpen}
      >
        <div
          role="presentation"
          className={`absolute inset-0 bg-surface/80 backdrop-blur-sm transition-opacity duration-200 ${
            mobileNavOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileNavOpen(false)}
        />
        <aside
          id="mobile-nav-drawer"
          className={`absolute top-0 right-0 h-full w-[min(100vw,20rem)] glass-surface border-l border-outline/30 shadow-[0_0_24px_rgba(129,236,255,0.12)] flex flex-col pt-[max(env(safe-area-inset-top),0.75rem)] pb-6 px-4 overflow-y-auto transition-transform duration-200 ease-out ${
            mobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-outline/20 mb-4">
            <span className="text-sm font-heading font-bold uppercase tracking-wider text-foreground/70">
              Menu
            </span>
            <button
              type="button"
              className="p-2 rounded-md text-foreground hover:bg-surface-container-high/60 transition-colors"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {isHome && (
            <nav
              className="flex flex-col gap-0 border-b border-outline/20 pb-4 mb-4"
              aria-label="Section navigation"
            >
              {renderSectionLink("", () => setMobileNavOpen(false), "stack")}
            </nav>
          )}

          <div className="flex flex-col gap-2 border-b border-outline/20 pb-4 mb-4">
            <NextLink
              href="/"
              className={`flex items-center gap-3 py-3 px-1 rounded-md text-label-md uppercase tracking-wider transition-colors ${
                cvActive
                  ? "text-primary font-medium bg-primary/10"
                  : "text-foreground/90 hover:text-primary-dim hover:bg-surface-container-high/40"
              }`}
              onClick={() => setMobileNavOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M6 3h12l4 6-10 13L2 9Z" />
                <path d="M11 3 8 9l4 13 4-13-3-6" />
                <path d="M2 9h20" />
              </svg>
              CV
            </NextLink>
            <NextLink
              href="/chat"
              className={`flex items-center gap-3 py-3 px-1 rounded-md text-label-md uppercase tracking-wider transition-colors ${
                chatActive
                  ? "text-primary font-medium bg-primary/10"
                  : "text-foreground/90 hover:text-primary-dim hover:bg-surface-container-high/40"
              }`}
              onClick={() => setMobileNavOpen(false)}
            >
              <svg
                fill="currentColor"
                width="25"
                height="25"
                viewBox="0 0 56 56"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 shrink-0"
              >
                <path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z" />
              </svg>
              Chat
            </NextLink>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                setConnectOpen(true);
              }}
              className="w-full py-3 rounded-md bg-primary text-on-primary font-heading font-bold text-sm uppercase tracking-wide hover:shadow-[0_0_15px_rgba(129,236,255,0.35)] transition-all active:scale-[0.98]"
            >
              Connect
            </button>
            <a
              href="/data/Justin_Fish_CV_2025.pdf"
              download="Justin_Fish_CV_2025.pdf"
              className="flex items-center gap-3 py-2 px-1 rounded-md text-foreground/90 hover:text-primary hover:bg-surface-container-high/40 transition-colors"
              onClick={() => setMobileNavOpen(false)}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <span className="text-label-md uppercase tracking-wide">
                Download CV
              </span>
            </a>
            <a
              href={pathname === "/chat" ? "/#contact" : "#contact"}
              className="flex items-center gap-3 py-2 px-1 rounded-md text-foreground/90 hover:text-primary hover:bg-surface-container-high/40 transition-colors"
              onClick={() => setMobileNavOpen(false)}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span className="text-label-md uppercase tracking-wide">
                Contact Me
              </span>
            </a>
            <div
              className="flex items-center justify-between gap-3 pt-2 border-t border-outline/20"
              onClick={() => setMobileNavOpen(false)}
            >
              <AuthStatus />
            </div>
          </div>
        </aside>
      </div>

      <Modal isOpen={connectOpen} onClose={() => setConnectOpen(false)}>
        <div className="pr-8">
          <h2 className="text-2xl font-heading font-bold text-header mb-1">
            Connect
          </h2>
          <p className="text-paragraph text-sm mb-4">
            Send a message — I&apos;ll get back to you by email.
          </p>
          <ContactForm
            compact
            onSuccess={() => {
              setTimeout(() => setConnectOpen(false), 1500);
            }}
          />
        </div>
      </Modal>
    </>
  );
}

function AuthStatus() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (mounted) {
          setUsername(user?.email ?? user?.id ?? null);
        }
      } catch {
        if (mounted) setUsername(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (username) {
    return (
      <button
        type="button"
        className="text-label-md uppercase tracking-wide text-foreground/90 hover:text-primary-dim px-1"
        onClick={async () => {
          try {
            const { createClient } = await import("@/lib/supabase/client");
            await createClient().auth.signOut();
          } catch {
            /* ignore */
          }
          window.location.href = appUrl("/");
        }}
      >
        Sign out
      </button>
    );
  }

  return (
    <NextLink
      href="/chat/sign-in"
      className="text-label-md uppercase tracking-wide text-foreground/90 hover:text-primary-dim px-1"
    >
      Sign in
    </NextLink>
  );
}

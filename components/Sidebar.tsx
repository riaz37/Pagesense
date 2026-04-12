"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchStats, type Stats } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";
import { useLatency } from "@/components/LatencyProvider";

const navItems = [
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    href: "/upload",
    label: "Upload",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
];

function ToggleSwitch({ on, onToggle, label, icon }: {
  on: boolean;
  onToggle: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${label}: ${on ? "on" : "off"}`}
      onClick={onToggle}
      className="flex items-center gap-3 w-full min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-[var(--sidebar-text-dim)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-active-text)]"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <div
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
          on ? "bg-[var(--ember-500)]" : "bg-[var(--sidebar-toggle-bg)]"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${
            on
              ? "translate-x-[18px] bg-white"
              : "translate-x-0.5 bg-[var(--sidebar-toggle-knob)]"
          }`}
        />
      </div>
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { showLatency, toggleLatency } = useLatency();
  const [stats, setStats] = useState<Stats | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden fixed top-3 left-3 z-50 w-11 h-11 flex items-center justify-center rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-active-text)]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          {mobileOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </>
          )}
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 h-full w-[var(--sidebar-width)] max-w-[85vw] bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col z-40 transition-transform duration-200 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
      {/* Logo area */}
      <div className="px-5 py-5 border-b border-[var(--sidebar-divider)]">
        <Link href="/" className="group block">
          <div className="flex items-center gap-3">
            <img
              src={theme === "dark" ? "/esap_logo_white.png" : "/esap_logo_black.png"}
              alt="ESAP"
              className="h-8 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-[10px] text-[var(--sidebar-logo-sub)] tracking-wider uppercase mt-1.5">
            Document Intelligence
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-active-text)] ${
                isActive
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] border border-[var(--sidebar-active-border)]"
                  : "text-[var(--sidebar-text-dim)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] border border-transparent"
              }`}
            >
              <span className={isActive ? "text-[var(--sidebar-active-text)]" : ""}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings toggles */}
      <div className="px-3 pb-2 space-y-0.5">
        <ToggleSwitch
          on={theme === "dark"}
          onToggle={toggle}
          label="Dark mode"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          }
        />
        <ToggleSwitch
          on={showLatency}
          onToggle={toggleLatency}
          label="Latency"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
              <path d="M10 2h4" />
              <path d="M12 2v2" />
            </svg>
          }
        />
      </div>

      {/* Stats */}
      <div className="px-4 py-4 border-t border-[var(--sidebar-divider)] geo-pattern">
        {stats ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[var(--sidebar-text-muted)]">
                Indexed
              </span>
              <span className="text-sm font-semibold text-[var(--sidebar-text)]">
                {stats.total_documents}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(stats.document_types)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([type, count]) => (
                  <span
                    key={type}
                    className={`text-xs px-2 py-0.5 rounded badge-${type}`}
                  >
                    {count} {type.replace(/_/g, " ")}
                  </span>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-3 w-32" />
          </div>
        )}
      </div>
      </aside>
    </>
  );
}

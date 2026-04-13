"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconMessages, IconFileStack, IconCloudUpload } from "@tabler/icons-react";
import { Link, usePathname } from "@/lib/i18n/navigation";

type NavKey = "chat" | "documents" | "upload";

interface NavItem {
  key: NavKey;
  href: "/chat" | "/documents" | "/upload";
  icon: React.ReactNode;
}

const ICON_PROPS = { size: 18, stroke: 1.5 } as const;

const NAV_ITEMS: NavItem[] = [
  {
    key: "chat",
    href: "/chat",
    icon: <IconMessages {...ICON_PROPS} />,
  },
  {
    key: "documents",
    href: "/documents",
    icon: <IconFileStack {...ICON_PROPS} />,
  },
  {
    key: "upload",
    href: "/upload",
    icon: <IconCloudUpload {...ICON_PROPS} />,
  },
];

const COLLAPSE_KEY = "esap-sidebar-collapsed";

function ChevronIcon({ collapsed, rtl }: { collapsed: boolean; rtl: boolean }) {
  const pointsCollapsed = rtl ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6";
  const pointsExpanded = rtl ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={collapsed ? pointsCollapsed : pointsExpanded} />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("shell");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-current",
      collapsed ? "var(--sidebar-rail)" : "var(--sidebar-width)",
    );
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  const rtl = locale === "ar";
  const widthVar = collapsed ? "var(--sidebar-rail)" : "var(--sidebar-width)";

  return (
    <>
      <button
        type="button"
        aria-label={mobileOpen ? t("sidebar.closeMenu") : t("sidebar.openMenu")}
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden fixed top-2.5 start-3 z-50 w-10 h-10 flex items-center justify-center rounded-lg border border-[color:var(--sidebar-border)] bg-[color:var(--sidebar-bg)] text-[color:var(--sidebar-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          {mobileOpen ? (
            <path d="M18 6 6 18M6 6l12 12" />
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
        aria-label={t("brand.name")}
        aria-hidden={!isDesktop && !mobileOpen}
        style={{
          width: widthVar,
          transform: isDesktop || mobileOpen ? "translateX(0)" : rtl ? "translateX(100%)" : "translateX(-100%)",
        }}
        className="fixed top-0 start-0 h-full max-w-[85vw] bg-[color:var(--sidebar-bg)] border-e border-[color:var(--sidebar-border)] flex flex-col z-40 transition-[width,transform] duration-200 ease-out"
      >
        <div className="flex items-center gap-2 px-3 h-12 border-b border-[color:var(--sidebar-divider)]">
          <Link href="/" className="flex items-center gap-2 min-w-0 flex-1" aria-label={t("brand.name")}>
            <img
              src="/esap_logo_white.png"
              alt={t("brand.name")}
              className="h-9 w-auto object-contain shrink-0 hidden dark:block"
            />
            <img
              src="/esap_logo_black.png"
              alt=""
              aria-hidden
              className="h-9 w-auto object-contain shrink-0 block dark:hidden"
            />
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            aria-pressed={collapsed}
            className="hidden md:flex shrink-0 w-7 h-7 items-center justify-center rounded-md text-[color:var(--sidebar-text-muted)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--sidebar-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
          >
            <ChevronIcon collapsed={collapsed} rtl={rtl} />
          </button>
        </div>

        <nav className="px-2 pt-2" aria-label={t("nav.chat")}>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              const label = t(`nav.${item.key}`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? label : undefined}
                    data-active={active ? "true" : undefined}
                    className={`group relative flex items-center gap-2 min-h-[36px] rounded-md text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] ${
                      collapsed ? "justify-center px-0" : "px-2"
                    } ${
                      active
                        ? "bg-[color:var(--sidebar-active-bg)] text-[color:var(--sidebar-active-text)]"
                        : "text-[color:var(--sidebar-text-dim)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--sidebar-text)]"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="flex-1 truncate">{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex-1 overflow-y-auto" />

        <div className="border-t border-[color:var(--sidebar-divider)] p-2">
          <button
            type="button"
            aria-label={t("user.menu")}
            className={`flex items-center gap-2 w-full rounded-md p-1.5 text-[13px] text-[color:var(--sidebar-text)] hover:bg-[color:var(--sidebar-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className="w-8 h-8 rounded-full bg-[color:var(--sidebar-active-bg)] text-[color:var(--sidebar-active-text)] flex items-center justify-center text-[13px] font-semibold shrink-0"
            >
              E
            </span>
            {!collapsed && <span className="truncate">{t("user.menu")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

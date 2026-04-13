"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { LanguageToggle, TopBar } from "@/components/ui";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ShellTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as "en" | "ar";
  const { theme, toggle } = useTheme();
  const t = useTranslations("shell");

  const handleLang = (next: "en" | "ar") => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <TopBar
      className="sticky top-0 z-20 ps-14 md:ps-4"
      breadcrumb={null}
      actions={
        <>
          <LanguageToggle value={locale} onValueChange={handleLang} aria-label={t("language.toggle")} />
          <button
            type="button"
            onClick={toggle}
            aria-label={t("theme.toggle")}
            aria-pressed={theme === "dark"}
            className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </>
      }
    />
  );
}

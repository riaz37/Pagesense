"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { LanguageToggle, TopBar } from "@/components/ui";

export default function ShellTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as "en" | "ar";
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
        <LanguageToggle value={locale} onValueChange={handleLang} aria-label={t("language.toggle")} />
      }
    />
  );
}

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import Sidebar from "@/components/Sidebar";
import en from "../../messages/en/shell.json";

vi.mock("@/lib/i18n/navigation", () => {
  const React = require("react");
  return {
    Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={href} {...rest}>
        {children}
      </a>
    ),
    usePathname: () => "/chat",
  };
});

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", toggle: () => {} }),
}));

function renderWithIntl(locale: "en" | "ar" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={{ shell: en }}>
      <Sidebar />
    </NextIntlClientProvider>,
  );
}

describe("Sidebar (shell)", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    const ls = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size;
      },
    };
    Object.defineProperty(window, "localStorage", { value: ls, configurable: true });
    document.documentElement.removeAttribute("style");
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("marks active nav item with aria-current=page", () => {
    renderWithIntl();
    const chat = screen.getByRole("link", { name: /chat/i });
    expect(chat).toHaveAttribute("aria-current", "page");
  });

  it("active item carries data-active for token-based styling", () => {
    renderWithIntl();
    const chat = screen.getByRole("link", { name: /chat/i });
    expect(chat).toHaveAttribute("data-active", "true");
  });

  it("collapse toggle persists to localStorage and updates CSS var", async () => {
    renderWithIntl();
    const user = userEvent.setup();
    const toggle = screen.getByRole("button", { name: /collapse sidebar/i });
    await user.click(toggle);
    expect(window.localStorage.getItem("esap-sidebar-collapsed")).toBe("1");
    expect(document.documentElement.style.getPropertyValue("--sidebar-current")).toContain("rail");
  });

  it("renders Projects + History section labels", () => {
    renderWithIntl();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });
});

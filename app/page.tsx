"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Intersection Observer hook for scroll-triggered reveals ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    // Safety fallback: if observer hasn't fired within 1.5s, force-reveal
    // so content is never permanently hidden if IO misbehaves.
    const fallback = window.setTimeout(() => setVisible(true), 1500);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [threshold]);
  return { ref, visible };
}

/* ─── Floating Arabic document cards for the hero ─── */
const floatingDocs = [
  { label: "فاتورة", sub: "Invoice", rotate: "-6deg", x: "8%", y: "18%", delay: "0s" },
  { label: "عرض سعر", sub: "Quotation", rotate: "4deg", x: "78%", y: "12%", delay: "0.6s" },
  { label: "أمر شراء", sub: "Purchase Order", rotate: "-3deg", x: "4%", y: "62%", delay: "1.2s" },
  { label: "إيصال", sub: "Receipt", rotate: "7deg", x: "82%", y: "58%", delay: "0.3s" },
  { label: "عقد", sub: "Contract", rotate: "-5deg", x: "70%", y: "82%", delay: "0.9s" },
  { label: "نموذج", sub: "Form", rotate: "3deg", x: "18%", y: "80%", delay: "1.5s" },
];

/* ─── Problem cards data ─── */
const problems = [
  {
    title: "Handwritten Invoices",
    titleAr: "فواتير بخط اليد",
    desc: "Scribbled numbers and Arabic calligraphy that OCR can't parse",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    title: "WhatsApp Photos",
    titleAr: "صور واتساب",
    desc: "Blurry phone photos of receipts sent in chat messages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
  {
    title: "Scanned PDFs",
    titleAr: "ملفات مسحوبة",
    desc: "Low-resolution scans with stamps, watermarks, and noise",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path d="M12 3v6h6" />
      </svg>
    ),
  },
  {
    title: "Mixed AR / EN",
    titleAr: "عربي وإنجليزي",
    desc: "Documents mixing Arabic and English with inconsistent direction",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    title: "Inconsistent Formats",
    titleAr: "تنسيقات مختلفة",
    desc: "Every supplier uses different layouts, tables, and structures",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    title: "Multi-page Contracts",
    titleAr: "عقود متعددة الصفحات",
    desc: "Long documents spanning pages with tables, terms, and signatures",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <path d="M9 14h6M9 18h6M9 10h6" />
      </svg>
    ),
  },
];

/* ─── Pipeline steps ─── */
const pipelineSteps = [
  {
    num: "01",
    title: "Upload",
    titleAr: "رفع",
    desc: "Drop any Arabic document — PDF, photo, scan. We handle the chaos.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Extract",
    titleAr: "استخراج",
    desc: "ESAP's extraction engine reads every character, stamp, and annotation with human-level accuracy.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Structure",
    titleAr: "هيكلة",
    desc: "Validated JSON: issuer, recipient, line items, totals, dates — bilingual and normalized.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M4 7V4h16v3M9 20h6M12 4v16" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Query",
    titleAr: "استعلام",
    desc: "Ask in Arabic or English — get cited answers from your document corpus instantly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

/* ─── Features grid ─── */
const features = [
  {
    title: "Intelligent Extraction",
    desc: "Our extraction engine reads documents like a human — handwriting, stamps, logos, tables.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Deep Analysis",
    desc: "Multi-pass reasoning for Arabic character disambiguation — ث vs ش, ب vs ت, correctly every time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Hybrid Search",
    desc: "Multi-signal retrieval combining semantic understanding and keyword matching for maximum recall.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: "Bilingual",
    desc: "Ask in Arabic or English, search across both. Answers reference the original language.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" />
      </svg>
    ),
  },
  {
    title: "Structured Output",
    desc: "Clean JSON for every document: parties, line items, totals, dates, terms, and notes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: "Live Processing",
    desc: "Upload any document and watch it get extracted, structured, and indexed with live progress.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const problemReveal = useReveal();
  const pipelineReveal = useReveal();
  const featuresReveal = useReveal();
  const statsReveal = useReveal();
  const ctaReveal = useReveal();

  return (
    <div
      className="landing min-h-screen text-[var(--lp-text)] overflow-x-hidden"
      style={{ background: "#060b06", color: "#e8f5e8" }}
    >
      {/* ══════ NOISE TEXTURE OVERLAY ══════ */}
      <div
        className="fixed inset-0 pointer-events-none z-[5] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* ══════ NAVIGATION ══════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl border-b border-[var(--lp-border)]"
            : ""
        }`}
        style={{
          backgroundColor: scrolled ? "rgba(6, 11, 6, 0.85)" : "transparent",
        }}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/esap_logo_white.png"
              alt="ESAP"
              className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Center links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Problem", id: "problem" },
              { label: "How It Works", id: "pipeline" },
              { label: "Features", id: "features" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="inline-flex items-center min-h-[44px] text-sm text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/chat"
            className="relative inline-flex items-center justify-center min-h-[44px] px-5 py-2 text-sm font-semibold rounded-lg bg-[var(--lp-green-500)] text-[#060b06] hover:bg-[var(--lp-green-400)] transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
          >
            Try the RAG Demo
          </Link>
        </nav>
      </header>

      {/* ══════ HERO SECTION ══════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full animate-glow-pulse"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.02) 40%, transparent 70%)",
          }}
        />

        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--lp-green-500) 1px, transparent 1px), linear-gradient(90deg, var(--lp-green-500) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating doc cards */}
        {floatingDocs.map((doc, i) => (
          <div
            key={i}
            className="absolute hidden lg:block animate-float pointer-events-none"
            style={{
              left: doc.x,
              top: doc.y,
              animationDelay: doc.delay,
              animationDuration: `${4 + i * 0.5}s`,
              ["--float-rotate" as string]: doc.rotate,
            }}
          >
            <div
              className="px-4 py-3 rounded-lg border border-[var(--lp-border)] backdrop-blur-sm"
              style={{ transform: `rotate(${doc.rotate})`, backgroundColor: "rgba(13, 26, 13, 0.8)" }}
            >
              {/* Scan-line overlay */}
              <div className="absolute inset-0 overflow-hidden rounded-lg opacity-20 pointer-events-none">
                <div
                  className="absolute inset-0 w-full h-4"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, var(--lp-green-500), transparent)",
                    animation: `scan-line ${3 + i}s linear infinite`,
                    animationDelay: `${i * 0.7}s`,
                  }}
                />
              </div>
              <p
                className="text-base font-semibold text-[var(--lp-green-400)]"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {doc.label}
              </p>
              <p className="text-[10px] text-[var(--lp-text-muted)] mt-0.5 uppercase tracking-wider">
                {doc.sub}
              </p>
            </div>
          </div>
        ))}

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--lp-border)] bg-[var(--lp-bg-card)] text-xs text-[var(--lp-text-secondary)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lp-green-500)] animate-pulse" />
            Powered by ESAP AI
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            From Messy Arabic Documents
            <br />
            to{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--lp-green-400), var(--lp-green-500), #86efac)",
              }}
            >
              Intelligent Data
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--lp-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload invoices, quotations, and contracts in Arabic. Our engine extracts,
            structures, and indexes them for{" "}
            <span className="text-[var(--lp-text)]">instant retrieval</span> and{" "}
            <span className="text-[var(--lp-text)]">cited answers</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="group relative px-8 py-3.5 text-base font-semibold rounded-xl bg-[var(--lp-green-500)] text-[#060b06] hover:bg-[var(--lp-green-400)] transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)]"
            >
              <span className="flex items-center gap-2">
                Try the RAG Demo
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <button
              onClick={() =>
                document
                  .getElementById("pipeline")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-3.5 text-base font-medium rounded-xl border border-[var(--lp-border)] text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] hover:border-[var(--lp-green-500)]/40 hover:bg-[var(--lp-green-glow)] transition-all duration-300"
            >
              See How It Works
            </button>
          </div>

          {/* Decorative JSON snippet */}
          <div className="mt-16 mx-auto max-w-md">
            <div className="rounded-xl border border-[var(--lp-border)] bg-[var(--lp-bg-card)]/60 backdrop-blur-sm p-4 text-left overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--lp-green-500)]/40 to-transparent" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-green-500)]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-text-muted)]/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-text-muted)]/30" />
                <span
                  className="ml-2 text-[10px] text-[var(--lp-text-muted)]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  output.json
                </span>
              </div>
              <pre
                className="text-xs leading-relaxed text-[var(--lp-text-muted)]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span className="text-[var(--lp-text-secondary)]">{"{"}</span>
                {"\n"}
                {"  "}<span className="text-[var(--lp-green-400)]">&quot;type&quot;</span>:{" "}
                <span className="text-[#86efac]">&quot;quotation&quot;</span>,{"\n"}
                {"  "}<span className="text-[var(--lp-green-400)]">&quot;issuer&quot;</span>:{" "}
                <span className="text-[#86efac]" style={{ fontFamily: "'IBM Plex Sans Arabic', monospace" }}>
                  &quot;شركة الطاقات المثمرة&quot;
                </span>
                ,{"\n"}
                {"  "}<span className="text-[var(--lp-green-400)]">&quot;total&quot;</span>:{" "}
                <span className="text-[#fbbf24]">10078.31</span>,{"\n"}
                {"  "}<span className="text-[var(--lp-green-400)]">&quot;currency&quot;</span>:{" "}
                <span className="text-[#86efac]">&quot;SAR&quot;</span>{"\n"}
                <span className="text-[var(--lp-text-secondary)]">{"}"}</span>
              </pre>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--lp-bg)] to-transparent" />
      </section>

      {/* ══════ PROBLEM SECTION ══════ */}
      <section id="problem" className="relative py-24 md:py-32 px-6">
        <div ref={problemReveal.ref} className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              problemReveal.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--lp-green-500)] mb-4 font-medium">
              The Challenge
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Real-world Arabic documents
              <br />
              <span className="text-[var(--lp-text-muted)]">are chaos</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p, i) => (
              <div
                key={i}
                className={`group relative rounded-xl border border-[var(--lp-border)] bg-[var(--lp-bg-card)] p-6 transition-all duration-500 hover:border-[var(--lp-green-500)]/40 hover:bg-[var(--lp-bg-card-hover)] ${
                  problemReveal.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: problemReveal.visible ? `${150 + i * 80}ms` : "0ms",
                }}
              >
                {/* Scanner line on hover */}
                <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div
                    className="absolute w-full h-8"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(34,197,94,0.06), transparent)",
                      animation: "scan-line 2.5s linear infinite",
                    }}
                  />
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--lp-green-glow)] border border-[var(--lp-green-500)]/20 flex items-center justify-center text-[var(--lp-green-400)] group-hover:bg-[var(--lp-green-glow-strong)] transition-colors">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--lp-text)] mb-0.5">{p.title}</h3>
                    <p
                      className="text-xs text-[var(--lp-green-500)]/60 mb-2"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {p.titleAr}
                    </p>
                    <p className="text-sm text-[var(--lp-text-secondary)] leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PIPELINE SECTION ══════ */}
      <section id="pipeline" className="relative py-24 md:py-32 px-6">
        {/* Subtle section divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[var(--lp-green-500)]/30 to-transparent" />

        <div ref={pipelineReveal.ref} className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-20 transition-all duration-700 ${
              pipelineReveal.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--lp-green-500)] mb-4 font-medium">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              From chaos to clarity
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--lp-green-400), var(--lp-green-500))",
                }}
              >
                in 4 steps
              </span>
            </h2>
          </div>

          {/* Pipeline — horizontal on desktop, vertical on mobile */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[52px] left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px">
              <div
                className={`h-full transition-all duration-1000 delay-300 ${
                  pipelineReveal.visible ? "bg-gradient-to-r from-[var(--lp-green-500)]/60 via-[var(--lp-green-500)]/30 to-[var(--lp-green-500)]/60 scale-x-100" : "scale-x-0"
                }`}
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, var(--lp-green-500) 0, var(--lp-green-500) 8px, transparent 8px, transparent 16px)",
                  opacity: 0.4,
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
              {pipelineSteps.map((step, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col items-center text-center transition-all duration-700 ${
                    pipelineReveal.visible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{
                    transitionDelay: pipelineReveal.visible ? `${300 + i * 150}ms` : "0ms",
                  }}
                >
                  {/* Step number + icon */}
                  <div className="relative mb-5">
                    <div className="w-[56px] h-[56px] rounded-2xl bg-[var(--lp-bg-card)] border border-[var(--lp-border)] flex items-center justify-center text-[var(--lp-green-400)]">
                      {step.icon}
                    </div>
                    <div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-md bg-[var(--lp-green-500)] text-[#060b06] flex items-center justify-center text-[10px] font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {step.num}
                    </div>
                  </div>

                  {/* Mobile connecting line */}
                  {i < pipelineSteps.length - 1 && (
                    <div className="md:hidden w-px h-8 -my-1 bg-gradient-to-b from-[var(--lp-green-500)]/30 to-transparent" />
                  )}

                  <h3 className="text-lg font-semibold text-[var(--lp-text)] mb-1">
                    {step.title}
                  </h3>
                  <p
                    className="text-xs text-[var(--lp-green-500)]/50 mb-2"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {step.titleAr}
                  </p>
                  <p className="text-sm text-[var(--lp-text-secondary)] leading-relaxed max-w-[240px]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURES SECTION ══════ */}
      <section id="features" className="relative py-24 md:py-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[var(--lp-green-500)]/30 to-transparent" />

        <div ref={featuresReveal.ref} className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              featuresReveal.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--lp-green-500)] mb-4 font-medium">
              Capabilities
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Built for Arabic
              <br />
              <span className="text-[var(--lp-text-secondary)]">document intelligence</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className={`group relative rounded-xl border border-[var(--lp-border)] bg-[var(--lp-bg-card)] p-6 transition-all duration-500 hover:border-[var(--lp-green-500)]/30 ${
                  featuresReveal.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: featuresReveal.visible ? `${150 + i * 80}ms` : "0ms",
                }}
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-6 bottom-6 w-px bg-[var(--lp-green-500)]/0 group-hover:bg-[var(--lp-green-500)]/40 transition-colors duration-300" />

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--lp-green-glow)] border border-[var(--lp-green-500)]/15 flex items-center justify-center text-[var(--lp-green-400)]">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-[var(--lp-text)]">{f.title}</h3>
                </div>
                <p className="text-sm text-[var(--lp-text-secondary)] leading-relaxed pl-11">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ STATS SECTION ══════ */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[var(--lp-green-500)]/30 to-transparent" />

        <div
          ref={statsReveal.ref}
          className="max-w-4xl mx-auto"
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 transition-all duration-700 ${
              statsReveal.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {[
              { value: "8+", label: "Document Types", sub: "invoices, quotations, POs, receipts, contracts...", mono: true },
              { value: "AR + EN", label: "Bilingual", sub: "ask in either language, search across both", mono: false },
              { value: "Instant", label: "Cited Answers", sub: "ask a question, get sourced answers in seconds", mono: false },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center transition-all duration-500"
                style={{
                  transitionDelay: statsReveal.visible ? `${200 + i * 150}ms` : "0ms",
                }}
              >
                <div
                  className="text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--lp-green-400), var(--lp-green-500), #86efac)",
                    fontFamily: stat.mono ? "'JetBrains Mono', monospace" : "'DM Sans', sans-serif",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-[var(--lp-text)] mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-[var(--lp-text-muted)]">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[var(--lp-green-500)]/30 to-transparent" />

        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(34,197,94,0.06) 0%, transparent 60%)",
          }}
        />

        <div
          ref={ctaReveal.ref}
          className={`relative max-w-3xl mx-auto text-center transition-all duration-700 ${
            ctaReveal.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to try
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--lp-green-400), var(--lp-green-500))",
              }}
            >
              Arabic document intelligence
            </span>
            ?
          </h2>
          <p className="text-lg text-[var(--lp-text-secondary)] mb-10 max-w-xl mx-auto">
            Upload your documents and start querying in seconds.
            No setup required — just ask.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="group px-10 py-4 text-base font-semibold rounded-xl bg-[var(--lp-green-500)] text-[#060b06] hover:bg-[var(--lp-green-400)] transition-all duration-300 shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.5)]"
            >
              <span className="flex items-center gap-2">
                Try the RAG Demo
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link
              href="/documents"
              className="px-8 py-4 text-base font-medium text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] transition-colors"
            >
              Browse Indexed Documents
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="relative border-t border-[var(--lp-border)] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo + tagline */}
            <div className="flex items-center gap-4">
              <img
                src="/esap_logo_white.png"
                alt="ESAP"
                className="h-7 w-auto opacity-70"
              />
              <div className="h-4 w-px bg-[var(--lp-border)]" />
              <p className="text-sm text-[var(--lp-text-muted)]">
                Arabic Document Intelligence
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              {[
                { label: "Chat", href: "/chat" },
                { label: "Documents", href: "/documents" },
                { label: "Upload", href: "/upload" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center min-h-[44px] px-2 text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-text-secondary)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--lp-border)]/50 text-center">
            <p className="text-xs text-[var(--lp-text-muted)]">
              {new Date().getFullYear()} &middot; Powered by{" "}
              <span className="text-[var(--lp-text-secondary)]">ESAP AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

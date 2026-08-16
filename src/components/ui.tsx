import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { ICheck, ISpark, IX } from "./icons";

/* ---------- scroll reveal ---------- */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([en]) => { if (en.isIntersecting) { setInView(true); ob.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- modal ---------- */
export function Modal({ open, onClose, children, wide = false, title }: {
  open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean; title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal>
      <button className="absolute inset-0 bg-pine-950/70 backdrop-blur-[3px] anim-fade cursor-default" onClick={onClose} aria-label="Close" />
      <div className={`relative w-full ${wide ? "max-w-3xl" : "max-w-xl"} max-h-[92vh] overflow-y-auto scrollbar-thin card-surface rounded-t-2xl sm:rounded-xl shadow-2xl anim-rise`}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 py-3.5 border-b hairline card-surface">
          <h3 className="font-display font-bold text-[1.02rem] leading-snug">{title ?? ""}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-pine-600/10 transition-colors" aria-label="Close dialog"><IX size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- toasts ---------- */
export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="fixed bottom-5 right-5 z-[95] flex flex-col gap-2.5 max-w-[92vw]">
      {toasts.map((t) => (
        <div key={t.id}
          className={`anim-slidein flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium ${
            t.kind === "success" ? "bg-pine-800 text-pine-50 border-pine-600" :
            t.kind === "warn" ? "bg-clay-600 text-gold-100 border-clay-500" :
            "bg-night-3 text-pine-100 border-pine-600/50"}`}>
          <span className={t.kind === "warn" ? "text-gold-300" : "text-gold-400"}><ICheck size={16} /></span>
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- breadcrumbs ---------- */
export interface Crumb { label: string; to?: string; }
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.8rem] text-inksoft dark:text-pine-200/70">
      <Link to="/" className="hover:text-pine-600 dark:hover:text-gold-400 transition-colors font-medium">Home</Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-pine-300 dark:text-pine-700">/</span>
          {c.to ? (
            <Link to={c.to} className="hover:text-pine-600 dark:hover:text-gold-400 transition-colors font-medium">{c.label}</Link>
          ) : (
            <span className="font-semibold text-ink dark:text-pine-100">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ---------- section heading ---------- */
export function SectionHead({ eyebrow, title, sub, right }: { eyebrow: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div>
        <p className="font-mono text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-pine-600 dark:text-gold-400 mb-2 flex items-center gap-2">
          <ISpark size={13} /> {eyebrow}
        </p>
        <h2 className="font-display font-extrabold text-[1.7rem] sm:text-[2.1rem] leading-[1.05] tracking-tight">{title}</h2>
        {sub && <p className="mt-2 max-w-xl text-[0.95rem] text-inksoft dark:text-pine-200/75">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------- tabs ---------- */
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
      <div className="flex gap-1 min-w-max border-b hairline">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={`tab-underline px-3.5 py-2.5 text-[0.86rem] font-semibold whitespace-nowrap transition-colors ${
              active === t.id ? "active text-pine-700 dark:text-gold-400" : "text-inksoft dark:text-pine-200/60 hover:text-ink dark:hover:text-pine-100"}`}>
            {t.label}
            {typeof t.count === "number" && (
              <span className={`ml-1.5 text-[0.68rem] font-mono px-1.5 py-0.5 rounded-full ${
                active === t.id ? "bg-gold-400/90 text-pine-950" : "bg-pine-600/10 text-inksoft dark:bg-pine-500/15 dark:text-pine-200"}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- small bits ---------- */
export const KindBadge = ({ kind }: { kind: string }) => {
  const map: Record<string, string> = {
    Midterm: "bg-gold-400/20 text-gold-700 dark:text-gold-300 border-gold-500/40",
    Final: "bg-pine-600/12 text-pine-700 dark:text-pine-200 border-pine-600/35",
    Quiz: "bg-clay-500/12 text-clay-600 dark:text-clay-400 border-clay-500/35",
    "Exit Exam": "bg-night-3 text-gold-300 border-pine-500/40",
    Syllabus: "bg-pine-600/12 text-pine-700 dark:text-pine-200 border-pine-600/35",
    Note: "bg-gold-400/20 text-gold-700 dark:text-gold-300 border-gold-500/40",
    PDF: "bg-clay-500/12 text-clay-600 dark:text-clay-400 border-clay-500/35",
    Document: "bg-pine-600/12 text-pine-700 dark:text-pine-200 border-pine-600/35",
    Material: "bg-gold-400/20 text-gold-700 dark:text-gold-300 border-gold-500/40",
  };
  return <span className={`inline-flex items-center text-[0.68rem] font-mono font-semibold tracking-wide px-2 py-0.5 rounded-md border ${map[kind] ?? map.Document}`}>{kind}</span>;
};

export function LoadMore({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  if (shown >= total) return <p className="text-center text-[0.8rem] text-inksoft dark:text-pine-200/50 font-mono pt-2">— end of list · {total} items —</p>;
  return (
    <div className="flex justify-center pt-2">
      <button onClick={onMore} className="btn-ghost">Load more ({total - shown} remaining)</button>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 text-center">
      <p className="font-display font-bold text-lg text-inksoft dark:text-pine-200/60">Nothing here yet</p>
      <p className="text-sm text-inksoft/70 dark:text-pine-200/40 mt-1">{text}</p>
    </div>
  );
}

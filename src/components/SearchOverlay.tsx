import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { useSearchIndex, SearchEntry } from "../data/content";
import { IBook, ICap, IChevD, IDoc, IExam, IGrid, IPin, ISearch, IX } from "./icons";

const CATS = ["All", "Campus", "Subject", "Department", "Course", "Exam", "Document", "Explained"] as const;
const CAT_ICON: Record<string, React.ReactNode> = {
  Campus: <IPin size={15} />, Subject: <ICap size={15} />, Department: <IGrid size={15} />,
  Course: <IBook size={15} />, Exam: <IExam size={15} />, Document: <IDoc size={15} />, Explained: <IChevD size={15} />,
};

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const searchIndex = useSearchIndex();
  const index = useMemo(() => (searchOpen ? searchIndex : []), [searchOpen, searchIndex]);

  useEffect(() => {
    if (searchOpen) { setQ(""); setCat("All"); setCursor(0); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(!searchOpen); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = index;
    if (cat !== "All") list = list.filter((e) => e.category === cat);
    if (needle) {
      const terms = needle.split(/\s+/);
      list = list.filter((e) => {
        const hay = `${e.title} ${e.subtitle} ${e.category}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
      list = [...list].sort((a, b) => {
        const aT = a.title.toLowerCase().startsWith(needle) ? 0 : 1;
        const bT = b.title.toLowerCase().startsWith(needle) ? 0 : 1;
        return aT - bT;
      });
    }
    return list.slice(0, 40);
  }, [q, cat, index]);

  useEffect(() => { setCursor(0); }, [q, cat]);

  if (!searchOpen) return null;

  const go = (e: SearchEntry) => {
    const href = e.href.startsWith("#") ? e.href.slice(1) : e.href;
    setSearchOpen(false);
    nav(href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && results[cursor]) go(results[cursor]);
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center pt-[8vh] px-4">
      <button className="absolute inset-0 bg-pine-950/72 backdrop-blur-[4px] anim-fade cursor-default" onClick={() => setSearchOpen(false)} aria-label="Close search" />
      <div className="relative w-full max-w-2xl card-surface rounded-xl shadow-2xl overflow-hidden anim-rise">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b hairline">
          <span className="text-pine-600 dark:text-gold-400"><ISearch size={20} /></span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Search departments, courses, exams, answers, documents…"
            className="flex-1 bg-transparent text-[1rem] font-medium placeholder:text-inksoft/50 dark:placeholder:text-pine-200/40" />
          <kbd className="font-mono text-[0.64rem] px-1.5 py-1 rounded border hairline text-inksoft dark:text-pine-200/60">ESC</kbd>
          <button onClick={() => setSearchOpen(false)} className="p-1 rounded hover:bg-pine-600/10" aria-label="Close"><IX size={16} /></button>
        </div>

        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-thin border-b hairline">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 text-[0.72rem] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                cat === c ? "bg-pine-700 text-gold-200 border-pine-700" : "border-pine-600/20 text-inksoft dark:text-pine-200/70 hover:border-pine-600/50"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="max-h-[52vh] overflow-y-auto scrollbar-thin p-2">
          {results.length === 0 ? (
            <p className="py-10 text-center text-sm text-inksoft dark:text-pine-200/50">
              No results for “{q}”. Try a course code (e.g. <span className="font-mono">MATH 1011</span>) or a department name.
            </p>
          ) : results.map((r, i) => (
            <button key={r.id} onClick={() => go(r)} onMouseEnter={() => setCursor(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                i === cursor ? "bg-pine-700 text-pine-50" : "hover:bg-pine-600/8 dark:hover:bg-pine-500/12"}`}>
              <span className={`shrink-0 ${i === cursor ? "text-gold-400" : "text-pine-600 dark:text-pine-300"}`}>{CAT_ICON[r.category] ?? <IDoc size={15} />}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.88rem] font-semibold truncate">{r.title}</span>
                <span className={`block text-[0.72rem] truncate ${i === cursor ? "text-pine-200/80" : "text-inksoft dark:text-pine-200/55"}`}>{r.subtitle}</span>
              </span>
              <span className={`shrink-0 font-mono text-[0.62rem] tracking-wide uppercase px-1.5 py-0.5 rounded border ${
                i === cursor ? "border-gold-400/60 text-gold-300" : "border-pine-600/25 text-pine-600 dark:text-pine-300"}`}>{r.category}</span>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 border-t hairline flex items-center gap-4 text-[0.66rem] font-mono text-inksoft dark:text-pine-200/50">
          <span>↑↓ navigate</span><span>↵ open</span><span className="ml-auto">{results.length} result{results.length === 1 ? "" : "s"} · {index.length.toLocaleString()} items indexed</span>
        </div>
      </div>
    </div>
  );
}

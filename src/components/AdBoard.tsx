import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { AdItem } from "../data/types";
import { IArrowL, IArrowR, IChevD, IMegaphone, IX } from "./icons";

const TONES: Record<AdItem["tone"], string> = {
  pine: "from-pine-800 to-pine-600 text-pine-50",
  gold: "from-gold-500 to-gold-300 text-pine-950",
  night: "from-night-3 to-pine-900 text-pine-50",
};

/**
 * Promotional board — sits below the navbar with intentional spacing.
 * Content is fully data-driven (see src/data/resources.ts → DEFAULT_ADS);
 * admins can add more via the staff dashboard.
 */
export default function AdBoard() {
  const { ads, toast } = useStore();
  const [idx, setIdx] = useState(0);
  const [minimized, setMinimized] = useState(() => sessionStorage.getItem("huec:ads:min") === "1");
  const [closed, setClosed] = useState(() => sessionStorage.getItem("huec:ads:off") === "1");
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (closed || minimized || paused || ads.length < 2) return;
    timer.current = window.setInterval(() => setIdx((i) => (i + 1) % ads.length), 6000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [closed, minimized, paused, ads.length]);

  if (closed || ads.length === 0) return null;
  const ad = ads[idx % ads.length];

  return (
    <section aria-label="Advertisements" className="max-w-7xl mx-auto px-4 mt-6"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {minimized ? (
        <div className="card-surface rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm">
          <p className="flex items-center gap-2 text-[0.78rem] font-semibold text-inksoft dark:text-pine-200/70">
            <span className="text-gold-500"><IMegaphone size={15} /></span>
            Sponsored · {ads.length} promotion{ads.length > 1 ? "s" : ""} hidden
          </p>
          <button onClick={() => { setMinimized(false); sessionStorage.setItem("huec:ads:min", "0"); }}
            className="text-[0.78rem] font-bold text-pine-600 dark:text-gold-400 hover:underline">Show</button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-24px_rgba(7,43,34,0.55)] border hairline">
          {/* sliding track */}
          <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${(idx % ads.length) * 100}%)` }}>
            {ads.map((a) => (
              <article key={a.id} className={`w-full shrink-0 bg-gradient-to-br ${TONES[a.tone]}`}>
                <div className="flex flex-col sm:flex-row items-stretch">
                  {a.image && (
                    <div className="sm:w-52 h-36 sm:h-auto shrink-0 overflow-hidden relative">
                      <img src={a.image} alt="" loading="lazy" className="w-full h-full object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-pine-950/45 to-transparent" />
                    </div>
                  )}
                  <div className="flex-1 px-5 sm:px-6 py-4.5 flex flex-col sm:flex-row sm:items-center gap-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[0.64rem] tracking-[0.16em] uppercase opacity-75 font-semibold">{a.eyebrow}</p>
                      <h3 className="font-display font-extrabold text-[1.12rem] sm:text-[1.3rem] leading-tight mt-1">{a.title}</h3>
                      <p className="text-[0.82rem] opacity-85 mt-1 leading-relaxed max-w-xl">{a.body}</p>
                      <div className="flex flex-wrap items-center gap-2.5 mt-3">
                        <button onClick={() => toast(`“${a.title}” — sponsor page opens here (demo link)`)}
                          className={`inline-flex items-center gap-1.5 text-[0.8rem] font-bold px-3.5 py-1.5 rounded-lg transition-transform hover:-translate-y-0.5 cursor-pointer ${
                            a.tone === "gold" ? "bg-pine-900 text-gold-300" : "bg-gold-400 text-pine-950"}`}>
                          {a.cta} →
                        </button>
                        {a.offer && (
                          <span className={`text-[0.7rem] font-mono font-semibold px-2.5 py-1 rounded-md border ${
                            a.tone === "gold" ? "border-pine-900/40" : "border-gold-300/50 text-gold-300"}`}>★ {a.offer}</span>
                        )}
                      </div>
                    </div>
                    {/* controls cluster */}
                    <div className="flex sm:flex-col items-center gap-1 self-end sm:self-center pb-1 sm:pb-0">
                      <button onClick={() => setIdx((i) => (i - 1 + ads.length) % ads.length)} aria-label="Previous ad"
                        className="p-1.5 rounded-lg hover:bg-pine-950/20 transition-colors"><IArrowL size={16} /></button>
                      <button onClick={() => setIdx((i) => (i + 1) % ads.length)} aria-label="Next ad"
                        className="p-1.5 rounded-lg hover:bg-pine-950/20 transition-colors"><IArrowR size={16} /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* footer strip: dots + minimize/close */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            <button onClick={() => { setMinimized(true); sessionStorage.setItem("huec:ads:min", "1"); }}
              aria-label="Minimize ads" className="p-1.5 rounded-md bg-pine-950/30 text-pine-50 hover:bg-pine-950/55 transition-colors"><IChevD size={14} /></button>
            <button onClick={() => { setClosed(true); sessionStorage.setItem("huec:ads:off", "1"); }}
              aria-label="Close ads" className="p-1.5 rounded-md bg-pine-950/30 text-pine-50 hover:bg-clay-600 transition-colors"><IX size={14} /></button>
          </div>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {ads.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Ad ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx % ads.length ? "w-6 bg-gold-400" : "w-1.5 bg-pine-50/50 hover:bg-pine-50/80"}`} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

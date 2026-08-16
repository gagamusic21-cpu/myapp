import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { CAMPUSES, DEPARTMENTS, departmentsOf } from "../data/campuses";
import { FRESHMAN_SUBJECTS } from "../data/freshman";
import { IBell, IChevD, IMenu, IMoon, ISearch, ISun, IUser, IX, Logo, ICap, IChip, ILeaf, IPulse, IGrid } from "./icons";

const CAMPUS_ICON: Record<string, React.ReactNode> = {
  freshman: <ICap size={15} />, iot: <IChip size={15} />, agri: <ILeaf size={15} />, health: <IPulse size={15} />,
};

export default function Navbar() {
  const { theme, toggleTheme, identity, announcements, searchOpen, setSearchOpen } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const loc = useLocation();
  const nav = useNavigate();
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); setOpenMenu(null); setBellOpen(false); }, [loc.pathname]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const activeCampus = (id: string) => loc.pathname.startsWith(`/campus/${id}`);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const MegaMenu = ({ campusId }: { campusId: string }) => {
    const meta = CAMPUSES.find((c) => c.id === campusId)!;
    const items = campusId === "freshman"
      ? FRESHMAN_SUBJECTS.map((s) => ({ name: s.name, to: `/campus/freshman/subject/${s.id}`, sub: s.code }))
      : departmentsOf(campusId).map((d) => ({ name: d.name, to: `/campus/${campusId}/dept/${d.id}`, sub: d.abbr }));
    return (
      <div className="absolute left-0 top-full pt-2 w-[560px] max-w-[92vw] opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
        <div className="card-surface rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3 pb-3 border-b hairline">
            <p className="font-display font-bold text-[0.95rem] flex items-center gap-2">{CAMPUS_ICON[campusId]} {meta.name}</p>
            <Link to={`/campus/${campusId}`} className="text-[0.78rem] font-semibold text-pine-600 dark:text-gold-400 hover:underline">Open campus →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 max-h-[340px] overflow-y-auto scrollbar-thin pr-1">
            {items.map((it) => (
              <Link key={it.to} to={it.to}
                className="px-2.5 py-2 rounded-lg hover:bg-pine-600/8 dark:hover:bg-pine-500/15 transition-colors group/item">
                <p className="text-[0.82rem] font-semibold leading-tight group-hover/item:text-pine-700 dark:group-hover/item:text-gold-400">{it.name}</p>
                <p className="text-[0.66rem] font-mono text-inksoft dark:text-pine-200/50 mt-0.5">{it.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const navItems = CAMPUSES.map((c) => ({ id: c.id, label: c.short, to: `/campus/${c.id}` }));

  return (
    <header className="sticky top-0 z-[60]">
      {/* micro bar */}
      <div className="bg-pine-950 text-pine-100/90 text-[0.72rem] font-mono">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3">
          <p className="truncate">{today} · Hawassa, Sidama — Ethiopia</p>
          <p className="hidden sm:block shrink-0">2017 E.C. · Semester II · <span className="text-gold-400">Exam week: Mar 3–14</span></p>
        </div>
      </div>

      {/* main bar */}
      <div className="bg-paper/92 dark:bg-night/92 backdrop-blur-md border-b hairline shadow-[0_2px_20px_-12px_rgba(9,58,46,0.35)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-3 h-[64px]">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <span className="transition-transform duration-300 group-hover:-rotate-6"><Logo size={36} /></span>
              <span className="leading-none">
                <span className="block font-mono text-[0.6rem] tracking-[0.22em] uppercase text-pine-600 dark:text-pine-300 font-semibold">Hawassa University</span>
                <span className="block font-display font-extrabold text-[1.06rem] tracking-tight mt-0.5">Exams <span className="text-pine-600 dark:text-gold-400">&amp;</span> Courses</span>
              </span>
            </Link>

            {/* desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((it) => (
                <div key={it.id} className={`relative group ${activeCampus(it.id) ? "" : ""}`}>
                  <Link to={it.to}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[0.84rem] font-semibold transition-colors ${
                      activeCampus(it.id) ? "text-pine-700 dark:text-gold-400 bg-pine-600/10 dark:bg-pine-500/12" : "text-ink dark:text-pine-100 hover:text-pine-700 dark:hover:text-gold-400 hover:bg-pine-600/6"}`}>
                    {it.label} <IChevD size={13} className="opacity-60 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  <MegaMenu campusId={it.id} />
                </div>
              ))}
              <Link to="/explained"
                className={`px-3 py-2 rounded-lg text-[0.84rem] font-semibold transition-colors ${
                  loc.pathname.startsWith("/explained") ? "text-pine-700 dark:text-gold-400 bg-pine-600/10 dark:bg-pine-500/12" : "text-ink dark:text-pine-100 hover:text-pine-700 dark:hover:text-gold-400 hover:bg-pine-600/6"}`}>
                Departments Explained
              </Link>
            </nav>

            <div className="flex items-center gap-1.5">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border hairline text-[0.8rem] font-medium text-inksoft dark:text-pine-200/70 hover:border-pine-500/50 transition-colors">
                <ISearch size={15} /> <span className="hidden md:inline">Search everything…</span>
                <kbd className="font-mono text-[0.62rem] px-1.5 py-0.5 rounded border hairline bg-pine-600/5 dark:bg-pine-500/10">Ctrl K</kbd>
              </button>
              <button onClick={() => setSearchOpen(true)} className="sm:hidden p-2 rounded-lg hover:bg-pine-600/10" aria-label="Search"><ISearch size={19} /></button>

              {/* announcements bell */}
              <div className="relative" ref={bellRef}>
                <button onClick={() => setBellOpen(!bellOpen)} className="p-2 rounded-lg hover:bg-pine-600/10 relative transition-colors" aria-label="Announcements">
                  <IBell size={19} />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-clay-500 pulse-dot" />
                </button>
                {bellOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[320px] max-w-[88vw] card-surface rounded-xl shadow-2xl p-2 anim-rise z-50">
                    <p className="px-2.5 py-2 font-display font-bold text-[0.9rem] border-b hairline mb-1">Latest announcements</p>
                    <div className="max-h-72 overflow-y-auto scrollbar-thin">
                      {announcements.slice(0, 5).map((a) => (
                        <div key={a.id} className="px-2.5 py-2 rounded-lg hover:bg-pine-600/6 transition-colors">
                          <p className="text-[0.66rem] font-mono text-pine-600 dark:text-gold-400">{a.tag} · {a.date}</p>
                          <p className="text-[0.8rem] font-semibold leading-snug mt-0.5">{a.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-pine-600/10 transition-colors" aria-label="Toggle theme">
                {theme === "light" ? <IMoon size={19} /> : <ISun size={19} />}
              </button>

              <button onClick={() => nav("/profile")}
                className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border hairline hover:border-pine-500/50 transition-colors">
                <span className="w-6 h-6 rounded-full bg-pine-600 dark:bg-pine-500 text-gold-200 flex items-center justify-center text-[0.7rem] font-bold">
                  {identity ? identity.name.charAt(0).toUpperCase() : <IUser size={13} />}
                </span>
                <span className="text-[0.78rem] font-semibold max-w-[90px] truncate">{identity ? identity.name : "Set name"}</span>
              </button>

              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-pine-600/10" aria-label="Open menu"><IMenu size={21} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button className="absolute inset-0 bg-pine-950/60 backdrop-blur-sm anim-fade" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <div className="absolute right-0 top-0 bottom-0 w-[300px] max-w-[86vw] bg-paper dark:bg-night-2 border-l hairline shadow-2xl anim-slidein overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between p-4 border-b hairline">
              <span className="flex items-center gap-2"><Logo size={28} /><span className="font-display font-bold text-[0.95rem]">Exams &amp; Courses</span></span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5" aria-label="Close"><IX size={19} /></button>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map((it) => (
                <details key={it.id} className="group">
                  <summary className="flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-[0.9rem] hover:bg-pine-600/8 list-none cursor-pointer">
                    <span className="flex items-center gap-2">{CAMPUS_ICON[it.id]} {it.label}</span>
                    <IChevD size={15} className="transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-3 pb-1 space-y-0.5">
                    <Link to={it.to} className="block px-3 py-2 rounded-lg text-[0.83rem] font-semibold text-pine-600 dark:text-gold-400 hover:bg-pine-600/8">Campus overview →</Link>
                    <div className="grid grid-cols-1 gap-0.5 max-h-56 overflow-y-auto scrollbar-thin">
                      {(it.id === "freshman"
                        ? FRESHMAN_SUBJECTS.map((s) => ({ n: s.name, to: `/campus/freshman/subject/${s.id}` }))
                        : departmentsOf(it.id).map((d) => ({ n: d.name, to: `/campus/${it.id}/dept/${d.id}` }))
                      ).map((x) => (
                        <Link key={x.to} to={x.to} className="block px-3 py-1.5 rounded-lg text-[0.8rem] text-inksoft dark:text-pine-200/80 hover:bg-pine-600/8 hover:text-pine-700">{x.n}</Link>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
              <Link to="/explained" className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-[0.9rem] hover:bg-pine-600/8"><IGrid size={15} /> Departments Explained</Link>
              <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-[0.9rem] hover:bg-pine-600/8"><IUser size={15} /> {identity ? identity.name : "Set display name"}</Link>
              <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-[0.9rem] text-inksoft hover:bg-pine-600/8">Staff dashboard</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CAMPUSES, DEPARTMENTS, departmentsOf } from "../data/campuses";
import { FRESHMAN_SUBJECTS } from "../data/freshman";
import { platformStats } from "../data/resources";
import { useStore } from "../lib/store";
import { Reveal, SectionHead } from "../components/ui";
import AdBoard from "../components/AdBoard";
import ChatRoom from "../components/ChatRoom";
import { IArrowR, IBell, ICap, IChat, IChip, IExam, IDoc, IGrid, ILeaf, IPulse, ISearch, ISpark } from "../components/icons";

const CAMPUS_ICON: Record<string, React.ReactNode> = { freshman: <ICap size={17} />, iot: <IChip size={17} />, agri: <ILeaf size={17} />, health: <IPulse size={17} /> };

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      ob.disconnect();
      const t0 = performance.now();
      const dur = 1100;
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    ob.observe(el);
    return () => ob.disconnect();
  }, [value]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

function Ticker({ items }: { items: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % items.length), 3400);
    return () => window.clearInterval(t);
  }, [items.length]);
  return (
    <div className="relative h-5 overflow-hidden">
      <p key={i} className="absolute inset-x-0 text-[0.8rem] font-mono text-pine-700 dark:text-gold-300 truncate" style={{ animation: "rise 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
        ▸ {items[i]}
      </p>
    </div>
  );
}

export default function Home() {
  const { announcements, setSearchOpen } = useStore();
  const stats = useMemo(() => platformStats(), []);
  const explainedSample = useMemo(() => {
    const want = ["computer-science", "medicine", "plant-science", "civil-engineering", "pharmacy", "animal-science", "medical-laboratory-science", "urban-planning-design"];
    return want.map((id) => DEPARTMENTS.find((d) => d.id === id)!);
  }, []);

  return (
    <div>
      <AdBoard />

      {/* ============ opening board ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gridlines" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-10 grid lg:grid-cols-[1.25fr_1fr] gap-10 items-start">
          <div className="anim-rise">
            <p className="inline-flex items-center gap-2 chip !text-[0.7rem] !py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-clay-500 pulse-dot" />
              Student-run archive · updated weekly · 2017 E.C. Semester II
            </p>
            <h1 className="font-display font-extrabold tracking-tight leading-[0.98] text-[2.5rem] sm:text-[3.6rem] xl:text-[4.1rem]">
              Every exam.<br />
              Every course.<br />
              <span className="relative inline-block text-pine-600 dark:text-gold-400">
                Every campus.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" aria-hidden><path d="M3 9c60-6 180-6 294-2" stroke="#F2B33D" strokeWidth="4" strokeLinecap="round" fill="none" /></svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-inksoft dark:text-pine-200/80">
              Previous exams with answer keys, lecture notes, handouts and study documents for the
              <b className="text-ink dark:text-pine-100"> Freshman, IoT, Agricultural and Health campuses</b> of Hawassa University —
              organised so you find what you need in seconds, not hours.
            </p>

            <button onClick={() => setSearchOpen(true)}
              className="mt-7 w-full max-w-xl flex items-center gap-3 card-surface rounded-xl px-4 py-3.5 text-left shadow-[0_14px_40px_-18px_rgba(9,58,46,0.5)] hover:shadow-[0_18px_50px_-18px_rgba(9,58,46,0.65)] hover:-translate-y-0.5 transition-all group">
              <span className="text-pine-600 dark:text-gold-400 group-hover:scale-110 transition-transform"><ISearch size={21} /></span>
              <span className="text-[0.95rem] text-inksoft dark:text-pine-200/60">Search “Mathematics 2016 final”, “CoSc exit exam”, “Anatomy notes”…</span>
              <kbd className="ml-auto hidden sm:block font-mono text-[0.66rem] px-2 py-1 rounded border hairline bg-pine-600/5 dark:bg-pine-500/10">Ctrl K</kbd>
            </button>

            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { l: "Mathematics past papers", to: "/campus/freshman/subject/mathematics?tab=exams" },
                { l: "CoSc model exit exams", to: "/campus/iot/dept/computer-science?tab=exams" },
                { l: "Anatomy answer keys", to: "/campus/health/dept/medicine?tab=answers" },
                { l: "Agronomy notes", to: "/campus/agri/dept/plant-science?tab=notes" },
              ].map((c) => (
                <Link key={c.l} to={c.to} className="chip hover:!bg-pine-700 hover:!text-gold-200 hover:!border-pine-700 transition-colors">{c.l} →</Link>
              ))}
            </div>

            {/* stats */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-9 max-w-xl">
              {[
                { k: "Exam papers", v: stats.exams, i: <IExam size={16} /> },
                { k: "Documents", v: stats.docs, i: <IDoc size={16} /> },
                { k: "Courses", v: stats.courses, i: <IGrid size={16} /> },
                { k: "Departments", v: stats.departments, i: <ICap size={16} /> },
              ].map((s) => (
                <div key={s.k} className="card-surface rounded-xl px-3.5 py-3">
                  <dt className="flex items-center gap-1.5 font-mono text-[0.64rem] uppercase tracking-wider text-inksoft dark:text-pine-200/55">{s.i}{s.k}</dt>
                  <dd className="font-display font-extrabold text-[1.45rem] mt-1 text-pine-700 dark:text-gold-400"><CountUp value={s.v} /></dd>
                </div>
              ))}
            </dl>
          </div>

          {/* notice board */}
          <div className="anim-rise lg:mt-6" style={{ animationDelay: "120ms" }}>
            <div className="card-surface rounded-2xl shadow-[0_24px_60px_-30px_rgba(9,58,46,0.55)] overflow-hidden">
              <div className="bg-pine-800 text-pine-50 px-5 py-3.5 flex items-center justify-between">
                <p className="font-display font-bold text-[0.95rem] flex items-center gap-2"><ISpark size={16} className="text-gold-400" /> Notice board</p>
                <span className="font-mono text-[0.64rem] text-gold-300">LIVE</span>
              </div>
              <div className="px-5 py-4 border-b hairline">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-inksoft dark:text-pine-200/50 mb-1.5">Fresh uploads</p>
                <Ticker items={[
                  "Mathematics — Final 2016 E.C. with answers",
                  "Computer Science — Model Exit Exam Set 3",
                  "Medicine — Clinical procedure checklists",
                  "Plant Science — Field manual (updated)",
                  "Physics — Midterm 2017 E.C. paper",
                  "Nursing — OSCE station guides",
                  "Logic — Argument drills worksheet",
                ]} />
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                {CAMPUSES.map((c) => (
                  <Link key={c.id} to={`/campus/${c.id}`}
                    className="group rounded-xl border hairline p-3 hover:border-pine-500/60 hover:-translate-y-0.5 transition-all">
                    <span className="w-8 h-8 rounded-lg bg-pine-600/10 dark:bg-pine-500/15 text-pine-600 dark:text-gold-400 flex items-center justify-center group-hover:bg-pine-700 group-hover:text-gold-300 transition-colors">{CAMPUS_ICON[c.id]}</span>
                    <p className="font-display font-bold text-[0.86rem] mt-2 leading-tight group-hover:text-pine-700 dark:group-hover:text-gold-400">{c.short}</p>
                    <p className="font-mono text-[0.62rem] text-inksoft dark:text-pine-200/50 mt-0.5">
                      {c.id === "freshman" ? `${FRESHMAN_SUBJECTS.length} subjects` : `${departmentsOf(c.id).length} departments`}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="px-5 py-3 border-t hairline bg-pine-600/5 dark:bg-pine-500/8">
                <Link to="/announcements" className="flex items-center gap-2 text-[0.8rem] font-semibold text-pine-700 dark:text-gold-400 hover:underline">
                  <IBell size={15} /> {announcements.length} announcements — latest: “{announcements[0]?.title.slice(0, 42)}…”
                </Link>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 card-surface rounded-xl px-4 py-3">
              <span className="text-pine-600 dark:text-gold-400"><IChat size={19} /></span>
              <p className="text-[0.82rem] text-inksoft dark:text-pine-200/70">Stuck on a question? The <Link to="/chat" className="font-bold text-pine-700 dark:text-gold-400 hover:underline">General Chat</Link> is open — or jump into your department's room.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ campus mosaic ============ */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <Reveal>
          <SectionHead eyebrow="Choose your path" title="Four campuses, one archive"
            sub="Pick your campus to reach departments, then courses, then the exams and materials inside each."
            right={<Link to="/explained" className="btn-ghost shrink-0">Departments Explained <IArrowR size={15} /></Link>} />
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {CAMPUSES.map((c, i) => {
            const span = i === 0 ? "md:col-span-7 md:row-span-2" : "md:col-span-5";
            const deps = c.id === "freshman" ? FRESHMAN_SUBJECTS.slice(0, 8) : departmentsOf(c.id).slice(0, 6);
            return (
              <Reveal key={c.id} delay={i * 90} className={span}>
                <Link to={`/campus/${c.id}`} className="group block card-surface rounded-2xl overflow-hidden h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`imgframe ${i === 0 ? "h-52 md:h-64" : "h-36 md:h-40"}`}>
                    <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-pine-950/90 via-pine-950/25 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-gold-300 font-semibold">{c.tagline}</span>
                      <h3 className={`font-display font-extrabold text-pine-50 leading-tight mt-1 ${i === 0 ? "text-[1.6rem]" : "text-[1.25rem]"}`}>{c.name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.85rem] text-inksoft dark:text-pine-200/70 leading-relaxed">{c.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {deps.map((x) => (
                        <span key={x.id} className="chip !text-[0.66rem] group-hover:opacity-90">{x.name}</span>
                      ))}
                      <span className="chip !text-[0.66rem] !bg-gold-400/25 !border-gold-500/50 !text-gold-700 dark:!text-gold-300">
                        +{c.id === "freshman" ? FRESHMAN_SUBJECTS.length - 8 : departmentsOf(c.id).length - 6} more
                      </span>
                    </div>
                    <p className="flex items-center gap-1.5 mt-4 text-[0.8rem] font-bold text-pine-700 dark:text-gold-400">
                      Enter {c.short.toLowerCase()} <IArrowR size={15} className="transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ departments explained strip ============ */}
      <section className="mt-16 bg-pine-900 dark:bg-pine-950 text-pine-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#F2B33D 1px, transparent 1px)", backgroundSize: "26px 26px" }} aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 py-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
              <div>
                <p className="font-mono text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-gold-400 mb-2">Departments Explained</p>
                <h2 className="font-display font-extrabold text-[1.7rem] sm:text-[2.1rem] leading-tight tracking-tight">What will you actually study — and where can it take you?</h2>
              </div>
              <Link to="/explained" className="btn-gold shrink-0">Browse all {DEPARTMENTS.length} departments</Link>
            </div>
          </Reveal>
          <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-3 -mx-4 px-4 snap-x">
            {explainedSample.map((dep, i) => (
              <Reveal key={dep.id} delay={i * 60} className="snap-start shrink-0 w-[270px]">
                <Link to={`/explained/${dep.id}`} className="group block bg-pine-800/80 border border-pine-700 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-gold-500/60 transition-all duration-300 h-full">
                  <div className="imgframe h-36 !rounded-none">
                    <img src={dep.images[0]} alt={dep.name} loading="lazy" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 font-mono text-[0.6rem] font-bold uppercase tracking-wider bg-pine-950/80 text-gold-300 px-2 py-0.5 rounded">{dep.abbr}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-[0.98rem] leading-snug group-hover:text-gold-300 transition-colors">{dep.name}</h3>
                    <p className="text-[0.76rem] text-pine-200/70 mt-1.5 leading-relaxed line-clamp-2">{dep.tagline}</p>
                    <p className="font-mono text-[0.64rem] text-gold-400 mt-2.5">{dep.careers.slice(0, 2).join(" · ")}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ announcements ============ */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <Reveal>
          <SectionHead eyebrow="Bulletin" title="Latest announcements" sub="Exam timetables, new uploads and system updates from the moderation team." />
        </Reveal>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {announcements.slice(0, 6).map((a, i) => (
            <Reveal key={a.id} delay={i * 70}>
              <article className="card-surface rounded-xl p-4 h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <span className="chip !text-[0.64rem]">{a.tag}</span>
                  <span className="font-mono text-[0.66rem] text-inksoft dark:text-pine-200/50">{a.date}</span>
                </div>
                <h3 className="font-display font-bold text-[0.98rem] leading-snug mt-2.5">{a.title}</h3>
                <p className="text-[0.82rem] text-inksoft dark:text-pine-200/70 mt-1.5 leading-relaxed">{a.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ general chat ============ */}
      <section className="max-w-7xl mx-auto px-4 mt-16" id="general-chat">
        <Reveal>
          <SectionHead eyebrow="Community" title="General Chat"
            sub="Students from every campus, every department. Ask, answer, share — department-specific rooms live inside each department page."
            right={<Link to="/chat" className="btn-ghost shrink-0">Open full page <IArrowR size={15} /></Link>} />
        </Reveal>
        <Reveal delay={100}>
          <ChatRoom roomId="general" roomName="HU General Chat" />
        </Reveal>
      </section>
    </div>
  );
}

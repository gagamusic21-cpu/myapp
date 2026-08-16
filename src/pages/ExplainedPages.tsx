import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CAMPUSES, DEPARTMENTS, findDepartment } from "../data/campuses";
import { CampusPhoto } from "../data/types";
import { Breadcrumbs, EmptyState, Reveal, SectionHead } from "../components/ui";
import Lightbox from "../components/Lightbox";
import { IArrowR, IBook, IBriefcase, ICap, ICheck, IChip, ILeaf, IPulse, ISearch } from "../components/icons";

const CAMPUS_META: Record<string, { icon: React.ReactNode; label: string }> = {
  iot: { icon: <IChip size={15} />, label: "IoT Campus" },
  agri: { icon: <ILeaf size={15} />, label: "Agricultural Campus" },
  health: { icon: <IPulse size={15} />, label: "Health Campus" },
};

/* ---------------- index ---------------- */
export function ExplainedIndex() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return DEPARTMENTS;
    return DEPARTMENTS.filter((d) => `${d.name} ${d.abbr} ${d.tagline} ${d.careers.join(" ")}`.toLowerCase().includes(needle));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Departments Explained" }]} /></div>
      <Reveal>
        <div className="card-surface rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gold-400/15 blur-2xl" aria-hidden />
          <p className="font-mono text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-pine-600 dark:text-gold-400">Departments Explained</p>
          <h1 className="font-display font-extrabold text-[1.9rem] sm:text-[2.6rem] leading-[1.02] tracking-tight mt-2 max-w-3xl">
            {DEPARTMENTS.length} departments across three campuses — <span className="text-pine-600 dark:text-gold-400">what they teach, and where they lead.</span>
          </h1>
          <p className="text-[0.95rem] text-inksoft dark:text-pine-200/75 mt-3 max-w-2xl">
            Every page below explains a department in plain language: the overview, what you will actually learn,
            potential career paths, and real-world photographs of the field. Freshman common courses are not included here —
            those live under the <Link to="/campus/freshman" className="font-bold text-pine-700 dark:text-gold-400 hover:underline">Freshman section</Link>.
          </p>
          <div className="relative max-w-md mt-5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-inksoft dark:text-pine-200/50"><ISearch size={16} /></span>
            <input className="field !pl-9" placeholder="Search by department, field or career… e.g. “pharmacist”" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </Reveal>

      {(["iot", "agri", "health"] as const).map((cid, gi) => {
        const list = filtered.filter((d) => d.campusId === cid);
        if (list.length === 0) return null;
        const meta = CAMPUS_META[cid];
        const campus = CAMPUSES.find((c) => c.id === cid)!;
        return (
          <section key={cid} className="mt-12">
            <Reveal>
              <SectionHead eyebrow={meta.label} title={`${list.length} departments · ${campus.short}`}
                sub={campus.description}
                right={<Link to={`/campus/${cid}`} className="btn-ghost shrink-0">Exams &amp; courses <IArrowR size={15} /></Link>} />
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((dep, i) => (
                <Reveal key={dep.id} delay={(i % 6) * 60}>
                  <Link to={`/explained/${dep.id}`} className="group block card-surface rounded-xl overflow-hidden h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="imgframe h-40">
                      <img src={dep.images[0]} alt={dep.name} loading="lazy" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-pine-950/80 to-transparent" />
                      <span className="absolute bottom-2.5 left-3 right-3">
                        <span className="font-mono text-[0.62rem] font-bold uppercase tracking-wider text-gold-300">{dep.abbr}</span>
                        <span className="block font-display font-bold text-pine-50 text-[1.05rem] leading-snug">{dep.name}</span>
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[0.82rem] text-inksoft dark:text-pine-200/70 leading-relaxed line-clamp-2">{dep.overview}</p>
                      <p className="flex items-center gap-1.5 mt-3 text-[0.74rem] font-bold text-pine-700 dark:text-gold-400">
                        <IBriefcase size={13} /> {dep.careers.slice(0, 2).join(" · ")}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
      {filtered.length === 0 && <div className="mt-12"><EmptyState text="No department matches — try “engineer”, “nursing” or “agri”." /></div>}
    </div>
  );
}

/* ---------------- detail ---------------- */
export function ExplainedDetail() {
  const { deptId = "" } = useParams();
  const dep = findDepartment(deptId);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos: CampusPhoto[] = useMemo(() => dep ? [
    { id: "x1", src: dep.images[0], caption: `${dep.name} — students in practice`, tag: "Training" },
    { id: "x2", src: dep.images[1] ?? dep.images[0], caption: `${dep.name} — equipment & environment`, tag: "Facilities" },
    { id: "x3", src: dep.images[2] ?? dep.images[0], caption: `${dep.name} — field and professional work`, tag: "In the field" },
  ] : [], [dep]);

  if (!dep) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState text="Department not found." />
        <div className="text-center"><Link to="/explained" className="btn-primary">All departments</Link></div>
      </div>
    );
  }

  const campus = CAMPUSES.find((c) => c.id === dep.campusId)!;
  const related = DEPARTMENTS.filter((d) => d.campusId === dep.campusId && d.id !== dep.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Departments Explained", to: "/explained" }, { label: dep.name }]} /></div>

      {/* hero */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <img src={dep.images[0]} alt={dep.name} className="w-full h-64 sm:h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-pine-950/95 via-pine-950/50 to-pine-950/20" />
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8">
          <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.2em] text-gold-300 flex items-center gap-1.5">{CAMPUS_META[dep.campusId].icon} {campus.name}</p>
          <h1 className="font-display font-extrabold text-[1.9rem] sm:text-[2.8rem] text-pine-50 leading-tight tracking-tight mt-1.5">{dep.name}</h1>
          <p className="text-pine-100/90 text-[1rem] mt-2 max-w-2xl">{dep.tagline}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 mt-9">
        <div className="space-y-9">
          {/* overview */}
          <Reveal>
            <section>
              <SectionHead eyebrow="Department overview" title={`What is ${dep.name}?`} />
              <p className="text-[0.98rem] leading-[1.75] text-inksoft dark:text-pine-200/85 -mt-3">{dep.overview}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {dep.topics.map((t) => (
                  <span key={t} className="chip"><IBook size={11} /> {t}</span>
                ))}
              </div>
            </section>
          </Reveal>

          {/* what students learn */}
          <Reveal>
            <section className="card-surface rounded-2xl p-5 sm:p-6">
              <SectionHead eyebrow="Skills & knowledge" title="What students learn" />
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 -mt-2">
                {dep.learns.map((l) => (
                  <li key={l} className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-pine-600/12 dark:bg-pine-500/20 text-pine-600 dark:text-gold-400 flex items-center justify-center shrink-0"><ICheck size={12} /></span>
                    {l}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          {/* careers */}
          <Reveal>
            <section>
              <SectionHead eyebrow="Looking ahead" title="Potential career opportunities" />
              <div className="grid sm:grid-cols-2 gap-3 -mt-2">
                {dep.careers.map((c, i) => (
                  <div key={c} className="card-surface rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <span className="w-9 h-9 rounded-lg bg-gold-400/25 text-gold-700 dark:text-gold-300 flex items-center justify-center shrink-0 font-mono font-bold text-[0.72rem]">{String(i + 1).padStart(2, "0")}</span>
                    <p className="font-semibold text-[0.9rem]">{c}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[0.78rem] text-inksoft dark:text-pine-200/60 border-l-2 border-gold-500 pl-3 leading-relaxed">
                These are examples of <b>potential</b> paths graduates may pursue. Actual employment depends on individual performance,
                licensure requirements, market conditions and further study — no outcome is guaranteed.
              </p>
            </section>
          </Reveal>
        </div>

        {/* aside */}
        <aside className="space-y-5">
          <Reveal>
            <div className="card-surface rounded-2xl p-5">
              <p className="font-display font-bold text-[1rem] mb-3">The field in pictures</p>
              <div className="grid grid-cols-1 gap-2.5">
                {photos.map((p, i) => (
                  <button key={p.id} onClick={() => setLightbox(i)} className="imgframe h-32 text-left">
                    <img src={p.src} alt={p.caption} loading="lazy" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-2.5 font-mono text-[0.62rem] font-semibold text-pine-50 bg-pine-950/70 px-2 py-0.5 rounded">{p.tag}</span>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[0.66rem] text-inksoft dark:text-pine-200/50 mt-2.5">Click for full-screen view with zoom</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="card-surface rounded-2xl p-5">
              <p className="font-display font-bold text-[1rem] mb-1">Study this department</p>
              <p className="text-[0.82rem] text-inksoft dark:text-pine-200/65 mb-3.5">Exams, courses, answers and documents for {dep.name}.</p>
              <Link to={`/campus/${dep.campusId}/dept/${dep.id}`} className="btn-primary w-full justify-center">Open exams &amp; courses <IArrowR size={15} /></Link>
              <Link to={`/campus/${dep.campusId}/dept/${dep.id}?tab=chat`} className="btn-ghost w-full justify-center mt-2">Join {dep.name} chat</Link>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="card-surface rounded-2xl p-5">
              <p className="font-display font-bold text-[1rem] mb-3">Related departments</p>
              <div className="space-y-1.5">
                {related.map((r) => (
                  <Link key={r.id} to={`/explained/${r.id}`} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-pine-600/8 transition-colors text-[0.85rem] font-semibold">
                    <ICap size={14} className="text-pine-600 dark:text-gold-400 shrink-0" /> {r.name}
                    <IArrowR size={13} className="ml-auto opacity-50" />
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </aside>
      </div>

      {lightbox !== null && <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />}
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CAMPUSES, departmentsOf } from "../data/campuses";
import { FRESHMAN_SUBJECTS } from "../data/freshman";
import { deptEntity, docsFor, examsFor, subjectEntity } from "../data/resources";
import { Breadcrumbs, EmptyState, Reveal } from "../components/ui";
import ChatRoom from "../components/ChatRoom";
import { IArrowR, ICap, IChat, IChip, IExam, ILeaf, IPulse, ISearch } from "../components/icons";

const ICONS: Record<string, React.ReactNode> = {
  freshman: <ICap size={30} />, iot: <IChip size={30} />, agri: <ILeaf size={30} />, health: <IPulse size={30} />,
};

export default function CampusPage() {
  const { campusId = "freshman" } = useParams();
  const campus = CAMPUSES.find((c) => c.id === campusId);
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    if (!campus) return [];
    if (campus.id === "freshman") {
      return FRESHMAN_SUBJECTS.map((s) => ({
        id: s.id, name: s.name, code: s.code, tagline: s.tagline,
        to: `/campus/freshman/subject/${s.id}`,
        exams: examsFor(subjectEntity(s)).length,
        docs: docsFor(subjectEntity(s)).length,
        img: s.image,
      }));
    }
    return departmentsOf(campus.id).map((d) => ({
      id: d.id, name: d.name, code: d.abbr, tagline: d.tagline,
      to: `/campus/${campus.id}/dept/${d.id}`,
      exams: examsFor(deptEntity(d)).length,
      docs: docsFor(deptEntity(d)).length,
      img: d.images[0],
    }));
  }, [campus]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((i) => `${i.name} ${i.code} ${i.tagline}`.toLowerCase().includes(needle));
  }, [items, q]);

  if (!campus) return <EmptyState text="Campus not found." />;

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* banner */}
      <div className="relative rounded-2xl overflow-hidden mt-6 shadow-xl">
        <img src={campus.image} alt={campus.name} className="w-full h-52 sm:h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-pine-950/92 via-pine-950/60 to-pine-950/25" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
          <Breadcrumbs items={[{ label: campus.name }]} />
          <div className="flex items-center gap-3 mt-2">
            <span className="w-12 h-12 rounded-xl bg-gold-400 text-pine-950 flex items-center justify-center shadow-lg">{ICONS[campus.id]}</span>
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-gold-300 font-semibold">{campus.tagline}</p>
              <h1 className="font-display font-extrabold text-[1.6rem] sm:text-[2.2rem] text-pine-50 leading-tight">{campus.name}</h1>
            </div>
          </div>
          <p className="text-pine-100/85 text-[0.9rem] mt-2 max-w-2xl">{campus.description}</p>
        </div>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3 mt-7 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-inksoft dark:text-pine-200/50"><ISearch size={16} /></span>
          <input className="field !pl-9" placeholder={`Filter ${campus.id === "freshman" ? "subjects" : "departments"}… e.g. ${campus.id === "freshman" ? "Math" : campus.id === "health" ? "Nursing" : "Civil"}`}
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <p className="font-mono text-[0.74rem] text-inksoft dark:text-pine-200/60">
          {filtered.length} of {items.length} {campus.id === "freshman" ? "subjects" : "departments"} · path: <span className="text-pine-600 dark:text-gold-400">Home → {campus.short} → Department → Exams</span>
        </p>
      </div>

      {/* grid */}
      {filtered.length === 0 ? <EmptyState text="No match — try a shorter term." /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it, i) => (
            <Reveal key={it.id} delay={(i % 6) * 60}>
              <Link to={it.to} className="group block card-surface rounded-xl overflow-hidden h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="imgframe h-32">
                  <img src={it.img} alt={it.name} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-pine-950/75 to-transparent" />
                  <span className="absolute bottom-2 left-3 font-mono text-[0.64rem] font-bold text-gold-300 uppercase tracking-wider">{it.code}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-[1rem] leading-snug group-hover:text-pine-700 dark:group-hover:text-gold-400 transition-colors">{it.name}</h3>
                  <p className="text-[0.78rem] text-inksoft dark:text-pine-200/65 mt-1 leading-relaxed line-clamp-2">{it.tagline}</p>
                  <div className="flex items-center gap-3 mt-3 font-mono text-[0.68rem] text-inksoft dark:text-pine-200/55">
                    <span className="flex items-center gap-1"><IExam size={12} className="text-pine-600 dark:text-gold-400" /> {it.exams} papers</span>
                    <span>{it.docs} docs</span>
                    <span className="ml-auto flex items-center gap-1 font-bold text-pine-700 dark:text-gold-400">Open <IArrowR size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {/* campus chat */}
      <section className="mt-14">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-9 h-9 rounded-lg bg-pine-700 text-gold-300 flex items-center justify-center"><IChat size={17} /></span>
          <div>
            <h2 className="font-display font-extrabold text-[1.3rem] leading-tight">{campus.id === "freshman" ? "Freshman" : campus.short} Chat</h2>
            <p className="text-[0.8rem] text-inksoft dark:text-pine-200/60">One shared room for everyone on this campus — each department also has its own room.</p>
          </div>
        </div>
        <ChatRoom roomId={`campus-${campus.id}`} roomName={`${campus.id === "freshman" ? "Freshman" : campus.short} Chat`} />
      </section>

      {/* cross links */}
      <section className="mt-12 grid sm:grid-cols-3 gap-3">
        {CAMPUSES.filter((c) => c.id !== campus.id).map((c) => (
          <Link key={c.id} to={`/campus/${c.id}`} className="group card-surface rounded-xl p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <span className="w-10 h-10 rounded-lg bg-pine-600/10 dark:bg-pine-500/15 text-pine-600 dark:text-gold-400 flex items-center justify-center shrink-0">{ICONS[c.id]}</span>
            <span>
              <span className="block font-display font-bold text-[0.9rem] group-hover:text-pine-700 dark:group-hover:text-gold-400">{c.short}</span>
              <span className="block font-mono text-[0.66rem] text-inksoft dark:text-pine-200/55">{c.id === "freshman" ? `${FRESHMAN_SUBJECTS.length} subjects` : `${departmentsOf(c.id).length} departments`}</span>
            </span>
            <IArrowR size={16} className="ml-auto text-pine-600 dark:text-gold-400 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>
    </div>
  );
}

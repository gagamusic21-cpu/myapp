import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { FRESHMAN_LOOKUP } from "../data/campuses";
import { subjectEntity } from "../data/resources";
import { useContent } from "../data/content";
import { Breadcrumbs, EmptyState } from "../components/ui";
import ResourceHub from "../components/ResourceHub";
import { IArrowR, IBook, IExam, IDoc } from "../components/icons";

export default function SubjectPage() {
  const { subjectId = "" } = useParams();
  const subject = FRESHMAN_LOOKUP.get(subjectId);
  const entity = useMemo(() => (subject ? subjectEntity(subject) : null), [subject]);
  const content = useContent();

  if (!subject || !entity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState text="This freshman subject could not be found." />
        <div className="text-center"><Link to="/campus/freshman" className="btn-primary">Back to Freshman</Link></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Freshman", to: "/campus/freshman" }, { label: subject.name }]} /></div>

      <header className="card-surface rounded-2xl overflow-hidden grid md:grid-cols-[1fr_300px]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-pine-600 dark:text-gold-400 bg-pine-600/10 dark:bg-pine-500/15 px-2.5 py-1 rounded">{subject.code}</span>
            <span className="chip !text-[0.66rem]">Freshman common course</span>
            <span className="chip !text-[0.66rem]">{subject.credits} CrHr</span>
          </div>
          <h1 className="font-display font-extrabold text-[1.7rem] sm:text-[2.3rem] leading-tight tracking-tight mt-3">{subject.name}</h1>
          <p className="text-[1rem] text-inksoft dark:text-pine-200/75 mt-1.5">{subject.tagline}</p>
          <p className="text-[0.88rem] text-inksoft dark:text-pine-200/65 mt-3 max-w-2xl leading-relaxed">{subject.overview}</p>
          <div className="flex flex-wrap items-center gap-4 mt-5 font-mono text-[0.74rem] text-inksoft dark:text-pine-200/60">
            <span className="flex items-center gap-1.5"><IExam size={14} className="text-pine-600 dark:text-gold-400" /> {content.examsFor(entity.id).length} exam papers</span>
            <span className="flex items-center gap-1.5"><IDoc size={14} className="text-pine-600 dark:text-gold-400" /> {content.docsFor(entity.id).length} documents</span>
            <span className="flex items-center gap-1.5"><IBook size={14} className="text-pine-600 dark:text-gold-400" /> {subject.topics.length} units</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {subject.topics.map((t) => <span key={t} className="chip !text-[0.66rem]">{t}</span>)}
          </div>
          <div className="mt-5">
            <button onClick={() => document.getElementById("hub-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="btn-primary !py-2">Browse exams &amp; materials <IArrowR size={15} /></button>
          </div>
        </div>
        <div className="imgframe !rounded-none h-44 md:h-full">
          <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
          <span className="absolute bottom-2 right-3 font-mono text-[0.62rem] text-pine-50 bg-pine-950/70 px-2 py-0.5 rounded">Freshman · HU</span>
        </div>
      </header>

      <div id="hub-tabs" className="mt-8 scroll-mt-24">
        <ResourceHub entity={entity} roomLabel={`${subject.name}`} />
      </div>

      {/* neighbouring subjects */}
      <section className="mt-12">
        <h2 className="font-display font-bold text-[1.15rem] mb-3">Other freshman subjects</h2>
        <div className="flex gap-2 flex-wrap">
          {Array.from(FRESHMAN_LOOKUP.values()).filter((s) => s.id !== subject.id).slice(0, 10).map((s) => (
            <Link key={s.id} to={`/campus/freshman/subject/${s.id}`} className="chip hover:!bg-pine-700 hover:!text-gold-200 hover:!border-pine-700 transition-colors">{s.name}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}

import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CAMPUSES, findDepartment } from "../data/campuses";
import { deptEntity, docsFor, examsFor } from "../data/resources";
import { Breadcrumbs, EmptyState } from "../components/ui";
import ResourceHub from "../components/ResourceHub";
import { IArrowR, IBook, IExam, IDoc } from "../components/icons";

export default function DepartmentPage() {
  const { campusId = "", deptId = "" } = useParams();
  const dep = findDepartment(deptId);
  const campus = CAMPUSES.find((c) => c.id === campusId);
  const entity = useMemo(() => (dep ? deptEntity(dep) : null), [dep]);

  if (!dep || !campus || !entity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState text="This department could not be found." />
        <div className="text-center"><Link to={`/campus/${campusId}`} className="btn-primary">Back to campus</Link></div>
      </div>
    );
  }

  const exams = examsFor(entity).length;
  const docs = docsFor(entity).length;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: campus.short, to: `/campus/${campus.id}` }, { label: dep.name }]} /></div>

      {/* header */}
      <header className="card-surface rounded-2xl overflow-hidden grid md:grid-cols-[1fr_300px]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-pine-600 dark:text-gold-400 bg-pine-600/10 dark:bg-pine-500/15 px-2.5 py-1 rounded">{dep.abbr}</span>
            <span className="chip !text-[0.66rem]">{campus.name}</span>
          </div>
          <h1 className="font-display font-extrabold text-[1.7rem] sm:text-[2.3rem] leading-tight tracking-tight mt-3">{dep.name}</h1>
          <p className="text-[1rem] text-inksoft dark:text-pine-200/75 mt-1.5">{dep.tagline}</p>
          <p className="text-[0.88rem] text-inksoft dark:text-pine-200/65 mt-3 max-w-2xl leading-relaxed">{dep.overview}</p>
          <div className="flex flex-wrap items-center gap-4 mt-5 font-mono text-[0.74rem] text-inksoft dark:text-pine-200/60">
            <span className="flex items-center gap-1.5"><IExam size={14} className="text-pine-600 dark:text-gold-400" /> {exams} exam papers</span>
            <span className="flex items-center gap-1.5"><IDoc size={14} className="text-pine-600 dark:text-gold-400" /> {docs} documents</span>
            <span className="flex items-center gap-1.5"><IBook size={14} className="text-pine-600 dark:text-gold-400" /> {entity.topics.length} core areas</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <Link to={`/explained/${dep.id}`} className="btn-primary !py-2">Read “{dep.name} Explained” <IArrowR size={15} /></Link>
            <button onClick={() => document.getElementById("hub-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="btn-ghost !py-2">Jump to materials</button>
          </div>
        </div>
        <div className="imgframe !rounded-none h-44 md:h-full">
          <img src={dep.images[0]} alt={dep.name} className="w-full h-full object-cover" />
          <span className="absolute bottom-2 right-3 font-mono text-[0.62rem] text-pine-50 bg-pine-950/70 px-2 py-0.5 rounded">Field photo</span>
        </div>
      </header>

      {/* hub */}
      <div id="hub-tabs" className="mt-8 scroll-mt-24">
        <ResourceHub entity={entity} roomLabel={dep.name} />
      </div>
    </div>
  );
}

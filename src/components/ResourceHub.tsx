import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EntityRef, downloadExam, downloadDoc } from "../data/resources";
import { useContent, ContentExam, ContentDoc, ContentCourse } from "../data/content";
import { useStore } from "../lib/store";
import { EmptyState, KindBadge, LoadMore, Modal, Tabs } from "./ui";
import ChatRoom from "./ChatRoom";
import Lightbox from "./Lightbox";
import { IBook, IClock, IDoc, IDownload, IExam, IEye, IKey, ICheck, IX, ISpark } from "./icons";

const PAGE = 8;

export default function ResourceHub({ entity, roomLabel }: { entity: EntityRef; roomLabel: string }) {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "exams";
  const setTab = (t: string) => setParams(t === "exams" ? {} : { tab: t }, { replace: true });
  const { toast } = useStore();
  const content = useContent();

  const courses = useMemo(() => content.coursesFor(entity.id), [content, entity.id]);
  const exams = useMemo(() => content.examsFor(entity.id), [content, entity.id]);
  const docs = useMemo(() => content.docsFor(entity.id), [content, entity.id]);
  const photos = useMemo(() => content.photosFor(entity.id), [content, entity.id]);

  const [visible, setVisible] = useState(PAGE);
  const [examFilter, setExamFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [docQuery, setDocQuery] = useState("");
  const [openExam, setOpenExam] = useState<ContentExam | null>(null);
  const [examAnswers, setExamAnswers] = useState(false);
  const [openDoc, setOpenDoc] = useState<ContentDoc | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const years = useMemo(() => ["All", ...Array.from(new Set(exams.map((e) => e.year)))], [exams]);
  const kinds = useMemo(() => ["All", ...Array.from(new Set(exams.map((e) => e.type)))], [exams]);

  const filteredExams = useMemo(() => {
    let list = tab === "answers" ? exams.filter((e) => e.hasAnswers) : exams;
    if (examFilter !== "All") list = list.filter((e) => e.type === examFilter);
    if (yearFilter !== "All") list = list.filter((e) => e.year === yearFilter);
    return list;
  }, [exams, examFilter, yearFilter, tab]);

  const tabDocs = useMemo(() => {
    const kindMap: Record<string, ContentDoc["kind"][]> = {
      documents: ["Document", "Syllabus"], notes: ["Note"], pdfs: ["PDF"], materials: ["Material"],
    };
    const allowed = kindMap[tab];
    let list = allowed ? docs.filter((d) => allowed.includes(d.kind)) : docs;
    const q = docQuery.trim().toLowerCase();
    if (q) list = list.filter((d) => `${d.title} ${d.course}`.toLowerCase().includes(q));
    return list;
  }, [docs, tab, docQuery]);

  const changeTab = (t: string) => { setTab(t); setVisible(PAGE); setDocQuery(""); };

  const isDocTab = ["documents", "notes", "pdfs", "materials"].includes(tab);

  const addHref = (type: string) => `/admin?entity=${entity.id}&type=${type}`;

  const tabs = [
    { id: "exams", label: "Exams", count: exams.length },
    { id: "answers", label: "Answer Keys", count: exams.filter((e) => e.hasAnswers).length },
    { id: "courses", label: "Courses", count: courses.length },
    { id: "photos", label: "Photos", count: photos.length },
    { id: "documents", label: "Documents", count: docs.filter((d) => d.kind === "Document" || d.kind === "Syllabus").length },
    { id: "notes", label: "Notes", count: docs.filter((d) => d.kind === "Note").length },
    { id: "pdfs", label: "PDFs", count: docs.filter((d) => d.kind === "PDF").length },
    { id: "materials", label: "Materials", count: docs.filter((d) => d.kind === "Material").length },
    { id: "chat", label: "Chat" },
  ];

  const AddHint = ({ type, label }: { type: string; label: string }) => (
    <div className="text-center py-12">
      <p className="text-[0.95rem] text-inksoft dark:text-pine-200/60">Nothing here yet for <b className="text-ink dark:text-pine-100">{entity.name}</b>.</p>
      <p className="text-[0.82rem] text-inksoft dark:text-pine-200/45 mt-1.5">
        This archive is curated by the site owner — {label} are added from the dashboard.
      </p>
      <Link to={addHref(type)} className="btn-gold mt-4 inline-flex"><ISpark size={15} /> Add {label.toLowerCase()} via dashboard</Link>
    </div>
  );

  return (
    <div>
      <Tabs tabs={tabs} active={tab} onChange={changeTab} />

      <div className="pt-6">
        {/* ============ EXAMS / ANSWERS ============ */}
        {(tab === "exams" || tab === "answers") && (
          <div>
            {(examFilter !== "All" || yearFilter !== "All" || exams.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <div className="flex gap-1.5 flex-wrap">
                  {kinds.map((k) => (
                    <button key={k} onClick={() => { setExamFilter(k); setVisible(PAGE); }}
                      className={`text-[0.74rem] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                        examFilter === k ? "bg-pine-700 text-gold-200 border-pine-700" : "border-pine-600/25 text-inksoft dark:text-pine-200/70 hover:border-pine-600/60"}`}>{k}</button>
                  ))}
                </div>
                <span className="text-pine-300 dark:text-pine-700 hidden sm:inline">|</span>
                <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setVisible(PAGE); }} className="field !w-auto !py-1.5 text-[0.78rem] font-semibold">
                  {years.map((y) => <option key={y} value={y}>{y === "All" ? "All years" : y}</option>)}
                </select>
                {tab === "answers" && (
                  <p className="text-[0.74rem] font-mono text-pine-600 dark:text-gold-400 flex items-center gap-1"><IKey size={13} /> papers with answer keys</p>
                )}
              </div>
            )}

            {exams.length === 0 ? <AddHint type="exam" label="Exams" /> :
              filteredExams.length === 0 ? <EmptyState text="Try clearing the filters above." /> : (
              <div className="grid sm:grid-cols-2 gap-3.5">
                {filteredExams.slice(0, visible).map((ex) => (
                  <article key={ex.id}
                    className="card-surface rounded-xl p-4 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-pine-600 dark:border-l-pine-500">
                    <div className="flex items-start justify-between gap-2">
                      <KindBadge kind={ex.type} />
                      {ex.hasAnswers
                        ? <span className="text-[0.66rem] font-mono font-semibold text-pine-600 dark:text-gold-400 flex items-center gap-1"><IKey size={11} /> answers</span>
                        : <span className="text-[0.66rem] font-mono text-inksoft dark:text-pine-200/45">questions only</span>}
                    </div>
                    <h4 className="font-display font-bold text-[0.98rem] leading-snug mt-2.5 group-hover:text-pine-700 dark:group-hover:text-gold-400 transition-colors">{ex.title}</h4>
                    <p className="font-mono text-[0.7rem] text-inksoft dark:text-pine-200/55 mt-1">{ex.courseCode} · {ex.year} ({ex.gYear}) · Sem {ex.semester}</p>
                    <div className="flex items-center gap-3 text-[0.72rem] text-inksoft dark:text-pine-200/60 mt-2 font-mono">
                      <span className="flex items-center gap-1"><IClock size={12} /> {ex.duration}</span>
                      <span className="flex items-center gap-1"><IExam size={12} /> {ex.marks} marks</span>
                      <span>{ex.questions.length} Qs</span>
                    </div>
                    <div className="flex gap-2 mt-3.5">
                      <button onClick={() => { setOpenExam(ex); setExamAnswers(tab === "answers" && ex.hasAnswers); }}
                        className="btn-ghost !py-1.5 !px-3 text-[0.78rem]"><IEye size={14} /> View paper</button>
                      <button onClick={() => { downloadExam(ex, ex.hasAnswers); toast("Exam paper downloaded"); }}
                        className="btn-ghost !py-1.5 !px-3 text-[0.78rem]"><IDownload size={14} /> Download</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="mt-5"><LoadMore shown={Math.min(visible, filteredExams.length)} total={filteredExams.length} onMore={() => setVisible((v) => v + PAGE)} /></div>
          </div>
        )}

        {/* ============ COURSES ============ */}
        {tab === "courses" && (
          courses.length === 0 ? <AddHint type="course" label="Courses" /> : (
            <div className="grid sm:grid-cols-2 gap-3.5">
              {courses.map((c) => <CourseCard key={c.id} c={c} onExams={() => changeTab("exams")} />)}
            </div>
          )
        )}

        {/* ============ PHOTOS ============ */}
        {tab === "photos" && (
          photos.length === 0 ? <AddHint type="photo" label="Photos" /> : (
            <div>
              <p className="text-[0.8rem] text-inksoft dark:text-pine-200/60 mb-4 font-mono">Click any photo for full-screen view · zoom · arrow keys to navigate</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
                {photos.map((p, i) => (
                  <button key={p.id} onClick={() => setLightbox(i)} className="imgframe aspect-[3/2] text-left group/card">
                    <img src={p.src} alt={p.caption} loading="lazy" className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-pine-950/85 to-transparent">
                      <span className="block text-[0.72rem] font-semibold text-pine-50 leading-snug">{p.caption}</span>
                      <span className="block text-[0.62rem] font-mono text-gold-300 mt-0.5">{p.tag}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        {/* ============ DOCUMENTS / NOTES / PDFS / MATERIALS ============ */}
        {isDocTab && (
          docs.length === 0 ? <AddHint type="doc" label="Documents" /> : (
            <div>
              <div className="mb-4 max-w-sm">
                <input className="field" placeholder={`Search ${tab}…`} value={docQuery} onChange={(e) => { setDocQuery(e.target.value); setVisible(PAGE); }} />
              </div>
              {tabDocs.length === 0 ? <EmptyState text="No records match your search." /> : (
                <div className="space-y-2.5">
                  {tabDocs.slice(0, visible).map((doc) => (
                    <div key={doc.id} className="card-surface rounded-xl px-4 py-3 flex items-center gap-3.5 hover:shadow-md hover:-translate-y-px transition-all">
                      <span className="w-10 h-10 rounded-lg bg-pine-600/10 dark:bg-pine-500/15 text-pine-600 dark:text-gold-400 flex items-center justify-center shrink-0"><IDoc size={19} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[0.9rem] truncate">{doc.title}</p>
                        <p className="font-mono text-[0.68rem] text-inksoft dark:text-pine-200/55 mt-0.5">
                          {doc.course} · {doc.pages} pages · {doc.size} · updated {doc.updated}{doc.fileUrl ? " · file attached" : ""}
                        </p>
                      </div>
                      <KindBadge kind={doc.kind} />
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setOpenDoc(doc)} className="btn-ghost !py-1.5 !px-2.5 text-[0.74rem]" title="Preview"><IEye size={14} /></button>
                        <button onClick={() => { downloadDoc(doc); toast("Download started"); }} className="btn-ghost !py-1.5 !px-2.5 text-[0.74rem]" title="Download"><IDownload size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-5"><LoadMore shown={Math.min(visible, tabDocs.length)} total={tabDocs.length} onMore={() => setVisible((v) => v + PAGE)} /></div>
            </div>
          )
        )}

        {/* ============ CHAT ============ */}
        {tab === "chat" && (
          <div className="anim-fade">
            <ChatRoom roomId={entity.id} roomName={`${roomLabel} Chat`} height="h-[520px]" />
          </div>
        )}
      </div>

      <Modal open={!!openExam} onClose={() => setOpenExam(null)} wide title={openExam?.title ?? ""}>
        {openExam && <ExamPaperView paper={openExam} showAnswers={examAnswers} onToggle={(v) => setExamAnswers(v)} />}
      </Modal>

      <Modal open={!!openDoc} onClose={() => setOpenDoc(null)} title={openDoc?.title ?? ""}>
        {openDoc && <DocPreview doc={openDoc} onDownload={() => { downloadDoc(openDoc); toast("Download started"); }} />}
      </Modal>

      {lightbox !== null && <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />}
    </div>
  );
}

function CourseCard({ c, onExams }: { c: ContentCourse; onExams: () => void }) {
  return (
    <article className="card-surface rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.7rem] font-bold text-pine-600 dark:text-gold-400 bg-pine-600/10 dark:bg-pine-500/15 px-2 py-0.5 rounded">{c.code}</span>
        <span className="font-mono text-[0.68rem] text-inksoft dark:text-pine-200/55">{c.credits} CrHr · Sem {c.semester} · {c.level}</span>
      </div>
      <h4 className="font-display font-bold text-[1.02rem] mt-2">{c.title}</h4>
      <p className="text-[0.82rem] text-inksoft dark:text-pine-200/65 mt-1.5 leading-relaxed">{c.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {c.topics.slice(0, 4).map((t) => <span key={t} className="chip !text-[0.66rem]">{t}</span>)}
      </div>
      <button onClick={onExams} className="btn-ghost !py-1.5 !px-3 text-[0.76rem] mt-3.5"><IBook size={13} /> Browse past papers</button>
    </article>
  );
}

function ExamPaperView({ paper, showAnswers, onToggle }: { paper: ContentExam; showAnswers: boolean; onToggle: (v: boolean) => void }) {
  const { toast } = useStore();
  return (
    <div>
      <div className="border-2 border-pine-700/60 dark:border-pine-400/40 rounded-lg overflow-hidden mb-5">
        <div className="bg-pine-800 text-pine-50 px-4 py-3 text-center">
          <p className="font-mono text-[0.62rem] tracking-[0.24em] uppercase text-gold-400">Hawassa University · Exams &amp; Courses Archive</p>
          <p className="font-display font-extrabold text-[1.05rem] mt-1 leading-tight">{paper.title}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-pine-700/25 dark:divide-pine-400/20 text-center font-mono text-[0.7rem]">
          {[["Course", `${paper.courseCode}`], ["Semester", paper.semester], ["Time", paper.duration], ["Marks", `${paper.marks}`]].map(([k, v]) => (
            <div key={k as string} className="px-2 py-2"><p className="uppercase tracking-widest text-[0.58rem] text-inksoft dark:text-pine-200/50">{k}</p><p className="font-bold mt-0.5">{v}</p></div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button onClick={() => onToggle(!showAnswers)} className={showAnswers ? "btn-gold !py-1.5" : "btn-primary !py-1.5"}>
          {showAnswers ? <><IX size={14} /> Hide answer key</> : <><IKey size={14} /> Show answer key</>}
        </button>
        <button onClick={() => { downloadExam(paper, showAnswers); toast("Paper downloaded"); }} className="btn-ghost !py-1.5"><IDownload size={14} /> Download {showAnswers ? "with answers" : "paper"}</button>
        {!paper.hasAnswers && (
          <p className="text-[0.7rem] font-mono text-clay-500">No answer key was attached to this paper.</p>
        )}
      </div>

      <ol className="space-y-4">
        {paper.questions.map((qq, i) => (
          <li key={i} className="card-surface rounded-xl p-4">
            <p className="font-semibold text-[0.92rem] leading-relaxed">
              <span className="font-mono text-pine-600 dark:text-gold-400 mr-2">Q{i + 1}.</span>{qq.q}
            </p>
            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              {qq.o.map((o, j) => {
                const isAns = showAnswers && j === qq.a;
                return (
                  <p key={j} className={`flex items-start gap-2 text-[0.83rem] px-3 py-2 rounded-lg border transition-colors ${
                    isAns ? "bg-gold-400/20 border-gold-500/60 font-semibold" : "border-pine-600/12 dark:border-pine-500/15 text-inksoft dark:text-pine-200/75"}`}>
                    <span className={`font-mono font-bold shrink-0 ${isAns ? "text-gold-600 dark:text-gold-400" : "text-pine-600 dark:text-pine-300"}`}>{String.fromCharCode(65 + j)}.</span>
                    <span>{o}{isAns && <ICheck size={14} className="inline ml-1.5 text-pine-600 dark:text-gold-400" />}</span>
                  </p>
                );
              })}
            </div>
            {showAnswers && qq.e && (
              <p className="mt-2.5 text-[0.78rem] text-inksoft dark:text-pine-200/65 border-l-2 border-gold-500 pl-3 italic">{qq.e}</p>
            )}
          </li>
        ))}
      </ol>
      <p className="text-center font-mono text-[0.68rem] text-inksoft dark:text-pine-200/45 mt-5">— End of paper · {paper.year} ({paper.gYear}) —</p>
    </div>
  );
}

function DocPreview({ doc, onDownload }: { doc: ContentDoc; onDownload: () => void }) {
  const { toast } = useStore();
  return (
    <div>
      <div className="rounded-xl border-2 border-dashed border-pine-600/30 dark:border-pine-400/25 p-5 text-center mb-4">
        <span className="inline-flex w-12 h-12 rounded-xl bg-pine-600/10 dark:bg-pine-500/15 text-pine-600 dark:text-gold-400 items-center justify-center mb-2"><IDoc size={24} /></span>
        <p className="font-display font-bold">{doc.title}</p>
        <p className="font-mono text-[0.72rem] text-inksoft dark:text-pine-200/60 mt-1">{doc.course} · {doc.kind} · {doc.pages} pages · {doc.size}</p>
        <p className="font-mono text-[0.68rem] text-inksoft dark:text-pine-200/50">
          Last updated {doc.updated} · {doc.fileUrl ? "real file attached" : "no file attached yet"}
        </p>
      </div>
      {!doc.fileUrl && (
        <div className="space-y-2 mb-5">
          {[0.96, 0.8, 0.9, 0.7, 0.88, 0.6].map((w, i) => (
            <div key={i} className="skeleton h-3 rounded" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={() => toast(doc.fileUrl ? "Downloading the attached file" : "No file attached yet — ask the site owner to upload it", "info")} className="btn-primary !py-2"><IEye size={15} /> {doc.fileUrl ? "Open file" : "Open"}</button>
        <button onClick={onDownload} className="btn-gold !py-2"><IDownload size={15} /> Download</button>
      </div>
    </div>
  );
}

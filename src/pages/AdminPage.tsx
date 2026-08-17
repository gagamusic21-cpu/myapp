import React, { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { useContent, ENTITY_OPTIONS, entityLabel, fileToDataUrl } from "../data/content";
import { Question } from "../data/types";
import { AdItem } from "../data/types";
import { Breadcrumbs, EmptyState, Reveal, SectionHead, Tabs } from "../components/ui";
import { ILock, IMegaphone, IBell, ITrash, IShield, IExam, IPhoto, IDoc, IBook, IDownload, ISpark, IChip } from "../components/icons";

const PASSCODE = "hawassa2025";
const TYPE_TO_TAB: Record<string, string> = { exam: "exams", photo: "photos", doc: "docs", course: "courses" };
const cleanName = (n: string) => n.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();

function EntityPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const groups = Array.from(new Set(ENTITY_OPTIONS.map((e) => e.group)));
  return (
    <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>Choose a subject / department…</option>
      {groups.map((g) => (
        <optgroup key={g} label={g}>
          {ENTITY_OPTIONS.filter((e) => e.group === g).map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

const emptyQ = (): Question => ({ q: "", o: ["", "", "", ""], a: 0, e: "" });

function ExamForm({ entity, onEntity }: { entity: string; onEntity: (v: string) => void }) {
  const { addExam } = useContent();
  const { toast } = useStore();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [type, setType] = useState<"Midterm" | "Final" | "Quiz" | "Exit Exam">("Final");
  const [year, setYear] = useState("2017 E.C.");
  const [gYear, setGYear] = useState("2024/25");
  const [semester, setSemester] = useState<"I" | "II">("II");
  const [duration, setDuration] = useState("3 hrs");
  const [marks, setMarks] = useState(70);
  const [hasAnswers, setHasAnswers] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([emptyQ()]);

  const setQ = (i: number, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((qq, j) => (j === i ? { ...qq, ...patch } : qq)));
  const setOpt = (i: number, oi: number, val: string) =>
    setQuestions((qs) => qs.map((qq, j) => (j === i ? { ...qq, o: qq.o.map((o, k) => (k === oi ? val : o)) } : qq)));

  const submit = () => {
    if (!entity) { toast("Choose the subject / department first", "warn"); return; }
    if (title.trim().length < 4) { toast("Give the paper a title", "warn"); return; }
    const clean = questions
      .filter((qq) => qq.q.trim())
      .map((qq) => ({ ...qq, o: qq.o.map((o) => o.trim()).filter(Boolean) }))
      .filter((qq) => qq.o.length >= 2 && qq.a < qq.o.length);
    if (!clean.length) { toast("Add at least one question with 2+ options", "warn"); return; }
    addExam({
      entityKey: entity, title: title.trim(), course: course.trim() || title.trim(), courseCode: courseCode.trim() || "—",
      type, year: year.trim(), gYear: gYear.trim(), semester, duration: duration.trim(), marks, hasAnswers, questions: clean,
    });
    toast(`Exam published to “${entityLabel(entity)}”`);
    setTitle(""); setCourse(""); setCourseCode(""); setQuestions([emptyQ()]);
  };

  return (
    <div className="card-surface rounded-xl p-5 space-y-4">
      <p className="font-display font-bold flex items-center gap-2"><IExam size={17} className="text-pine-600 dark:text-gold-400" /> Publish an exam paper</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="lbl">Subject / department</label><EntityPicker value={entity} onChange={onEntity} /></div>
        <div className="sm:col-span-2"><label className="lbl">Paper title *</label><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mathematics — Final Exam 2016 E.C." /></div>
        <div><label className="lbl">Course name</label><input className="field" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Mathematics" /></div>
        <div><label className="lbl">Course code</label><input className="field" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. MATH 1011" /></div>
        <div><label className="lbl">Type</label>
          <select className="field" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {["Midterm", "Final", "Quiz", "Exit Exam"].map((t) => <option key={t}>{t}</option>)}
          </select></div>
        <div><label className="lbl">Semester</label>
          <select className="field" value={semester} onChange={(e) => setSemester(e.target.value as "I" | "II")}>{["I", "II"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className="lbl">Year (E.C.)</label><input className="field" value={year} onChange={(e) => setYear(e.target.value)} /></div>
        <div><label className="lbl">Gregorian</label><input className="field" value={gYear} onChange={(e) => setGYear(e.target.value)} /></div>
        <div><label className="lbl">Duration</label><input className="field" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
        <div><label className="lbl">Total marks</label><input type="number" className="field" value={marks} onChange={(e) => setMarks(Number(e.target.value) || 0)} /></div>
      </div>
      <label className="flex items-center gap-2 text-[0.85rem] font-semibold cursor-pointer">
        <input type="checkbox" checked={hasAnswers} onChange={(e) => setHasAnswers(e.target.checked)} className="w-4 h-4 accent-[#0E5A45]" />
        Include the answer key (shown under “Answer Keys”)
      </label>

      {/* question builder */}
      <div className="border-t hairline pt-4">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-inksoft dark:text-pine-200/55 mb-3">Questions ({questions.length})</p>
        <div className="space-y-4">
          {questions.map((qq, i) => (
            <div key={i} className="rounded-lg border hairline p-3.5 bg-pine-600/4 dark:bg-pine-500/6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[0.7rem] font-bold text-pine-600 dark:text-gold-400">Q{i + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-clay-500/15 text-clay-500" aria-label="Remove question"><ITrash size={14} /></button>
                )}
              </div>
              <input className="field" placeholder="Question text…" value={qq.q} onChange={(e) => setQ(i, { q: e.target.value })} />
              <div className="grid sm:grid-cols-2 gap-2 mt-2.5">
                {qq.o.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`ans-${i}`} checked={qq.a === oi} onChange={() => setQ(i, { a: oi })}
                      className="w-4 h-4 accent-[#C67E12] shrink-0" title="Mark as correct answer" />
                    <input className="field !py-1.5 text-[0.82rem]" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={o} onChange={(e) => setOpt(i, oi, e.target.value)} />
                  </div>
                ))}
              </div>
              <input className="field !py-1.5 text-[0.82rem] mt-2.5" placeholder="Explanation (optional, shown with the answer key)" value={qq.e} onChange={(e) => setQ(i, { e: e.target.value })} />
            </div>
          ))}
        </div>
        <button onClick={() => setQuestions((qs) => [...qs, emptyQ()])} className="btn-ghost mt-3 !py-1.5 text-[0.8rem]">+ Add another question</button>
      </div>

      <button onClick={submit} className="btn-primary w-full justify-center">Publish exam paper</button>
    </div>
  );
}

function PhotoForm({ entity, onEntity }: { entity: string; onEntity: (v: string) => void }) {
  const { addPhotos } = useContent();
  const { toast } = useStore();
  const [files, setFiles] = useState<{ name: string; dataUrl: string }[]>([]);
  const [tag, setTag] = useState("Exam paper");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = async (list: FileList | null) => {
    if (!list || !list.length) return;
    setBusy(true);
    const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) { toast("Only image files are allowed", "warn"); setBusy(false); return; }
    const loaded = await Promise.all(arr.map(async (f) => ({ name: f.name, dataUrl: await fileToDataUrl(f) })));
    setFiles((p) => [...p, ...loaded]);
    setBusy(false);
  };

  const submit = () => {
    if (!entity) { toast("Choose the subject / department first", "warn"); return; }
    if (!files.length) { toast("Choose at least one image", "warn"); return; }
    addPhotos(files.map((f) => ({
      entityKey: entity, src: f.dataUrl, tag: tag.trim() || "Photo",
      caption: caption.trim() ? `${caption.trim()} — ${cleanName(f.name)}` : cleanName(f.name),
    })));
    toast(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded`);
    setFiles([]); setCaption(""); if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="card-surface rounded-xl p-5 space-y-4">
      <p className="font-display font-bold flex items-center gap-2"><IPhoto size={17} className="text-pine-600 dark:text-gold-400" /> Upload exam photos &amp; answer sheets</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="lbl">Subject / department</label><EntityPicker value={entity} onChange={onEntity} /></div>
        <div><label className="lbl">Tag</label><input className="field" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Exam paper, Answer sheet, Lab" /></div>
        <div><label className="lbl">Caption prefix (optional)</label><input className="field" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Mathematics Final 2016" /></div>
      </div>

      <button onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl border-2 border-dashed border-pine-600/40 dark:border-pine-400/30 hover:border-gold-500/70 hover:bg-gold-400/8 transition-colors px-5 py-8 text-center group">
        <span className="inline-flex w-12 h-12 rounded-xl bg-pine-600/10 dark:bg-pine-500/15 text-pine-600 dark:text-gold-400 items-center justify-center mb-2 group-hover:scale-110 transition-transform"><IPhoto size={22} /></span>
        <p className="font-semibold text-[0.92rem]">{busy ? "Reading images…" : "Click to choose photos"}</p>
        <p className="text-[0.76rem] text-inksoft dark:text-pine-200/55 mt-1">JPG / PNG · you can select several at once · large images are auto-optimised</p>
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />

      {files.length > 0 && (
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-inksoft dark:text-pine-200/55 mb-2.5">Ready to upload ({files.length})</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {files.map((f, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border hairline group">
                <img src={f.dataUrl} alt={f.name} className="w-full h-24 object-cover" />
                <p className="absolute inset-x-0 bottom-0 text-[0.62rem] font-mono text-pine-50 bg-pine-950/70 px-1.5 py-0.5 truncate">{f.name}</p>
                <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} aria-label="Remove"
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-pine-950/80 text-pine-50 items-center justify-center hidden group-hover:flex"><ITrash size={12} /></button>
              </div>
            ))}
          </div>
          <button onClick={submit} className="btn-gold w-full justify-center mt-3.5">Upload {files.length} photo{files.length > 1 ? "s" : ""}</button>
        </div>
      )}
    </div>
  );
}

function DocForm({ entity, onEntity }: { entity: string; onEntity: (v: string) => void }) {
  const { addDoc } = useContent();
  const { toast } = useStore();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [kind, setKind] = useState<"Document" | "Note" | "PDF" | "Material" | "Syllabus">("Note");
  const [pages, setPages] = useState(10);
  const [file, setFile] = useState<{ dataUrl: string; name: string; size: string } | null>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    const size = f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`;
    const reader = new FileReader();
    reader.onload = () => setFile({ dataUrl: reader.result as string, name: f.name, size });
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!entity) { toast("Choose the subject / department first", "warn"); return; }
    if (title.trim().length < 4) { toast("Give the document a title", "warn"); return; }
    addDoc({
      entityKey: entity, title: title.trim(), course: course.trim() || title.trim(), kind, pages,
      size: file?.size ?? "—", updated: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      fileUrl: file?.dataUrl, fileName: file?.name,
    });
    toast(`${kind} published to “${entityLabel(entity)}”`);
    setTitle(""); setCourse(""); setFile(null);
  };

  return (
    <div className="card-surface rounded-xl p-5 space-y-4">
      <p className="font-display font-bold flex items-center gap-2"><IDoc size={17} className="text-pine-600 dark:text-gold-400" /> Publish a document, note or PDF</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="lbl">Subject / department</label><EntityPicker value={entity} onChange={onEntity} /></div>
        <div className="sm:col-span-2"><label className="lbl">Title *</label><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics — Unit-by-Unit Summary Notes" /></div>
        <div><label className="lbl">Course</label><input className="field" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Physics" /></div>
        <div><label className="lbl">Kind</label>
          <select className="field" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            {["Document", "Note", "PDF", "Material", "Syllabus"].map((k) => <option key={k}>{k}</option>)}
          </select></div>
        <div><label className="lbl">Pages</label><input type="number" className="field" value={pages} onChange={(e) => setPages(Number(e.target.value) || 1)} /></div>
        <div><label className="lbl">Attach file (optional)</label>
          <label className="field flex items-center gap-2 cursor-pointer !py-2">
            <IDownload size={15} className="rotate-180 text-pine-600 dark:text-gold-400 shrink-0" />
            <span className="truncate text-[0.82rem]">{file ? file.name : "Choose a PDF / Word / image file…"}</span>
            <input type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </label></div>
      </div>
      <button onClick={submit} className="btn-primary w-full justify-center">Publish document</button>
    </div>
  );
}

function CourseForm({ entity, onEntity }: { entity: string; onEntity: (v: string) => void }) {
  const { addCourse } = useContent();
  const { toast } = useStore();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState<"I" | "II" | "Year-long">("I");
  const [level, setLevel] = useState("Year I");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");

  const submit = () => {
    if (!entity) { toast("Choose the subject / department first", "warn"); return; }
    if (title.trim().length < 3) { toast("Give the course a title", "warn"); return; }
    addCourse({
      entityKey: entity, code: code.trim() || "—", title: title.trim(), credits, semester, level,
      description: description.trim() || "Course added by the site administrator.",
      topics: topics.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
    });
    toast(`Course added to “${entityLabel(entity)}”`);
    setCode(""); setTitle(""); setDescription(""); setTopics("");
  };

  return (
    <div className="card-surface rounded-xl p-5 space-y-4">
      <p className="font-display font-bold flex items-center gap-2"><IBook size={17} className="text-pine-600 dark:text-gold-400" /> Add a course</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="lbl">Subject / department</label><EntityPicker value={entity} onChange={onEntity} /></div>
        <div><label className="lbl">Course code</label><input className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. MATH 1011" /></div>
        <div><label className="lbl">Course title *</label><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Applied Mathematics I" /></div>
        <div><label className="lbl">Credits</label><input type="number" className="field" value={credits} onChange={(e) => setCredits(Number(e.target.value) || 1)} /></div>
        <div><label className="lbl">Semester</label>
          <select className="field" value={semester} onChange={(e) => setSemester(e.target.value as typeof semester)}>{["I", "II", "Year-long"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className="lbl">Level</label>
          <select className="field" value={level} onChange={(e) => setLevel(e.target.value)}>{["Year I", "Year II", "Year III", "Year IV", "Year V"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="lbl">Description</label><textarea rows={2} className="field resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this course cover?" /></div>
        <div className="sm:col-span-2"><label className="lbl">Topics (comma-separated)</label><input className="field" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="e.g. Limits, Derivatives, Integration" /></div>
      </div>
      <button onClick={submit} className="btn-primary w-full justify-center">Add course</button>
    </div>
  );
}

export default function AdminPage() {
  const store = useStore();
  const { toast } = store;
  const content = useContent();
  const [params] = useSearchParams();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("huec:admin") === "1");
  const [code, setCode] = useState("");
  const [tab, setTab] = useState(() => TYPE_TO_TAB[params.get("type") ?? ""] ?? "exams");
  const [entity, setEntity] = useState(params.get("entity") ?? "");
  const importRef = useRef<HTMLInputElement>(null);

  const tryAuth = () => {
    if (code === PASSCODE) { setAuthed(true); sessionStorage.setItem("huec:admin", "1"); toast("Welcome, administrator"); }
    else toast("Incorrect passcode", "warn");
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Staff dashboard" }]} /></div>
        <div className="card-surface rounded-2xl p-7 text-center shadow-lg">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-pine-700 text-gold-300 items-center justify-center mb-4"><ILock size={26} /></span>
          <h1 className="font-display font-extrabold text-[1.5rem]">Staff dashboard</h1>
          <p className="text-[0.86rem] text-inksoft dark:text-pine-200/65 mt-2">
            This is your control room. Every exam, photo, note and course on the site is added here — nothing is pre-filled.
          </p>
          <input type="password" className="field mt-5 text-center font-mono tracking-widest" placeholder="Passcode"
            value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && tryAuth()} />
          <button onClick={tryAuth} className="btn-primary w-full justify-center mt-3">Unlock dashboard</button>
          <p className="font-mono text-[0.66rem] text-inksoft dark:text-pine-200/45 mt-4">Demo passcode: <span className="text-pine-600 dark:text-gold-400 font-bold">hawassa2025</span></p>
        </div>
      </div>
    );
  }

  const remove = (kind: "exams" | "photos" | "docs" | "courses", id: string, label: string) => {
    content.removeItem(kind, id);
    toast(`Removed “${label}”`, "info");
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Staff dashboard" }]} /></div>
      <Reveal>
        <SectionHead eyebrow="Content management" title="Add & manage the archive"
          sub="You are the curator. Everything you publish here appears instantly for students and is saved on this device."
          right={<span className="chip shrink-0"><IShield size={12} /> Signed in as admin</span>} />
      </Reveal>

      {!content.storageOk && (
        <div className="rounded-xl border border-clay-500/50 bg-clay-500/10 px-4 py-3 mb-6 text-[0.82rem] text-clay-600 dark:text-clay-400">
          Browser storage is full — the latest change may not persist. Remove some large photos/files or export your content to keep a backup.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[["Exams", content.exams.length, <IExam key="a" size={15} />], ["Photos", content.photos.length, <IPhoto key="b" size={15} />], ["Documents", content.docs.length, <IDoc key="c" size={15} />], ["Courses", content.courses.length, <IBook key="d" size={15} />], ["Entities", content.stats.departments, <IChip key="e" size={15} />]].map(([k, v, i]) => (
          <div key={k as string} className="card-surface rounded-xl px-4 py-3">
            <p className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-wider text-inksoft dark:text-pine-200/55">{i}{k}</p>
            <p className="font-display font-extrabold text-[1.4rem] text-pine-700 dark:text-gold-400">{(v as number).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <Tabs active={tab} onChange={setTab} tabs={[
        { id: "exams", label: "Exams", count: content.exams.length },
        { id: "photos", label: "Photos", count: content.photos.length },
        { id: "docs", label: "Documents", count: content.docs.length },
        { id: "courses", label: "Courses", count: content.courses.length },
        { id: "announcements", label: "Announcements" },
        { id: "ads", label: "Ads" },
        { id: "data", label: "Data" },
      ]} />

      <div className="pt-6 pb-4">
        {tab === "exams" && (
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
            <ExamForm entity={entity} onEntity={setEntity} />
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-inksoft dark:text-pine-200/55 mb-2.5">Published exams</p>
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto scrollbar-thin pr-1">
                {content.exams.map((e) => (
                  <div key={e.id} className="card-surface rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[0.86rem] truncate">{e.title}</p>
                      <p className="font-mono text-[0.64rem] text-inksoft dark:text-pine-200/50 mt-0.5">{entityLabel(e.entityKey)} · {e.type} · {e.year} · {e.questions.length} Qs · {e.hasAnswers ? "answers ✓" : "no answers"}</p>
                    </div>
                    <button onClick={() => remove("exams", e.id, e.title)} className="p-1.5 rounded hover:bg-clay-500/15 text-clay-500 shrink-0" aria-label="Remove"><ITrash size={15} /></button>
                  </div>
                ))}
                {content.exams.length === 0 && <EmptyState text="No exams yet — publish your first one." />}
              </div>
            </div>
          </div>
        )}

        {tab === "photos" && (
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
            <PhotoForm entity={entity} onEntity={setEntity} />
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-inksoft dark:text-pine-200/55 mb-2.5">Uploaded photos</p>
              <div className="grid grid-cols-2 gap-2.5 max-h-[560px] overflow-y-auto scrollbar-thin pr-1">
                {content.photos.map((p) => (
                  <div key={p.id} className="relative rounded-lg overflow-hidden border hairline group">
                    <img src={p.src} alt={p.caption} className="w-full h-28 object-cover" />
                    <p className="absolute inset-x-0 bottom-0 text-[0.62rem] font-mono text-pine-50 bg-pine-950/70 px-1.5 py-0.5 truncate">{entityLabel(p.entityKey)} · {p.tag}</p>
                    <button onClick={() => remove("photos", p.id, p.caption)} aria-label="Remove"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-pine-950/80 text-pine-50 items-center justify-center hidden group-hover:flex"><ITrash size={12} /></button>
                  </div>
                ))}
                {content.photos.length === 0 && <div className="col-span-2"><EmptyState text="No photos yet — upload exam shots and answer sheets." /></div>}
              </div>
            </div>
          </div>
        )}

        {tab === "docs" && (
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
            <DocForm entity={entity} onEntity={setEntity} />
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-inksoft dark:text-pine-200/55 mb-2.5">Published documents</p>
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto scrollbar-thin pr-1">
                {content.docs.map((d) => (
                  <div key={d.id} className="card-surface rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[0.86rem] truncate">{d.title}</p>
                      <p className="font-mono text-[0.64rem] text-inksoft dark:text-pine-200/50 mt-0.5">{entityLabel(d.entityKey)} · {d.kind} · {d.pages} pages {d.fileUrl ? "· file attached" : "· no file"}</p>
                    </div>
                    <button onClick={() => remove("docs", d.id, d.title)} className="p-1.5 rounded hover:bg-clay-500/15 text-clay-500 shrink-0" aria-label="Remove"><ITrash size={15} /></button>
                  </div>
                ))}
                {content.docs.length === 0 && <EmptyState text="No documents yet — add notes, PDFs and handouts." />}
              </div>
            </div>
          </div>
        )}

        {tab === "courses" && (
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
            <CourseForm entity={entity} onEntity={setEntity} />
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-inksoft dark:text-pine-200/55 mb-2.5">Added courses</p>
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto scrollbar-thin pr-1">
                {content.courses.map((c) => (
                  <div key={c.id} className="card-surface rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[0.86rem] truncate">{c.title}</p>
                      <p className="font-mono text-[0.64rem] text-inksoft dark:text-pine-200/50 mt-0.5">{c.code} · {entityLabel(c.entityKey)} · {c.credits} CrHr</p>
                    </div>
                    <button onClick={() => remove("courses", c.id, c.title)} className="p-1.5 rounded hover:bg-clay-500/15 text-clay-500 shrink-0" aria-label="Remove"><ITrash size={15} /></button>
                  </div>
                ))}
                {content.courses.length === 0 && <EmptyState text="No courses yet — add the courses you teach." />}
              </div>
            </div>
          </div>
        )}

        {tab === "announcements" && <AnnouncementsTab />}
        {tab === "ads" && <AdsTab />}

        {tab === "data" && (
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
            <div className="card-surface rounded-xl p-5">
              <p className="font-display font-bold flex items-center gap-2"><ISpark size={16} className="text-pine-600 dark:text-gold-400" /> Preview with sample data</p>
              <p className="text-[0.82rem] text-inksoft dark:text-pine-200/65 mt-1.5">Loads a few clearly-labelled sample exams, documents and a course so you can see how a filled archive looks. Replace them with your own afterwards.</p>
              <button onClick={() => { content.loadDemo(); toast("Sample content loaded — replace it with your own"); }} className="btn-primary mt-3.5">Load sample content</button>
            </div>
            <div className="card-surface rounded-xl p-5">
              <p className="font-display font-bold flex items-center gap-2"><ITrash size={16} className="text-clay-500" /> Clear everything</p>
              <p className="text-[0.82rem] text-inksoft dark:text-pine-200/65 mt-1.5">Removes all exams, photos, documents and courses you have added. Announcements and ads are kept.</p>
              <button onClick={() => { if (window.confirm("Remove ALL content you have added?")) { content.clearAll(); toast("All content cleared", "info"); } }} className="btn-ghost mt-3.5 !text-clay-500 !border-clay-500/40 hover:!bg-clay-500/10">Clear all content</button>
            </div>
            <div className="card-surface rounded-xl p-5">
              <p className="font-display font-bold flex items-center gap-2"><IDownload size={16} className="text-pine-600 dark:text-gold-400" /> Backup / export</p>
              <p className="text-[0.82rem] text-inksoft dark:text-pine-200/65 mt-1.5">Download your whole archive as a JSON file. Keep a backup before clearing your browser data.</p>
              <button onClick={() => {
                const blob = new Blob([content.exportJson()], { type: "application/json" });
                const url = URL.createObjectURL(blob); const a = document.createElement("a");
                a.href = url; a.download = "hu-exams-courses-backup.json"; a.click(); URL.revokeObjectURL(url);
                toast("Backup downloaded");
              }} className="btn-primary mt-3.5">Export JSON backup</button>
            </div>
            <div className="card-surface rounded-xl p-5">
              <p className="font-display font-bold flex items-center gap-2"><IDownload size={16} className="rotate-180 text-pine-600 dark:text-gold-400" /> Restore / import</p>
              <p className="text-[0.82rem] text-inksoft dark:text-pine-200/65 mt-1.5">Import a JSON backup. This replaces the current archive content.</p>
              <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (content.importJson(reader.result as string)) toast("Backup restored");
                  else toast("That file is not a valid backup", "warn");
                };
                reader.readAsText(f);
                if (importRef.current) importRef.current.value = "";
              }} />
              <button onClick={() => importRef.current?.click()} className="btn-primary mt-3.5">Import JSON backup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementsTab() {
  const store = useStore();
  const { toast } = store;
  const [tag, setTag] = useState("Exams");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
      <form className="card-surface rounded-xl p-5 h-fit space-y-3" onSubmit={(e) => {
        e.preventDefault();
        if (title.trim().length < 5 || body.trim().length < 10) { toast("Title and body are too short", "warn"); return; }
        store.addAnnouncement({ tag, title: title.trim(), body: body.trim(), date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) });
        setTitle(""); setBody(""); toast("Announcement published");
      }}>
        <p className="font-display font-bold flex items-center gap-2"><IBell size={16} className="text-pine-600 dark:text-gold-400" /> Publish announcement</p>
        <select className="field" value={tag} onChange={(e) => setTag(e.target.value)}>
          {["Exams", "Uploads", "System", "IoT Campus", "Agricultural Campus", "Health Campus"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <input className="field" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} />
        <textarea className="field resize-none" rows={3} placeholder="Body…" value={body} onChange={(e) => setBody(e.target.value)} maxLength={300} />
        <button className="btn-primary w-full justify-center">Publish</button>
      </form>
      <div className="space-y-2.5">
        {store.announcements.map((a) => (
          <div key={a.id} className="card-surface rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="chip !text-[0.62rem] shrink-0 mt-0.5">{a.tag}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[0.88rem]">{a.title}</p>
              <p className="text-[0.76rem] text-inksoft dark:text-pine-200/60 mt-0.5 line-clamp-2">{a.body}</p>
              <p className="font-mono text-[0.62rem] text-inksoft dark:text-pine-200/45 mt-1">{a.date}</p>
            </div>
            <button onClick={() => { store.removeAnnouncement(a.id); toast("Announcement removed", "info"); }}
              className="p-1.5 rounded hover:bg-clay-500/15 text-clay-500 shrink-0" aria-label="Remove"><ITrash size={15} /></button>
          </div>
        ))}
        {store.announcements.length === 0 && <EmptyState text="No announcements." />}
      </div>
    </div>
  );
}

function AdsTab() {
  const store = useStore();
  const { toast } = store;
  const [eyebrow, setEyebrow] = useState("Sponsored");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("Learn more");
  const [offer, setOffer] = useState("");
  const [tone, setTone] = useState<AdItem["tone"]>("pine");
  return (
    <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
      <form className="card-surface rounded-xl p-5 h-fit space-y-3" onSubmit={(e) => {
        e.preventDefault();
        if (title.trim().length < 5) { toast("Ad title is too short", "warn"); return; }
        store.addAd({ eyebrow: eyebrow.trim() || "Sponsored", title: title.trim(), body: body.trim() || "Visit us near campus.", cta: cta.trim() || "Learn more", offer: offer.trim() || undefined, link: "#", tone });
        setTitle(""); setBody(""); setOffer(""); toast("Advertisement added to rotation");
      }}>
        <p className="font-display font-bold flex items-center gap-2"><IMegaphone size={16} className="text-pine-600 dark:text-gold-400" /> Create advertisement</p>
        <input className="field" placeholder="Eyebrow (e.g. Sponsored · Your shop)" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} maxLength={50} />
        <input className="field" placeholder="Headline" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={70} />
        <textarea className="field resize-none" rows={2} placeholder="Description…" value={body} onChange={(e) => setBody(e.target.value)} maxLength={180} />
        <div className="grid grid-cols-2 gap-2">
          <input className="field" placeholder="CTA button text" value={cta} onChange={(e) => setCta(e.target.value)} maxLength={28} />
          <input className="field" placeholder="Offer badge (optional)" value={offer} onChange={(e) => setOffer(e.target.value)} maxLength={30} />
        </div>
        <select className="field" value={tone} onChange={(e) => setTone(e.target.value as AdItem["tone"])}>
          <option value="pine">Tone: deep green</option><option value="gold">Tone: marigold</option><option value="night">Tone: night</option>
        </select>
        <button className="btn-gold w-full justify-center">Add to rotation</button>
      </form>
      <div className="space-y-2.5">
        {store.ads.map((a) => (
          <div key={a.id} className="card-surface rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-gold-400/25 text-gold-700 dark:text-gold-300 flex items-center justify-center shrink-0"><IMegaphone size={16} /></span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[0.88rem]">{a.title}</p>
              <p className="font-mono text-[0.66rem] text-inksoft dark:text-pine-200/50 mt-0.5">{a.eyebrow}{a.offer ? ` · ${a.offer}` : ""}</p>
            </div>
            <button onClick={() => { store.removeAd(a.id); toast("Ad removed", "info"); }}
              className="p-1.5 rounded hover:bg-clay-500/15 text-clay-500 shrink-0" aria-label="Remove"><ITrash size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CampusPhoto, Course, ExamPaper, Question, ResourceDoc } from "./types";
import { CAMPUSES, DEPARTMENTS } from "./campuses";
import { FRESHMAN_SUBJECTS } from "./freshman";
import { api } from "../lib/api";

/* ------------------------------------------------------------------ */
/* Content items = the platform types + which entity they belong to.  */
/* Everything here is created by the site owner via the dashboard.    */
/* ------------------------------------------------------------------ */
export interface ContentExam extends ExamPaper { entityKey: string; addedAt: number; }
export interface ContentPhoto extends CampusPhoto { entityKey: string; addedAt: number; }
export interface ContentDoc extends ResourceDoc { entityKey: string; addedAt: number; fileUrl?: string; fileName?: string; }
export interface ContentCourse extends Course { entityKey: string; addedAt: number; }

export interface ContentState {
  exams: ContentExam[];
  photos: ContentPhoto[];
  docs: ContentDoc[];
  courses: ContentCourse[];
}
const EMPTY: ContentState = { exams: [], photos: [], docs: [], courses: [] };

const ls = {
  get<T>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
  },
  set(key: string, value: unknown): boolean {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  },
  del(key: string) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

/* ---------------- entity picker options (freshman subjects + departments) ---------------- */
export interface EntityOption { key: string; label: string; group: string; }
const campusLabel = (id: string) =>
  id === "iot" ? "IoT Campus" : id === "agri" ? "Agricultural Campus" : id === "health" ? "Health Campus" : "Freshman";

export const ENTITY_OPTIONS: EntityOption[] = [
  ...FRESHMAN_SUBJECTS.map((s) => ({ key: s.id, label: s.name, group: "Freshman" })),
  ...DEPARTMENTS.map((d) => ({ key: d.id, label: d.name, group: campusLabel(d.campusId) })),
];
export const entityLabel = (key: string) => ENTITY_OPTIONS.find((e) => e.key === key)?.label ?? key;

/* ---------------- image intake: downscale to keep storage lean ---------------- */
export function fileToDataUrl(file: File, maxDim = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, w, h);
        try { resolve(canvas.toDataURL("image/jpeg", 0.82)); } catch { resolve(src); }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------------- demo content (loaded only on the owner's request) ---------------- */
const q = (question: string, options: string[], a: number, e?: string): Question => ({ q: question, o: options, a, e });
function buildDemo(): ContentState {
  const now = Date.now();
  const math: ContentExam = {
    entityKey: "mathematics", addedAt: now, id: "demo-math-final",
    title: "Mathematics — Final Exam 2016 E.C.", course: "Mathematics", courseCode: "MATH 1011",
    type: "Final", year: "2016 E.C.", gYear: "2023/24", semester: "II", duration: "3 hrs", marks: 70, hasAnswers: true,
    questions: [
      q("The derivative of f(x) = x² is…", ["2x", "x", "x²/2", "2"], 0, "Power rule: d/dx(xⁿ) = n·xⁿ⁻¹."),
      q("lim x→0 of (sin x)/x equals…", ["0", "1", "∞", "undefined"], 1, "A standard limit."),
      q("Solve for x: 2x + 6 = 0", ["x = 3", "x = −3", "x = 6", "x = −6"], 1, "2x = −6 → x = −3."),
    ],
  };
  const cosc: ContentExam = {
    entityKey: "computer-science", addedAt: now - 1000, id: "demo-cosc-exit",
    title: "Computer Science — Model Exit Exam (Set 1)", course: "Comprehensive", courseCode: "EXIT",
    type: "Exit Exam", year: "2017 E.C.", gYear: "2024/25", semester: "II", duration: "3 hrs 30 min", marks: 100, hasAnswers: true,
    questions: [
      q("Which data structure uses LIFO ordering?", ["Queue", "Stack", "Heap", "Graph"], 1, "A stack pops the most recently pushed item."),
      q("The object used to print output in C++ is…", ["cin", "cout", "scanf", "print()"], 1, "std::cout streams to standard output."),
    ],
  };
  const med: ContentExam = {
    entityKey: "medicine", addedAt: now - 2000, id: "demo-med-mid",
    title: "Medicine — Midterm Exam 2017 E.C.", course: "Human Anatomy", courseCode: "MED 2011",
    type: "Midterm", year: "2017 E.C.", gYear: "2024/25", semester: "I", duration: "1 hr 30 min", marks: 30, hasAnswers: true,
    questions: [
      q("The muscle that separates thoracic and abdominal cavities is the…", ["Heart", "Diaphragm", "Liver", "Spleen"], 1, "The diaphragm is the primary muscle of respiration."),
    ],
  };
  const syl: ContentDoc = {
    entityKey: "mathematics", addedAt: now - 3000, id: "demo-math-syl",
    title: "Mathematics — Course Syllabus & Outline", kind: "Syllabus", course: "Mathematics",
    pages: 8, size: "0.4 MB", updated: "Feb 2025",
  };
  const handout: ContentDoc = {
    entityKey: "computer-science", addedAt: now - 4000, id: "demo-cosc-pdf",
    title: "Computer Science — Data Structures Handout (PDF)", kind: "PDF", course: "Data Structures",
    pages: 64, size: "3.1 MB", updated: "Jan 2025",
  };
  const course: ContentCourse = {
    entityKey: "mathematics", addedAt: now - 5000, id: "demo-math-course",
    code: "MATH 1011", title: "Applied Mathematics I", credits: 4, semester: "I", level: "Year I",
    description: "Core freshman mathematics covering sets, functions, limits and differential calculus.",
    topics: ["Sets & Functions", "Limits & Continuity", "Derivatives", "Integration"],
  };
  return { exams: [math, cosc, med], photos: [], docs: [syl, handout], courses: [course] };
}

/* ---------------- context ---------------- */
interface ContentShape extends ContentState {
  examsFor: (key: string) => ContentExam[];
  photosFor: (key: string) => ContentPhoto[];
  docsFor: (key: string) => ContentDoc[];
  coursesFor: (key: string) => ContentCourse[];
  addExam: (e: Omit<ContentExam, "id" | "addedAt">) => void;
  addPhotos: (p: Omit<ContentPhoto, "id" | "addedAt">[]) => void;
  addDoc: (d: Omit<ContentDoc, "id" | "addedAt">) => void;
  addCourse: (c: Omit<ContentCourse, "id" | "addedAt">) => void;
  removeItem: (kind: keyof ContentState, id: string) => void;
  loadDemo: () => void;
  clearAll: () => void;
  exportJson: () => string;
  importJson: (text: string) => boolean;
  stats: { exams: number; docs: number; courses: number; photos: number; departments: number };
  recent: { id: string; label: string; kind: string; entity: string; addedAt: number }[];
  storageOk: boolean;
  /** "server" = hydrated from the REST API · "local" = device storage · "checking" = probing */
  conn: "checking" | "server" | "local";
}

const ContentCtx = createContext<ContentShape | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ContentState>(() => ls.get<ContentState>("huec:content", EMPTY));
  const [storageOk, setStorageOk] = useState(true);
  const [conn, setConn] = useState<"checking" | "server" | "local">("checking");
  const connRef = useRef(conn);
  useEffect(() => { connRef.current = conn; }, [conn]);

  useEffect(() => { setStorageOk(ls.set("huec:content", state)); }, [state]);

  /* ---- boot: hydrate from the REST API when one is configured & reachable ---- */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!api.enabled) { setConn("local"); return; }
      try {
        await api.ping();
        const snap = await api.snapshot();
        if (!alive) return;
        const ts = (d: string) => Date.parse(d) || Date.now();
        setState({
          exams: snap.exams.map(({ entityId, createdAt, ...e }) => ({ ...e, entityKey: entityId, addedAt: ts(createdAt) })),
          courses: snap.courses.map(({ entityId, createdAt, ...c }) => ({ ...c, entityKey: entityId, addedAt: ts(createdAt) })),
          docs: snap.documents.map(({ entityId, createdAt, fileName, fileData, ...d }) => ({
            ...d, entityKey: entityId, addedAt: ts(createdAt),
            fileName: fileName ?? undefined, fileUrl: fileData ?? undefined,
          })),
          photos: snap.photos.map(({ entityId, createdAt, ...p }) => ({ ...p, entityKey: entityId, addedAt: ts(createdAt) })),
        });
        setConn("server");
      } catch {
        if (alive) setConn("local");
      }
    })();
    return () => { alive = false; };
  }, []);

  /** Best-effort server write — the local copy is always updated immediately. */
  const sync = useCallback((fn: () => Promise<unknown>) => {
    if (connRef.current === "server") void fn().catch(() => { /* local copy remains as fallback */ });
  }, []);

  const examsFor = useCallback((k: string) => state.exams.filter((e) => e.entityKey === k), [state.exams]);
  const photosFor = useCallback((k: string) => state.photos.filter((e) => e.entityKey === k), [state.photos]);
  const docsFor = useCallback((k: string) => state.docs.filter((e) => e.entityKey === k), [state.docs]);
  const coursesFor = useCallback((k: string) => state.courses.filter((e) => e.entityKey === k), [state.courses]);

  const addExam: ContentShape["addExam"] = (e) => {
    const item: ContentExam = { ...e, id: `ex-${Date.now()}-${Math.floor(Math.random() * 1e4)}`, addedAt: Date.now() };
    setState((s) => ({ ...s, exams: [item, ...s.exams] }));
    sync(() => api.createExam(item.entityKey, item));
  };
  const addPhotos: ContentShape["addPhotos"] = (photos) => {
    const items: ContentPhoto[] = photos.map((p, i) => ({ ...p, id: `ph-${Date.now()}-${i}`, addedAt: Date.now() + i }));
    setState((s) => ({ ...s, photos: [...items, ...s.photos] }));
    items.forEach((p) => sync(() => api.createPhoto(p.entityKey, p)));
  };
  const addDoc: ContentShape["addDoc"] = (d) => {
    const item: ContentDoc = { ...d, id: `dc-${Date.now()}`, addedAt: Date.now() };
    setState((s) => ({ ...s, docs: [item, ...s.docs] }));
    // the attached file travels to the server as base64 `fileData`
    sync(() => api.createDocument(item.entityKey, { ...item, fileData: item.fileUrl }));
  };
  const addCourse: ContentShape["addCourse"] = (c) => {
    const item: ContentCourse = { ...c, id: `cr-${Date.now()}`, addedAt: Date.now() };
    setState((s) => ({ ...s, courses: [item, ...s.courses] }));
    sync(() => api.createCourse(item.entityKey, item));
  };
  const removeItem: ContentShape["removeItem"] = (kind, id) => {
    setState((s) => ({ ...s, [kind]: (s[kind] as { id: string }[]).filter((x) => x.id !== id) }));
    const coll = { exams: "exams", photos: "photos", docs: "documents", courses: "courses" }[kind] as
      | "exams" | "photos" | "documents" | "courses";
    sync(() => api.remove(coll, id));
  };

  const loadDemo = () => setState(buildDemo());
  const clearAll = () => { setState(EMPTY); ls.del("huec:content"); };
  const exportJson = () => JSON.stringify(state, null, 2);
  const importJson = (text: string) => {
    try {
      const parsed = JSON.parse(text) as Partial<ContentState>;
      setState({
        exams: Array.isArray(parsed.exams) ? (parsed.exams as ContentExam[]) : [],
        photos: Array.isArray(parsed.photos) ? (parsed.photos as ContentPhoto[]) : [],
        docs: Array.isArray(parsed.docs) ? (parsed.docs as ContentDoc[]) : [],
        courses: Array.isArray(parsed.courses) ? (parsed.courses as ContentCourse[]) : [],
      });
      return true;
    } catch { return false; }
  };

  const stats = useMemo(() => ({
    exams: state.exams.length, docs: state.docs.length, courses: state.courses.length,
    photos: state.photos.length, departments: DEPARTMENTS.length + FRESHMAN_SUBJECTS.length,
  }), [state]);

  const recent = useMemo(() => {
    const all = [
      ...state.exams.map((e) => ({ id: e.id, label: e.title, kind: "Exam", entity: entityLabel(e.entityKey), addedAt: e.addedAt })),
      ...state.docs.map((d) => ({ id: d.id, label: d.title, kind: d.kind, entity: entityLabel(d.entityKey), addedAt: d.addedAt })),
      ...state.photos.map((p) => ({ id: p.id, label: p.caption, kind: "Photo", entity: entityLabel(p.entityKey), addedAt: p.addedAt })),
      ...state.courses.map((c) => ({ id: c.id, label: c.title, kind: "Course", entity: entityLabel(c.entityKey), addedAt: c.addedAt })),
    ];
    return all.sort((a, b) => b.addedAt - a.addedAt).slice(0, 12);
  }, [state]);

  const value: ContentShape = {
    ...state, examsFor, photosFor, docsFor, coursesFor,
    addExam, addPhotos, addDoc, addCourse, removeItem,
    loadDemo, clearAll, exportJson, importJson, stats, recent, storageOk, conn,
  };
  return <ContentCtx.Provider value={value}>{children}</ContentCtx.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentCtx);
  if (!ctx) throw new Error("useContent outside provider");
  return ctx;
}

/* ---------------- global search index (catalog + owner content) ---------------- */
export interface SearchEntry {
  id: string; title: string; subtitle: string;
  category: "Campus" | "Subject" | "Department" | "Course" | "Exam" | "Document" | "Explained";
  href: string;
}
export function useSearchIndex(): SearchEntry[] {
  const content = useContent();
  return useMemo(() => {
    const idx: SearchEntry[] = [];
    CAMPUSES.forEach((c) => idx.push({ id: `camp-${c.id}`, title: c.name, subtitle: c.tagline, category: "Campus", href: `#/campus/${c.id}` }));
    FRESHMAN_SUBJECTS.forEach((s) =>
      idx.push({ id: `sub-${s.id}`, title: s.name, subtitle: `Freshman subject · ${s.code}`, category: "Subject", href: `#/campus/freshman/subject/${s.id}` }));
    DEPARTMENTS.forEach((dep) => {
      idx.push({ id: `dep-${dep.id}`, title: dep.name, subtitle: `${campusLabel(dep.campusId)} department`, category: "Department", href: `#/campus/${dep.campusId}/dept/${dep.id}` });
      idx.push({ id: `exp-${dep.id}`, title: `${dep.name} — Explained`, subtitle: "Overview, skills & career opportunities", category: "Explained", href: `#/explained/${dep.id}` });
    });
    content.courses.forEach((c) =>
      idx.push({ id: `c-${c.id}`, title: c.title, subtitle: `${c.code} · ${entityLabel(c.entityKey)} course`, category: "Course", href: `#/campus/${routeFor(c.entityKey)}` }));
    content.exams.forEach((e) =>
      idx.push({ id: `e-${e.id}`, title: e.title, subtitle: `${e.type} · ${e.year} · ${entityLabel(e.entityKey)}`, category: "Exam", href: `#/campus/${routeFor(e.entityKey)}?tab=exams` }));
    content.docs.forEach((d) =>
      idx.push({ id: `d-${d.id}`, title: d.title, subtitle: `${d.kind} · ${entityLabel(d.entityKey)}`, category: "Document", href: `#/campus/${routeFor(d.entityKey)}?tab=documents` }));
    return idx;
  }, [content.courses, content.exams, content.docs]);
}
function routeFor(entityKey: string): string {
  if (FRESHMAN_SUBJECTS.some((s) => s.id === entityKey)) return `freshman/subject/${entityKey}`;
  const dep = DEPARTMENTS.find((d) => d.id === entityKey);
  return dep ? `${dep.campusId}/dept/${dep.id}` : "freshman";
}

import { AdItem, Announcement, CampusPhoto, Course, Department, ExamPaper, FreshmanSubject, Question, ResourceDoc } from "./types";
import { CAMPUSES, DEPARTMENTS, FRESHMAN_LOOKUP } from "./campuses";
import { FRESHMAN_SUBJECTS } from "./freshman";

/* ---------------- deterministic pseudo-random ---------------- */
export const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const rand = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];

const EC_YEARS = [
  { ec: "2014", g: "2021/22" }, { ec: "2015", g: "2022/23" },
  { ec: "2016", g: "2023/24" }, { ec: "2017", g: "2024/25" },
];

/* ---------------- interface over subject OR department ---------------- */
export interface EntityRef {
  id: string;
  name: string;
  abbr: string;
  topics: string[];
  image: string;
  images: string[];
  kind: "subject" | "department";
  questions?: Question[];
}

export function deptEntity(dep: Department): EntityRef {
  return { id: dep.id, name: dep.name, abbr: dep.abbr, topics: dep.topics, image: dep.images[0], images: dep.images, kind: "department" };
}
export function subjectEntity(s: FreshmanSubject): EntityRef {
  return { id: s.id, name: s.name, abbr: s.code.split(" ")[0], topics: s.topics, image: s.image, images: [s.image], kind: "subject", questions: s.questions };
}

/* ---------------- courses ---------------- */
const courseCache = new Map<string, Course[]>();
export function coursesFor(e: EntityRef): Course[] {
  if (courseCache.has(e.id)) return courseCache.get(e.id)!;
  const r = rand(hash(e.id + ":courses"));
  const courses: Course[] = e.topics.slice(0, 6).map((topic, i) => {
    const code = `${e.abbr.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase()} ${101 + i * 11}`;
    const level = i < 2 ? "Year I" : i < 4 ? "Year II" : "Year III";
    return {
      id: `${e.id}-c${i}`, code, title: topic, credits: pick(r, [2, 3, 3, 4]),
      semester: i % 2 === 0 ? "I" : "II", level,
      description: `Core ${e.kind === "subject" ? "freshman subject" : "departmental"} course covering ${topic.toLowerCase()} — lectures, tutorials and practical sessions with continuous assessment and a final examination.`,
      topics: e.topics,
    };
  });
  courseCache.set(e.id, courses);
  return courses;
}

/* ---------------- exam questions (template-based for departments) ---------------- */
function shuffleOpts(key: string, opts: string[]): { o: string[]; a: number } {
  const r = rand(hash(key + opts[0]));
  const pos = Math.floor(r() * 4);
  const out = [...opts.slice(1)];
  out.splice(pos, 0, opts[0]);
  return { o: out, a: pos };
}
function buildQ(key: string, q: string, correct: string, wrong: string[], e?: string): Question {
  const s = shuffleOpts(key, [correct, ...wrong]);
  return { q, o: s.o, a: s.a, e };
}

function makeQuestions(e: EntityRef, course: string, seedStr: string, count: number): Question[] {
  if (e.questions && count <= e.questions.length) return e.questions.slice(0, count);
  const r = rand(hash(seedStr));
  const qs: Question[] = [];
  for (let i = 0; i < count; i++) {
    const topic = e.topics[Math.floor(r() * e.topics.length)];
    const others = e.topics.filter((t) => t !== topic);
    const k = `${seedStr}:q${i}`;
    const m = i % 4;
    if (m === 0) qs.push(buildQ(k,
      `In the context of ${course}, which statement best describes the focus of ${topic.toLowerCase()}?`,
      `The systematic study and application of ${topic.toLowerCase()} within professional practice`,
      [`A historical overview unrelated to ${course}`, "An optional skill rarely used by graduates", `The study of ${others[0].toLowerCase()} exclusively`],
      `${topic} is a core pillar of ${course} and is assessed in both continuous and final examinations.`));
    else if (m === 1) qs.push(buildQ(k,
      `A graduate applying ${topic.toLowerCase()} on the job would most likely…`,
      `Use established principles of ${topic.toLowerCase()} to analyse and solve practical problems`,
      ["Ignore safety and professional standards", `Rely only on ${others[1 % others.length].toLowerCase()}`, "Avoid quantitative reasoning entirely"],
      "Professional practice applies the theoretical core of the course to real situations."));
    else if (m === 2) qs.push(buildQ(k,
      `Which of the following is most closely associated with ${topic.toLowerCase()} in ${course}?`,
      `Core concepts, methods and terminology of ${topic.toLowerCase()}`,
      ["Unrelated general knowledge", `${others[2 % others.length].toLowerCase()} in a different discipline`, "Administrative filing procedures"],
      `Exam questions on this unit test the core concepts and methods of ${topic.toLowerCase()}.`));
    else qs.push(buildQ(k,
      `Before attempting advanced problems in ${topic.toLowerCase()}, students should first…`,
      `Master the definitions, principles and worked examples of ${topic.toLowerCase()}`,
      [`Skip the fundamentals of ${course}`, "Memorise answers without understanding", `Study ${others[3 % others.length].toLowerCase()} instead`],
      "Strong fundamentals are the most reliable path to exam success."));
  }
  if (e.questions) return [...e.questions, ...qs].slice(0, count);
  return qs;
}

/* ---------------- exams ---------------- */
const examCache = new Map<string, ExamPaper[]>();
export function examsFor(e: EntityRef): ExamPaper[] {
  if (examCache.has(e.id)) return examCache.get(e.id)!;
  const courses = coursesFor(e);
  const r = rand(hash(e.id + ":exams"));
  const exams: ExamPaper[] = [];
  courses.forEach((course, ci) => {
    EC_YEARS.forEach((y) => {
      (["Midterm", "Final"] as const).forEach((type) => {
        const seed = `${e.id}:${course.code}:${y.ec}:${type}`;
        exams.push({
          id: hash(seed).toString(36),
          title: `${course.title} — ${type} Exam ${y.ec} E.C.`,
          course: course.title, courseCode: course.code,
          type, year: `${y.ec} E.C.`, gYear: y.g,
          semester: type === "Midterm" ? (ci % 2 === 0 ? "I" : "II") : pick(r, ["I", "II"] as const),
          duration: type === "Midterm" ? "1 hr 30 min" : "3 hrs",
          marks: type === "Midterm" ? 30 + Math.floor(r() * 3) * 5 : 60 + Math.floor(r() * 3) * 10,
          hasAnswers: r() > 0.28,
          questions: makeQuestions(e, course.title, seed, e.kind === "subject" ? 5 : 6),
        });
      });
    });
  });
  for (let i = 0; i < 3; i++) {
    const seed = `${e.id}:exit:${i}`;
    exams.unshift({
      id: hash(seed).toString(36),
      title: `${e.name} — Model Exit Exam (Set ${i + 1})`,
      course: "Comprehensive", courseCode: "EXIT",
      type: "Exit Exam", year: "2017 E.C.", gYear: "2024/25", semester: "II",
      duration: "3 hrs 30 min", marks: 100, hasAnswers: true,
      questions: makeQuestions(e, "Comprehensive Review", seed, 8),
    });
  }
  examCache.set(e.id, exams);
  return exams;
}

/* ---------------- documents ---------------- */
const docCache = new Map<string, ResourceDoc[]>();
export function docsFor(e: EntityRef): ResourceDoc[] {
  if (docCache.has(e.id)) return docCache.get(e.id)!;
  const courses = coursesFor(e);
  const r = rand(hash(e.id + ":docs"));
  const docs: ResourceDoc[] = [];
  courses.forEach((c) => {
    docs.push({
      id: `${e.id}-syl-${c.id}`, title: `${c.title} — Course Syllabus & Outline`, kind: "Syllabus",
      course: c.title, pages: 6 + Math.floor(r() * 5), size: `${(0.3 + r() * 0.8).toFixed(1)} MB`, updated: pick(r, ["Jan 2025", "Oct 2024", "Sep 2024"]),
    });
    docs.push({
      id: `${e.id}-note-${c.id}`, title: `${c.title} — Unit-by-Unit Summary Notes`, kind: "Note",
      course: c.title, pages: 18 + Math.floor(r() * 30), size: `${(0.8 + r() * 2.4).toFixed(1)} MB`, updated: pick(r, ["Feb 2025", "Dec 2024", "Nov 2024"]),
    });
    docs.push({
      id: `${e.id}-pdf-${c.id}`, title: `${c.title} — Full Lecture Handout (PDF)`, kind: "PDF",
      course: c.title, pages: 60 + Math.floor(r() * 90), size: `${(2 + r() * 6).toFixed(1)} MB`, updated: pick(r, ["Jan 2025", "Nov 2024"]),
    });
    if (r() > 0.45) docs.push({
      id: `${e.id}-mat-${c.id}`, title: `${c.title} — Tutorial Sheets & Worked Examples`, kind: "Material",
      course: c.title, pages: 12 + Math.floor(r() * 20), size: `${(0.5 + r() * 1.5).toFixed(1)} MB`, updated: pick(r, ["Feb 2025", "Dec 2024"]),
    });
    if (r() > 0.6) docs.push({
      id: `${e.id}-doc-${c.id}`, title: `${c.title} — Laboratory / Field Manual`, kind: "Document",
      course: c.title, pages: 24 + Math.floor(r() * 24), size: `${(1 + r() * 3).toFixed(1)} MB`, updated: pick(r, ["Oct 2024", "Sep 2024"]),
    });
  });
  docs.sort((a, b) => b.updated.localeCompare(a.updated));
  docCache.set(e.id, docs);
  return docs;
}

/* ---------------- photos ---------------- */
const photoCache = new Map<string, CampusPhoto[]>();
const CAPTION_TAGS = ["Laboratory session", "Field practice", "Lecture & tutorial", "Campus environment", "Practical training"];
export function photosFor(e: EntityRef): CampusPhoto[] {
  if (photoCache.has(e.id)) return photoCache.get(e.id)!;
  const imgs = e.images.length ? e.images : [e.image];
  const photos: CampusPhoto[] = [];
  for (let round = 0; round < 2; round++) {
    imgs.forEach((src, i) => {
      photos.push({
        id: `${e.id}-p${round}-${i}`, src,
        caption: `${e.name} — ${CAPTION_TAGS[(i + round) % CAPTION_TAGS.length]}`,
        tag: CAPTION_TAGS[(i + round) % CAPTION_TAGS.length],
      });
    });
  }
  photoCache.set(e.id, photos);
  return photos;
}

/* ---------------- ads & announcements ---------------- */
export const DEFAULT_ADS: AdItem[] = [
  {
    id: "ad-techhub", eyebrow: "Sponsored · TechHub Hawassa", tone: "pine",
    title: "Laptop repair, accessories & student bundles",
    body: "Screen replacements, SSD upgrades and exam-season bundles. Show your HU student ID at TechHub, Piassa branch.",
    cta: "Get 15% student discount", link: "#/ad/techhub", offer: "15% OFF with student ID",
    image: "https://image.qwenlm.ai/generated-images/4babadf1-60e7-4bb8-9379-f2d1990113de/_result.png",
  },
  {
    id: "ad-bookcenter", eyebrow: "Sponsored · HU Book Centre", tone: "gold",
    title: "Freshman reference books & calculators in stock",
    body: "Complete freshman module books, scientific calculators and lab manuals — now available across the street from the main gate.",
    cta: "View this week's list", link: "#/ad/bookcentre", offer: "New stock every Monday",
    image: "https://image.qwenlm.ai/generated-images/41fd078c-7110-4d4a-ad4f-d61bbb302a28/_result.png",
  },
  {
    id: "ad-lakeside", eyebrow: "Sponsored · Lakeside Study Café", tone: "night",
    title: "Quiet study space + unlimited coffee, 50 m from campus",
    body: "Fast Wi-Fi, power at every seat and group rooms for exam week. Reserve a seat from your phone.",
    cta: "Reserve a seat", link: "#/ad/lakeside", offer: "First hour free, 5–8 PM",
    image: "https://image.qwenlm.ai/generated-images/57b57658-f987-4b68-8f1b-e5d0a59c5dda/_result.png",
  },
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", date: "Feb 21, 2025", tag: "Exams", title: "2017 E.C. Semester II midterm timetable released", body: "Midterm examinations for all campuses begin next Monday. Check your department page for room assignments and bring your student ID." },
  { id: "a2", date: "Feb 18, 2025", tag: "Uploads", title: "120+ freshman past papers added", body: "Previous exams with answer keys for Mathematics, Physics, Chemistry and Biology (2014–2016 E.C.) are now available under Freshman." },
  { id: "a3", date: "Feb 14, 2025", tag: "Health Campus", title: "Nursing & MLS clinical rotation materials", body: "Clinical procedure checklists and OSCE station guides have been uploaded to the Nursing and Medical Laboratory Science pages." },
  { id: "a4", date: "Feb 10, 2025", tag: "System", title: "Chat rooms now live for every department", body: "Every department and the freshman programme now has its own discussion room. Be respectful — moderators are active." },
  { id: "a5", date: "Feb 05, 2025", tag: "IoT Campus", title: "CoSc exit-exam model sets published", body: "Three model exit examination sets with worked answers are available on the Computer Science page under Exams." },
  { id: "a6", date: "Jan 28, 2025", tag: "Agricultural Campus", title: "Agronomy field manuals updated", body: "Plant Science and Horticulture field manuals now include the 2017 E.C. planting calendar for the Hawassa agro-ecology." },
];

/* ---------------- global search index ---------------- */
export interface SearchEntry {
  id: string;
  title: string;
  subtitle: string;
  category: "Campus" | "Subject" | "Department" | "Course" | "Exam" | "Document" | "Explained";
  href: string;
}
const campusLabel = (id: string) => (id === "iot" ? "IoT Campus" : id === "agri" ? "Agricultural Campus" : "Health Campus");

let searchIndex: SearchEntry[] | null = null;
export function getSearchIndex(): SearchEntry[] {
  if (searchIndex) return searchIndex;
  const idx: SearchEntry[] = [];
  CAMPUSES.forEach((c) => {
    idx.push({ id: `camp-${c.id}`, title: c.name, subtitle: c.tagline, category: "Campus", href: `#/campus/${c.id}` });
  });
  FRESHMAN_SUBJECTS.forEach((s) => {
    idx.push({ id: `sub-${s.id}`, title: s.name, subtitle: `Freshman subject · ${s.code}`, category: "Subject", href: `#/campus/freshman/subject/${s.id}` });
    coursesFor(subjectEntity(s)).forEach((c) =>
      idx.push({ id: `fc-${s.id}-${c.id}`, title: c.title, subtitle: `${c.code} · Freshman course`, category: "Course", href: `#/campus/freshman/subject/${s.id}?tab=courses` }));
    examsFor(subjectEntity(s)).slice(0, 8).forEach((ex) =>
      idx.push({ id: `fe-${ex.id}`, title: ex.title, subtitle: `${ex.type} · ${ex.year} (${ex.gYear})`, category: "Exam", href: `#/campus/freshman/subject/${s.id}?tab=exams` }));
  });
  DEPARTMENTS.forEach((dep) => {
    idx.push({ id: `dep-${dep.id}`, title: dep.name, subtitle: `${campusLabel(dep.campusId)} department`, category: "Department", href: `#/campus/${dep.campusId}/dept/${dep.id}` });
    idx.push({ id: `exp-${dep.id}`, title: `${dep.name} — Explained`, subtitle: "Overview, skills & career opportunities", category: "Explained", href: `#/explained/${dep.id}` });
    coursesFor(deptEntity(dep)).forEach((c) =>
      idx.push({ id: `dc-${dep.id}-${c.id}`, title: c.title, subtitle: `${c.code} · ${dep.abbr}`, category: "Course", href: `#/campus/${dep.campusId}/dept/${dep.id}?tab=courses` }));
    examsFor(deptEntity(dep)).slice(0, 6).forEach((ex) =>
      idx.push({ id: `de-${ex.id}`, title: ex.title, subtitle: `${ex.type} · ${ex.year} (${ex.gYear})`, category: "Exam", href: `#/campus/${dep.campusId}/dept/${dep.id}?tab=exams` }));
    docsFor(deptEntity(dep)).slice(0, 4).forEach((doc) =>
      idx.push({ id: `dd-${doc.id}`, title: doc.title, subtitle: `${doc.kind} · ${doc.size} · ${doc.pages} pages`, category: "Document", href: `#/campus/${dep.campusId}/dept/${dep.id}?tab=documents` }));
  });
  searchIndex = idx;
  return idx;
}

/* ---------------- stats ---------------- */
export const platformStats = () => {
  let exams = 0, docs = 0, courses = 0;
  FRESHMAN_SUBJECTS.forEach((s) => { const e = subjectEntity(s); exams += examsFor(e).length; docs += docsFor(e).length; courses += coursesFor(e).length; });
  DEPARTMENTS.forEach((dep) => { const e = deptEntity(dep); exams += examsFor(e).length; docs += docsFor(e).length; courses += coursesFor(e).length; });
  return { exams, docs, courses, departments: DEPARTMENTS.length + FRESHMAN_SUBJECTS.length };
};

/* ---------------- download helpers ---------------- */
export function downloadExam(paper: ExamPaper, withAnswers: boolean) {
  const lines: string[] = [
    "HAWASSA UNIVERSITY — EXAMS AND COURSES",
    "=".repeat(46),
    paper.title,
    `Course: ${paper.course} (${paper.courseCode})   Type: ${paper.type}`,
    `Year: ${paper.year} (${paper.gYear})   Semester: ${paper.semester}   Duration: ${paper.duration}   Marks: ${paper.marks}`,
    "=".repeat(46), "",
  ];
  paper.questions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q.q}`);
    q.o.forEach((o, j) => lines.push(`   ${String.fromCharCode(65 + j)}. ${o}${withAnswers && j === q.a ? "   [ANSWER]" : ""}`));
    if (withAnswers && q.e) lines.push(`   Explanation: ${q.e}`);
    lines.push("");
  });
  lines.push("— End of paper —", "Source: Hawassa University Exams & Courses (community archive)");
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${paper.title.replace(/[^\w]+/g, "_")}${withAnswers ? "_with_answers" : ""}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadDoc(doc: ResourceDoc) {
  const lines = [
    "HAWASSA UNIVERSITY — EXAMS AND COURSES",
    "=".repeat(46), doc.title, `Course: ${doc.course}`,
    `Type: ${doc.kind} · ${doc.pages} pages · ${doc.size} · Updated ${doc.updated}`,
    "=".repeat(46), "",
    "This is a placeholder for the full document.",
    "Uploads are managed by the site administrator through the staff dashboard.",
    "", "— End of preview —",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.title.replace(/[^\w]+/g, "_")}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

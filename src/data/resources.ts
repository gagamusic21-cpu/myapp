import { AdItem, Announcement, Department, ExamPaper, FreshmanSubject, Question, ResourceDoc } from "./types";

/* ---------------- deterministic hash (used for chat seeding & avatars) ---------------- */
export const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

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

/* ---------------- default ads & announcements ---------------- */
export const DEFAULT_ADS: AdItem[] = [
  {
    id: "ad-placeholder", eyebrow: "Your advertisement here", tone: "pine",
    title: "Reach every HU student on exam day",
    body: "This rotating banner is yours. Add your products and services from the Staff dashboard → Advertisements tab.",
    cta: "Learn how", link: "#/admin", offer: "Owner-managed",
  },
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: "a-welcome", date: "Today", tag: "System", title: "Welcome — this archive is ready for your content", body: "Open the Staff dashboard to add your first exam, photo, note or course. Everything you add appears instantly across the site." },
  { id: "a-guide", date: "Today", tag: "System", title: "How to publish past papers", body: "Staff dashboard → Exams: choose the campus and subject/department, fill the paper details, add questions with the builder, and toggle whether answers are included." },
];

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
  triggerDownload(lines.join("\n"), `${paper.title.replace(/[^\w]+/g, "_")}${withAnswers ? "_with_answers" : ""}.txt`);
}

export function downloadDoc(doc: ResourceDoc & { fileUrl?: string; fileName?: string }) {
  // If the owner attached a real file, hand it straight to the visitor.
  if (doc.fileUrl) {
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.download = doc.fileName || `${doc.title.replace(/[^\w]+/g, "_")}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  const lines = [
    "HAWASSA UNIVERSITY — EXAMS AND COURSES",
    "=".repeat(46), doc.title, `Course: ${doc.course}`,
    `Type: ${doc.kind} · ${doc.pages} pages · ${doc.size} · Updated ${doc.updated}`,
    "=".repeat(46), "",
    "No file has been attached to this record yet.",
    "The site owner can attach the real document from the Staff dashboard.",
    "", "— End of preview —",
  ];
  triggerDownload(lines.join("\n"), `${doc.title.replace(/[^\w]+/g, "_")}.txt`);
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

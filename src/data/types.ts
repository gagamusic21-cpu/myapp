export interface Question {
  q: string;
  o: string[];
  a: number; // correct option index
  e?: string; // explanation
}

export interface ExamPaper {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  type: "Midterm" | "Final" | "Quiz" | "Exit Exam";
  year: string; // e.g. 2017 E.C.
  gYear: string; // gregorian label
  semester: "I" | "II";
  duration: string;
  marks: number;
  questions: Question[];
  hasAnswers: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  semester: "I" | "II" | "Year-long";
  level: string;
  description: string;
  topics: string[];
}

export interface ResourceDoc {
  id: string;
  title: string;
  kind: "Document" | "Note" | "PDF" | "Material" | "Syllabus";
  course: string;
  pages: number;
  size: string;
  updated: string;
}

export interface CampusPhoto {
  id: string;
  src: string;
  caption: string;
  tag: string;
}

export interface Department {
  id: string;
  name: string;
  abbr: string;
  campusId: "iot" | "agri" | "health";
  tagline: string;
  overview: string;
  topics: string[];
  learns: string[];
  careers: string[];
  images: string[];
}

export interface FreshmanSubject {
  id: string;
  name: string;
  code: string;
  credits: number;
  tagline: string;
  overview: string;
  topics: string[];
  questions: Question[];
  image: string;
}

export interface CampusMeta {
  id: "freshman" | "iot" | "agri" | "health";
  name: string;
  short: string;
  tagline: string;
  description: string;
  image: string;
  accent: string;
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  body: string;
  tag: string;
}

export interface AdItem {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  link: string;
  offer?: string;
  image?: string;
  tone: "pine" | "gold" | "night";
}

export interface ChatMessage {
  id: string;
  room: string;
  author: string;
  text: string;
  time: number;
  replyTo?: { author: string; text: string };
  reported?: boolean;
  own?: boolean;
}

export const IMG = {
  campus: "https://image.qwenlm.ai/generated-images/57b57658-f987-4b68-8f1b-e5d0a59c5dda/_result.png",
  iotLab:"/images/iotcamp.jpg",
  agriField:"/images/agricamp.jpg",
  healthSim: "https://image.qwenlm.ai/generated-images/449a27ef-c3f9-4a47-9354-2adb2da2d86a/_result.png",
  lectureHall:"/images/freshman.webp",
  workshop: "https://image.qwenlm.ai/generated-images/49ea7afd-2179-4f23-a8cd-e458598680ee/_result.png",
  medLab: "https://image.qwenlm.ai/generated-images/059a50d6-329a-478b-9bb5-9a87e1a42221/_result.png",
  construction: "https://image.qwenlm.ai/generated-images/75826a2e-9b39-4435-b101-0a44e9009076/_result.png", 
  anthro: "/images/anthropology.jpg", 
  logic: "/images/logic.jpg",
  english1:"/images/english1.jpg",
  english2:"/images/english2.jpg",
  maths:"/images/maths.jpg",
  sport:"/images/sport.jpg",
  physics:"/images/physics.jpg",
  emerging:"/images/emerging.jpg",
  history:"/images/history.jpg",
  geography:"/images/geography.jpg",
  psychology:"/images/psychology.jpg",
  global:"/images/global.jpg",
  moral:"/images/moral.jpg",
  enter:"/images/enter.jpg",
  economy:"/images/economy.jpg",
  biology:"/images/biology.jpg",
  chemistry:"/images/chemistry.jpg",
  computer:"/images/computer.jpg",
  applied1:"/images/applied1.jpg",  
};

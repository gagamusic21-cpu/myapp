/**
 * API client for the huec-server REST API.
 *
 * - Base URL comes from the VITE_API_URL env variable.
 * - When VITE_API_URL is unset (or the server is unreachable) the app
 *   transparently falls back to local device storage — the UI never breaks.
 * - The JWT is stored in localStorage and sent as `Authorization: Bearer …`.
 */
import { AdItem, Announcement, CampusPhoto, ChatMessage, Course, ExamPaper, ResourceDoc } from "../data/types";

const BASE = ((import.meta.env.VITE_API_URL as string | undefined) || "").replace(/\/+$/, "");
const TOKEN_KEY = "huec:token";

export interface ServerUser {
  id: string;
  username: string;
  name: string;
  role: "OWNER" | "STAFF" | "STUDENT";
}

/** Shape returned by GET /api/snapshot */
export interface Snapshot {
  exams: (ExamPaper & { entityId: string; createdAt: string })[];
  courses: (Course & { entityId: string; createdAt: string })[];
  documents: (ResourceDoc & { entityId: string; createdAt: string; fileName?: string | null; fileData?: string | null })[];
  photos: (CampusPhoto & { entityId: string; createdAt: string })[];
  announcements: (Announcement & { createdAt: string })[];
  ads: (AdItem & { createdAt: string })[];
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

async function req<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  if (!BASE) throw new Error("API is not configured (VITE_API_URL)");
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), init?.timeoutMs ?? 10000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });
    if (!res.ok) {
      let msg = `Server responded ${res.status}`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) msg = body.error;
      } catch {
        /* keep default message */
      }
      throw new Error(msg);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(timer);
  }
}

export type Collection = "exams" | "courses" | "documents" | "photos" | "announcements" | "ads";

export const api = {
  /** true when a backend URL is configured at build time */
  enabled: !!BASE,
  base: BASE,

  /* ---------- meta ---------- */
  ping: () => req<{ ok: boolean }>("/api/health", { timeoutMs: 3500 }),
  stats: () => req<{ exams: number; docs: number; photos: number; courses: number; users: number }>("/api/stats"),
  snapshot: () => req<Snapshot>("/api/snapshot", { timeoutMs: 15000 }),

  /* ---------- auth ---------- */
  login: (username: string, password: string) =>
    req<{ token: string; user: ServerUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  signup: (username: string, password: string, name: string) =>
    req<{ token: string; user: ServerUser }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, password, name }),
    }),
  me: () => req<{ user: ServerUser }>("/api/auth/me"),

  /* ---------- content (staff writes) ---------- */
  createExam: (entityId: string, paper: Omit<ExamPaper, "id">) =>
    req<ExamPaper & { entityId: string }>("/api/exams", { method: "POST", body: JSON.stringify({ entityId, ...paper }) }),
  createCourse: (entityId: string, course: Omit<Course, "id">) =>
    req<Course & { entityId: string }>("/api/courses", { method: "POST", body: JSON.stringify({ entityId, ...course }) }),
  createDocument: (entityId: string, doc: Omit<ResourceDoc, "id"> & { fileName?: string; fileData?: string }) =>
    req<ResourceDoc & { entityId: string }>("/api/documents", { method: "POST", body: JSON.stringify({ entityId, ...doc }) }),
  createPhoto: (entityId: string, photo: Omit<CampusPhoto, "id">) =>
    req<CampusPhoto & { entityId: string }>("/api/photos", { method: "POST", body: JSON.stringify({ entityId, ...photo }), timeoutMs: 20000 }),
  createAnnouncement: (a: Omit<Announcement, "id">) =>
    req<Announcement>("/api/announcements", { method: "POST", body: JSON.stringify(a) }),
  createAd: (a: Omit<AdItem, "id">) => req<AdItem>("/api/ads", { method: "POST", body: JSON.stringify(a) }),
  remove: (collection: Collection, id: string) =>
    req<void>(`/api/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" }),

  /* ---------- chat ---------- */
  chatFor: (room: string) => req<ChatMessage[]>(`/api/chat/${encodeURIComponent(room)}`, { timeoutMs: 6000 }),
  postChat: (room: string, m: ChatMessage) =>
    req<ChatMessage>(`/api/chat/${encodeURIComponent(room)}`, { method: "POST", body: JSON.stringify(m) }),
  reportChat: (id: string) => req<void>(`/api/chat/message/${encodeURIComponent(id)}/report`, { method: "POST" }),
  deleteChat: (id: string) => req<void>(`/api/chat/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AdItem, Announcement, ChatMessage } from "../data/types";
import { DEFAULT_ADS, DEFAULT_ANNOUNCEMENTS, hash } from "../data/resources";
import { api } from "./api";

/* ---------- helpers ---------- */
const ls = {
  get<T>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
  },
  set(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } },
  del(key: string) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

export interface Identity { name: string; dept: string; }
export interface Toast { id: number; kind: "success" | "info" | "warn"; text: string; }

interface StoreShape {
  theme: "light" | "dark";
  toggleTheme: () => void;
  identity: Identity | null;
  setIdentity: (i: Identity | null) => void;
  toasts: Toast[];
  toast: (text: string, kind?: Toast["kind"]) => void;
  messagesFor: (room: string) => ChatMessage[];
  sendMessage: (room: string, text: string, replyTo?: ChatMessage["replyTo"]) => void;
  deleteMessage: (room: string, id: string) => void;
  reportMessage: (room: string, id: string) => void;
  hydrateFromServer: (room: string, msgs: ChatMessage[]) => void;
  announcements: Announcement[];
  addAnnouncement: (a: Omit<Announcement, "id">) => void;
  removeAnnouncement: (id: string) => void;
  ads: AdItem[];
  addAd: (a: Omit<AdItem, "id">) => void;
  removeAd: (id: string) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
}

const StoreCtx = createContext<StoreShape | null>(null);

/* ---------- seed chat content ---------- */
const NAMES = ["Abebe K.", "Hanna T.", "Dawit M.", "Selam A.", "Yonas G.", "Meron B.", "Bereket L.", "Tigist F.", "Samuel D.", "Almaz H.", "Liya W.", "Kebede S."];
const SEED_TEXTS = [
  "Has anyone seen the 2016 E.C. final for this course? The one in the archive is missing page 3.",
  "The summary notes under Documents cover units 1–4, that's enough for the midterm.",
  "Reminder: tutorial sheet 3 is due Friday before the lab session.",
  "Can someone explain the last question on the model exit exam? I keep getting a different answer.",
  "Forming a study group for the weekend — library, second floor. DM me.",
  "The answers uploaded yesterday match the ones we got in class. Safe to use.",
  "Tip: past papers repeat a lot of the definitions — drill those first.",
  "Does anyone have the handout for unit 5? My copy is torn.",
];

function seedRoom(room: string): ChatMessage[] {
  const r0 = hash("seed:" + room);
  const count = 4 + (r0 % 4);
  const now = Date.now();
  const msgs: ChatMessage[] = [];
  for (let i = 0; i < count; i++) {
    const r = hash(`${room}:${i}`);
    msgs.push({
      id: `${room}-seed-${i}`,
      room,
      author: NAMES[r % NAMES.length],
      text: SEED_TEXTS[(r0 + i * 3) % SEED_TEXTS.length],
      time: now - (count - i) * (14 + (r % 40)) * 60000,
    });
  }
  return msgs;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => ls.get<"light" | "dark">("huec:theme", "light"));
  const [identity, setIdentityState] = useState<Identity | null>(() => ls.get<Identity | null>("huec:user", null));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [customAnn, setCustomAnn] = useState<Announcement[]>(() => ls.get<Announcement[]>("huec:announcements", []));
  const [customAds, setCustomAds] = useState<AdItem[]>(() => ls.get<AdItem[]>("huec:ads", []));
  const [removedAnn, setRemovedAnn] = useState<string[]>(() => ls.get<string[]>("huec:ann-rm", []));
  const [removedAds, setRemovedAds] = useState<string[]>(() => ls.get<string[]>("huec:ads-rm", []));
  const [searchOpen, setSearchOpen] = useState(false);
  const toastId = useRef(1);
  const [serverAnn, setServerAnn] = useState<Announcement[]>([]);
  const [serverAds, setServerAds] = useState<AdItem[]>([]);
  const reachRef = useRef<boolean | null>(null);

  /** Fire-and-forget server write; only attempted once the API is known to be reachable. */
  const serverWrite = useCallback((fn: () => Promise<unknown>) => {
    if (!api.enabled) return;
    const go = () => void fn().catch(() => { /* local copy remains */ });
    if (reachRef.current === true) return go();
    void api.ping()
      .then(() => { reachRef.current = true; go(); })
      .catch(() => { reachRef.current = false; });
  }, []);

  /* boot: pull server-published announcements & ads when an API is configured */
  useEffect(() => {
    if (!api.enabled) return;
    let alive = true;
    api.snapshot()
      .then((snap) => {
        if (!alive) return;
        setServerAnn(snap.announcements.map(({ createdAt, ...a }) => a));
        setServerAds(snap.ads.map(({ createdAt, ...a }) => a));
        reachRef.current = true;
      })
      .catch(() => { reachRef.current = false; });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    ls.set("huec:theme", theme);
  }, [theme]);

  const toast = useCallback((text: string, kind: Toast["kind"] = "success") => {
    const id = toastId.current++;
    setToasts((t) => [...t, { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const messagesFor = useCallback((room: string): ChatMessage[] => {
    if (chats[room]) return chats[room];
    return ls.get<ChatMessage[] | null>(`huec:chat:${room}`, null) ?? seedRoom(room);
  }, [chats]);

  const persist = (room: string, msgs: ChatMessage[]) => {
    setChats((c) => ({ ...c, [room]: msgs }));
    ls.set(`huec:chat:${room}`, msgs.slice(-120));
  };

  const sendMessage = useCallback((room: string, text: string, replyTo?: ChatMessage["replyTo"]) => {
    const who = identity?.name ?? "Guest Student";
    const msg: ChatMessage = { id: `${room}-${Date.now()}`, room, author: who, text, time: Date.now(), replyTo, own: true };
    const cur = ls.get<ChatMessage[] | null>(`huec:chat:${room}`, null) ?? seedRoom(room);
    persist(room, [...cur, msg]);
    serverWrite(() => api.postChat(room, msg));
  }, [identity, serverWrite]);

  const deleteMessage = useCallback((room: string, id: string) => {
    const cur = ls.get<ChatMessage[] | null>(`huec:chat:${room}`, null) ?? seedRoom(room);
    persist(room, cur.filter((m) => m.id !== id));
    serverWrite(() => api.deleteChat(id));
  }, [serverWrite]);

  const reportMessage = useCallback((room: string, id: string) => {
    const cur = ls.get<ChatMessage[] | null>(`huec:chat:${room}`, null) ?? seedRoom(room);
    persist(room, cur.map((m) => (m.id === id ? { ...m, reported: true } : m)));
    serverWrite(() => api.reportChat(id));
  }, [serverWrite]);

  /** Merge server-fetched messages with the local conversation (deduped by id). */
  const hydrateFromServer = useCallback((room: string, msgs: ChatMessage[]) => {
    const local = ls.get<ChatMessage[] | null>(`huec:chat:${room}`, null) ?? [];
    const map = new Map<string, ChatMessage>();
    [...msgs, ...local].forEach((m) => map.set(m.id, m));
    persist(room, [...map.values()].sort((a, b) => a.time - b.time));
  }, []);

  const setIdentity = useCallback((i: Identity | null) => { setIdentityState(i); if (i) ls.set("huec:user", i); else ls.del("huec:user"); }, []);

  const announcements = useMemo(
    () => [...customAnn, ...serverAnn, ...DEFAULT_ANNOUNCEMENTS].filter((a) => !removedAnn.includes(a.id)),
    [customAnn, serverAnn, removedAnn]);
  const ads = useMemo(
    () => [...customAds, ...serverAds, ...DEFAULT_ADS].filter((a) => !removedAds.includes(a.id)),
    [customAds, serverAds, removedAds]);

  const value: StoreShape = {
    theme, toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    identity, setIdentity, toasts, toast,
    messagesFor, sendMessage, deleteMessage, reportMessage, hydrateFromServer,
    announcements,
    addAnnouncement: (a) => {
      const full = { ...a, id: `ca-${Date.now()}` };
      setCustomAnn((c) => { const n = [full, ...c]; ls.set("huec:announcements", n); return n; });
      serverWrite(() => api.createAnnouncement(a));
    },
    removeAnnouncement: (id) => {
      setRemovedAnn((c) => { const n = [...c, id]; ls.set("huec:ann-rm", n); return n; });
      serverWrite(() => api.remove("announcements", id));
    },
    ads,
    addAd: (a) => {
      const full = { ...a, id: `cad-${Date.now()}` };
      setCustomAds((c) => { const n = [full, ...c]; ls.set("huec:ads", n); return n; });
      serverWrite(() => api.createAd(a));
    },
    removeAd: (id) => {
      setRemovedAds((c) => { const n = [...c, id]; ls.set("huec:ads-rm", n); return n; });
      serverWrite(() => api.remove("ads", id));
    },
    searchOpen, setSearchOpen,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

/* ---------- time formatting ---------- */
export function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  return new Date(t).toLocaleDateString();
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStore, timeAgo } from "../lib/store";
import { ChatMessage } from "../data/types";
import { hash } from "../data/resources";
import { api } from "../lib/api";
import { DEPARTMENTS } from "../data/campuses";
import { IChat, IFlag, IReply, ISearch, ISend, IShield, ITrash, IUser, IX } from "./icons";

const AVATAR_COLORS = ["#0E5A45", "#B03A48", "#1D6FA3", "#C67E12", "#3E7C2F", "#7A4A9E", "#C4552F", "#0F766E"];
const avatarColor = (name: string) => AVATAR_COLORS[hash(name) % AVATAR_COLORS.length];

export default function ChatRoom({ roomId, roomName, height = "h-[440px]" }: { roomId: string; roomName: string; height?: string }) {
  const store = useStore();
  const { identity, setIdentity, toast } = store;
  const messages = store.messagesFor(roomId);
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<ChatMessage | null>(null);
  const [filter, setFilter] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [deptInput, setDeptInput] = useState("Freshman");
  const listRef = useRef<HTMLDivElement>(null);

  const online = useMemo(() => 7 + (hash(roomId) % 38), [roomId]);

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return messages;
    return messages.filter((m) => `${m.author} ${m.text}`.toLowerCase().includes(f));
  }, [messages, filter]);

  useEffect(() => {
    const el = listRef.current;
    if (el && !filter) el.scrollTop = el.scrollHeight;
  }, [messages.length, filter]);

  /* pull the shared conversation from the server when one is configured */
  useEffect(() => {
    if (!api.enabled) return;
    let alive = true;
    api.chatFor(roomId)
      .then((msgs) => { if (alive) store.hydrateFromServer(roomId, msgs); })
      .catch(() => { /* offline: local conversation only */ });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const saveProfile = () => {
    const n = nameInput.trim();
    if (n.length < 2) { toast("Enter a display name (at least 2 characters)", "warn"); return; }
    if (n.length > 24) { toast("Name too long (max 24 characters)", "warn"); return; }
    setIdentity({ name: n, dept: deptInput });
    toast(`Welcome, ${n}! You can now chat.`);
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    if (text.length > 600) { toast("Message is too long (max 600 characters)", "warn"); return; }
    store.sendMessage(roomId, text, reply ? { author: reply.author, text: reply.text } : undefined);
    setDraft("");
    setReply(null);
  };

  if (!identity) {
    return (
      <div className={`card-surface rounded-xl p-6 ${height} flex flex-col items-center justify-center text-center`}>
        <span className="w-12 h-12 rounded-xl bg-pine-600/10 text-pine-600 dark:text-gold-400 flex items-center justify-center mb-3"><IUser size={24} /></span>
        <h4 className="font-display font-bold text-lg">Join the discussion</h4>
        <p className="text-[0.85rem] text-inksoft dark:text-pine-200/60 mt-1 max-w-sm">Set a display name to start asking questions and helping classmates in {roomName}.</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full max-w-md">
          <input className="field" placeholder="Display name (e.g. Hanna T.)" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveProfile()} maxLength={24} />
          <select className="field sm:w-44" value={deptInput} onChange={(e) => setDeptInput(e.target.value)}>
            <option>Freshman</option>
            {DEPARTMENTS.map((d) => <option key={d.id}>{d.name}</option>)}
            <option>Visitor</option>
          </select>
          <button onClick={saveProfile} className="btn-primary justify-center">Join</button>
        </div>
        <p className="text-[0.7rem] font-mono text-inksoft/70 dark:text-pine-200/40 mt-3">Stored on this device only · be respectful, moderators are active</p>
      </div>
    );
  }

  return (
    <div className={`card-surface rounded-xl overflow-hidden flex flex-col ${height}`}>
      {/* header */}
      <div className="px-4 py-3 border-b hairline flex items-center gap-3 bg-pine-600/5 dark:bg-pine-500/8">
        <span className="w-9 h-9 rounded-lg bg-pine-700 text-gold-300 flex items-center justify-center shrink-0"><IChat size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-[0.95rem] leading-tight truncate">{roomName}</p>
          <p className="text-[0.7rem] font-mono text-inksoft dark:text-pine-200/60 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pine-500 pulse-dot" /> {online} online · {messages.length} messages
          </p>
        </div>
        <button onClick={() => setShowSearch(!showSearch)} className={`p-2 rounded-lg transition-colors ${showSearch ? "bg-pine-600/15 text-pine-700 dark:text-gold-400" : "hover:bg-pine-600/10"}`} aria-label="Search messages">
          <ISearch size={16} />
        </button>
      </div>

      {showSearch && (
        <div className="px-4 py-2 border-b hairline flex items-center gap-2 anim-fade">
          <input autoFocus className="field !py-1.5 text-[0.82rem]" placeholder="Search in this conversation…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          {filter && <button onClick={() => setFilter("")} className="p-1.5 shrink-0" aria-label="Clear search"><IX size={15} /></button>}
        </div>
      )}

      {/* messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3 ruled">
        {visible.length === 0 && (
          <p className="text-center text-[0.82rem] text-inksoft dark:text-pine-200/50 py-8">
            {filter ? "No messages match your search." : "No messages yet — start the conversation!"}
          </p>
        )}
        {visible.map((m) => (
          <div key={m.id} className={`group flex gap-2.5 ${m.own ? "flex-row-reverse" : ""}`}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[0.72rem] font-bold text-pine-50 shrink-0 mt-0.5"
              style={{ background: avatarColor(m.author) }}>{m.author.charAt(0).toUpperCase()}</span>
            <div className={`max-w-[78%] min-w-0 ${m.own ? "text-right" : ""}`}>
              <div className="flex items-baseline gap-2 mb-0.5 justify-start">
                <span className="text-[0.74rem] font-bold">{m.author}</span>
                {m.author === identity.name && <span className="text-[0.62rem] font-mono text-pine-600 dark:text-gold-400">(you)</span>}
                <span className="text-[0.64rem] font-mono text-inksoft dark:text-pine-200/45">{timeAgo(m.time)}</span>
                {m.reported && <span className="text-[0.62rem] font-mono text-clay-500 flex items-center gap-0.5"><IFlag size={10} /> reported</span>}
              </div>
              <div className={`inline-block text-left rounded-xl px-3 py-2 text-[0.86rem] leading-relaxed border transition-colors ${
                m.own ? "bg-pine-700 text-pine-50 border-pine-600" : "bg-card dark:bg-night-3 border-pine-600/12 dark:border-pine-500/15"} ${m.reported ? "opacity-60" : ""}`}>
                {m.replyTo && (
                  <p className={`text-[0.7rem] mb-1.5 pl-2 border-l-2 ${m.own ? "border-gold-400/70 text-pine-200/85" : "border-pine-400 text-inksoft dark:text-pine-200/60"}`}>
                    <span className="font-bold">{m.replyTo.author}:</span> {m.replyTo.text.length > 70 ? m.replyTo.text.slice(0, 70) + "…" : m.replyTo.text}
                  </p>
                )}
                {m.text}
              </div>
              {/* actions */}
              <div className={`flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${m.own ? "justify-end" : ""}`}>
                <button onClick={() => { setReply(m); }} className="p-1 rounded hover:bg-pine-600/10 text-inksoft dark:text-pine-200/60" title="Reply"><IReply size={13} /></button>
                {m.own && (
                  <button onClick={() => { store.deleteMessage(roomId, m.id); toast("Message deleted", "info"); }}
                    className="p-1 rounded hover:bg-clay-500/15 text-clay-500" title="Delete (your message)"><ITrash size={13} /></button>
                )}
                {!m.own && !m.reported && (
                  <button onClick={() => { store.reportMessage(roomId, m.id); toast("Message reported to moderators", "info"); }}
                    className="p-1 rounded hover:bg-clay-500/15 text-inksoft dark:text-pine-200/60 hover:text-clay-500" title="Report"><IFlag size={13} /></button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* composer */}
      <div className="border-t hairline p-3 bg-pine-600/4 dark:bg-pine-500/6">
        {reply && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-gold-400/15 border border-gold-500/30 text-[0.75rem] anim-fade">
            <IReply size={13} className="text-gold-600 dark:text-gold-400 shrink-0" />
            <span className="truncate">Replying to <b>{reply.author}</b>: {reply.text.slice(0, 60)}{reply.text.length > 60 ? "…" : ""}</span>
            <button onClick={() => setReply(null)} className="ml-auto p-0.5" aria-label="Cancel reply"><IX size={13} /></button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            rows={1} value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${roomName} as ${identity.name}…  (Enter to send)`}
            className="field resize-none !py-2.5 max-h-28" maxLength={600}
          />
          <button onClick={send} className="btn-primary !px-3.5 !py-2.5 shrink-0" aria-label="Send message"><ISend size={17} /></button>
        </div>
        <p className="flex items-center gap-1.5 text-[0.66rem] font-mono text-inksoft dark:text-pine-200/45 mt-2">
          <IShield size={11} /> Community rules apply — no harassment, no exam cheating. Moderators can remove content.
        </p>
      </div>
    </div>
  );
}

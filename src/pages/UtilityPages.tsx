import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CAMPUSES, DEPARTMENTS, departmentsOf } from "../data/campuses";
import { useStore } from "../lib/store";
import { Breadcrumbs, Reveal, SectionHead } from "../components/ui";
import ChatRoom from "../components/ChatRoom";
import { IArrowR, IBell, ICap, IChat, IChip, ILeaf, IPulse, IUser } from "../components/icons";

/* ---------------- chat directory ---------------- */
export function ChatPage() {
  const [room, setRoom] = useState<{ id: string; name: string }>({ id: "general", name: "HU General Chat" });
  const groups = useMemo(() => [
    { label: "Everyone", rooms: [{ id: "general", name: "HU General Chat" }, ...CAMPUSES.map((c) => ({ id: `campus-${c.id}`, name: `${c.id === "freshman" ? "Freshman" : c.short} Chat` }))], icon: <IChat size={14} /> },
    { label: "Freshman", rooms: [{ id: "freshman", name: "Freshman Common Chat" }], icon: <ICap size={14} /> },
    ...(["iot", "agri", "health"] as const).map((cid) => ({
      label: cid === "iot" ? "IoT Campus" : cid === "agri" ? "Agricultural Campus" : "Health Campus",
      icon: cid === "iot" ? <IChip size={14} /> : cid === "agri" ? <ILeaf size={14} /> : <IPulse size={14} />,
      rooms: departmentsOf(cid).map((d) => ({ id: d.id, name: `${d.name} Chat` })),
    })),
  ], []);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Chat rooms" }]} /></div>
      <Reveal>
        <SectionHead eyebrow="Community" title="Every room, one campus apart"
          sub={`A general room for everyone, plus dedicated discussion rooms for the freshman programme and all ${DEPARTMENTS.length} departments.`} />
      </Reveal>
      <div className="grid lg:grid-cols-[320px_1fr] gap-5 items-start">
        <div className="card-surface rounded-xl p-3 lg:sticky lg:top-28 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {groups.map((g) => (
            <div key={g.label} className="mb-3">
              <p className="flex items-center gap-1.5 font-mono text-[0.64rem] uppercase tracking-[0.16em] font-bold text-pine-600 dark:text-gold-400 px-2 mb-1.5">{g.icon} {g.label}</p>
              <div className="space-y-0.5">
                {g.rooms.map((r) => (
                  <button key={r.id} onClick={() => setRoom(r)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[0.82rem] font-semibold transition-colors ${
                      room.id === r.id ? "bg-pine-700 text-gold-200" : "hover:bg-pine-600/8 text-inksoft dark:text-pine-200/80 hover:text-ink dark:hover:text-pine-100"}`}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <ChatRoom roomId={room.id} roomName={room.name} height="h-[560px]" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- profile ---------------- */
export function ProfilePage() {
  const { identity, setIdentity, toast } = useStore();
  const [name, setName] = useState(identity?.name ?? "");
  const [dept, setDept] = useState(identity?.dept ?? "Freshman");

  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Your profile" }]} /></div>
      <div className="card-surface rounded-2xl p-7 shadow-lg">
        <span className="w-14 h-14 rounded-2xl bg-pine-700 text-gold-300 flex items-center justify-center mb-4">
          {identity ? <span className="font-display font-extrabold text-xl">{identity.name.charAt(0).toUpperCase()}</span> : <IUser size={26} />}
        </span>
        <h1 className="font-display font-extrabold text-[1.5rem]">{identity ? `Selam, ${identity.name}!` : "Create your student identity"}</h1>
        <p className="text-[0.86rem] text-inksoft dark:text-pine-200/65 mt-1.5">
          Your display name appears on your chat messages. Stored only on this device — no account needed in the demo build.
        </p>
        <div className="space-y-3 mt-5">
          <div>
            <label className="block font-mono text-[0.66rem] uppercase tracking-wider font-bold text-inksoft dark:text-pine-200/55 mb-1.5">Display name</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hanna T." maxLength={24} />
          </div>
          <div>
            <label className="block font-mono text-[0.66rem] uppercase tracking-wider font-bold text-inksoft dark:text-pine-200/55 mb-1.5">Department / programme</label>
            <select className="field" value={dept} onChange={(e) => setDept(e.target.value)}>
              <option>Freshman</option>
              {DEPARTMENTS.map((d) => <option key={d.id}>{d.name}</option>)}
              <option>Visitor</option>
            </select>
          </div>
          <button onClick={() => {
            if (name.trim().length < 2) { toast("Name must be at least 2 characters", "warn"); return; }
            setIdentity({ name: name.trim(), dept });
            toast("Profile saved — happy studying!");
          }} className="btn-primary w-full justify-center mt-1">Save profile</button>
          {identity && (
            <button onClick={() => { setIdentity(null); setName(""); toast("Signed out", "info"); }}
              className="btn-ghost w-full justify-center">Sign out</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- announcements ---------------- */
export function AnnouncementsPage() {
  const { announcements } = useStore();
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Announcements" }]} /></div>
      <Reveal>
        <SectionHead eyebrow="Bulletin" title="All announcements" sub="Timetables, uploads and updates — newest first." />
      </Reveal>
      <div className="space-y-3">
        {announcements.map((a, i) => (
          <Reveal key={a.id} delay={i * 50}>
            <article className="card-surface rounded-xl p-5 flex gap-4">
              <span className="w-10 h-10 rounded-lg bg-pine-600/10 dark:bg-pine-500/15 text-pine-600 dark:text-gold-400 flex items-center justify-center shrink-0"><IBell size={18} /></span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip !text-[0.62rem]">{a.tag}</span>
                  <span className="font-mono text-[0.66rem] text-inksoft dark:text-pine-200/50">{a.date}</span>
                </div>
                <h2 className="font-display font-bold text-[1.05rem] mt-1.5">{a.title}</h2>
                <p className="text-[0.88rem] text-inksoft dark:text-pine-200/70 mt-1 leading-relaxed">{a.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 404 ---------------- */
export function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-pine-600 dark:text-gold-400 font-bold">Error 404</p>
      <h1 className="font-display font-extrabold text-[2.4rem] leading-tight mt-2">This page skipped a class.</h1>
      <p className="text-inksoft dark:text-pine-200/65 mt-2">The link may be old — try searching instead.</p>
      <Link to="/" className="btn-primary mt-6">Back to the archive <IArrowR size={15} /></Link>
    </div>
  );
}

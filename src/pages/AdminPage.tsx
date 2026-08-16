import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { platformStats } from "../data/resources";
import { AdItem } from "../data/types";
import { Breadcrumbs, EmptyState, Reveal, SectionHead, Tabs } from "../components/ui";
import { ILock, IMegaphone, IBell, ITrash, IShield } from "../components/icons";

const PASSCODE = "hawassa2025";

export default function AdminPage() {
  const store = useStore();
  const { toast } = store;
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("huec:admin") === "1");
  const [code, setCode] = useState("");
  const [tab, setTab] = useState("announcements");
  const stats = useMemo(() => platformStats(), []);

  const [annTag, setAnnTag] = useState("Exams");
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [adEyebrow, setAdEyebrow] = useState("Sponsored");
  const [adTitle, setAdTitle] = useState("");
  const [adBody, setAdBody] = useState("");
  const [adCta, setAdCta] = useState("Learn more");
  const [adOffer, setAdOffer] = useState("");
  const [adTone, setAdTone] = useState<AdItem["tone"]>("pine");

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Staff dashboard" }]} /></div>
        <div className="card-surface rounded-2xl p-7 text-center shadow-lg">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-pine-700 text-gold-300 items-center justify-center mb-4"><ILock size={26} /></span>
          <h1 className="font-display font-extrabold text-[1.5rem]">Staff dashboard</h1>
          <p className="text-[0.86rem] text-inksoft dark:text-pine-200/65 mt-2">
            Administrators manage announcements, advertisements and moderation here. Content uploads (PDFs, exam photos) are synced from the archive store.
          </p>
          <input type="password" className="field mt-5 text-center font-mono tracking-widest" placeholder="Passcode"
            value={code} onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { if (code === PASSCODE) { setAuthed(true); sessionStorage.setItem("huec:admin", "1"); toast("Welcome, administrator"); } else toast("Incorrect passcode", "warn"); } }} />
          <button onClick={() => { if (code === PASSCODE) { setAuthed(true); sessionStorage.setItem("huec:admin", "1"); toast("Welcome, administrator"); } else toast("Incorrect passcode", "warn"); }}
            className="btn-primary w-full justify-center mt-3">Unlock dashboard</button>
          <p className="font-mono text-[0.66rem] text-inksoft dark:text-pine-200/45 mt-4">Demo passcode: <span className="text-pine-600 dark:text-gold-400 font-bold">hawassa2025</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mt-6 mb-4"><Breadcrumbs items={[{ label: "Staff dashboard" }]} /></div>
      <Reveal>
        <SectionHead eyebrow="Administration" title="Staff dashboard"
          sub="Changes here appear instantly for all visitors and persist on this device (demo persistence layer)."
          right={<span className="chip shrink-0"><IShield size={12} /> Signed in as admin</span>} />
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[["Exam papers", stats.exams], ["Documents", stats.docs], ["Courses", stats.courses], ["Departments & subjects", stats.departments]].map(([k, v]) => (
          <div key={k as string} className="card-surface rounded-xl px-4 py-3">
            <p className="font-mono text-[0.62rem] uppercase tracking-wider text-inksoft dark:text-pine-200/55">{k}</p>
            <p className="font-display font-extrabold text-[1.4rem] text-pine-700 dark:text-gold-400">{(v as number).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <Tabs active={tab} onChange={setTab} tabs={[
        { id: "announcements", label: "Announcements", count: store.announcements.length },
        { id: "ads", label: "Advertisements", count: store.ads.length },
        { id: "moderation", label: "Moderation notes" },
      ]} />

      <div className="pt-6">
        {tab === "announcements" && (
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
            <form className="card-surface rounded-xl p-5 h-fit space-y-3" onSubmit={(e) => {
              e.preventDefault();
              if (annTitle.trim().length < 5 || annBody.trim().length < 10) { toast("Title and body are too short", "warn"); return; }
              store.addAnnouncement({ tag: annTag, title: annTitle.trim(), body: annBody.trim(), date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) });
              setAnnTitle(""); setAnnBody("");
              toast("Announcement published");
            }}>
              <p className="font-display font-bold flex items-center gap-2"><IBell size={16} className="text-pine-600 dark:text-gold-400" /> Publish announcement</p>
              <select className="field" value={annTag} onChange={(e) => setAnnTag(e.target.value)}>
                {["Exams", "Uploads", "System", "IoT Campus", "Agricultural Campus", "Health Campus"].map((t) => <option key={t}>{t}</option>)}
              </select>
              <input className="field" placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} maxLength={90} />
              <textarea className="field resize-none" rows={3} placeholder="Body…" value={annBody} onChange={(e) => setAnnBody(e.target.value)} maxLength={300} />
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
        )}

        {tab === "ads" && (
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
            <form className="card-surface rounded-xl p-5 h-fit space-y-3" onSubmit={(e) => {
              e.preventDefault();
              if (adTitle.trim().length < 5) { toast("Ad title is too short", "warn"); return; }
              store.addAd({ eyebrow: adEyebrow.trim() || "Sponsored", title: adTitle.trim(), body: adBody.trim() || "Visit us near campus.", cta: adCta.trim() || "Learn more", offer: adOffer.trim() || undefined, link: "#", tone: adTone });
              setAdTitle(""); setAdBody(""); setAdOffer("");
              toast("Advertisement added to rotation");
            }}>
              <p className="font-display font-bold flex items-center gap-2"><IMegaphone size={16} className="text-pine-600 dark:text-gold-400" /> Create advertisement</p>
              <input className="field" placeholder="Eyebrow (e.g. Sponsored · Your shop)" value={adEyebrow} onChange={(e) => setAdEyebrow(e.target.value)} maxLength={50} />
              <input className="field" placeholder="Headline" value={adTitle} onChange={(e) => setAdTitle(e.target.value)} maxLength={70} />
              <textarea className="field resize-none" rows={2} placeholder="Description…" value={adBody} onChange={(e) => setAdBody(e.target.value)} maxLength={180} />
              <div className="grid grid-cols-2 gap-2">
                <input className="field" placeholder="CTA button text" value={adCta} onChange={(e) => setAdCta(e.target.value)} maxLength={28} />
                <input className="field" placeholder="Offer badge (optional)" value={adOffer} onChange={(e) => setAdOffer(e.target.value)} maxLength={30} />
              </div>
              <select className="field" value={adTone} onChange={(e) => setAdTone(e.target.value as AdItem["tone"])}>
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
        )}

        {tab === "moderation" && (
          <div className="card-surface rounded-xl p-6 max-w-2xl">
            <p className="font-display font-bold mb-2">How moderation works</p>
            <ul className="space-y-2 text-[0.86rem] text-inksoft dark:text-pine-200/75 leading-relaxed">
              <li>• Students can <b>report</b> any chat message; reported messages are flagged in the room and queued for review.</li>
              <li>• Authors can delete their own messages at any time.</li>
              <li>• Uploads (exam photos, PDFs) pass through validation: type checks, size limits and virus scanning before publication.</li>
              <li>• Administrative access on this page is passcode-protected and session-limited; normal visitors never see these controls.</li>
              <li>• Chat history is capped per room and stored per-device in this demo build; the production architecture moves this to the server database.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

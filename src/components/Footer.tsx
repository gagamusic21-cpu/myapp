import React from "react";
import { Link } from "react-router-dom";
import { CAMPUSES, DEPARTMENTS } from "../data/campuses";
import { Logo } from "./icons";

export default function Footer() {
  return (
    <footer className="mt-20 bg-pine-950 text-pine-100 relative overflow-hidden">
      <svg className="w-full h-8 text-pine-950 -mb-px rotate-180" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40 C 240 0, 480 0, 720 20 S 1200 40, 1440 10 L 1440 40 Z" fill="currentColor" className="text-paper dark:text-night" />
      </svg>
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <span className="flex items-center gap-2.5">
            <Logo size={38} />
            <span>
              <span className="block font-mono text-[0.6rem] tracking-[0.22em] uppercase text-pine-300">Hawassa University</span>
              <span className="block font-display font-extrabold text-[1.05rem]">Exams &amp; Courses</span>
            </span>
          </span>
          <p className="text-[0.83rem] text-pine-200/75 mt-4 leading-relaxed max-w-sm">
            A community archive of previous exams, answer keys, notes and study documents for the Freshman,
            IoT, Agricultural and Health campuses — built by students, for students.
          </p>
          <p className="font-mono text-[0.68rem] text-pine-300/70 mt-4">Main Campus · Hawassa, Sidama · Ethiopia</p>
        </div>
        <div>
          <p className="font-display font-bold text-gold-400 text-[0.9rem] mb-3.5">Campuses</p>
          <ul className="space-y-2 text-[0.83rem]">
            {CAMPUSES.map((c) => (
              <li key={c.id}><Link to={`/campus/${c.id}`} className="text-pine-100/85 hover:text-gold-400 transition-colors">{c.name}</Link></li>
            ))}
            <li><Link to="/explained" className="text-pine-100/85 hover:text-gold-400 transition-colors">Departments Explained</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display font-bold text-gold-400 text-[0.9rem] mb-3.5">Popular departments</p>
          <ul className="space-y-2 text-[0.83rem]">
            {["computer-science", "medicine", "plant-science", "nursing", "mechanical-engineering"].map((id) => {
              const dep = DEPARTMENTS.find((x) => x.id === id)!;
              return <li key={id}><Link to={`/campus/${dep.campusId}/dept/${dep.id}`} className="text-pine-100/85 hover:text-gold-400 transition-colors">{dep.name}</Link></li>;
            })}
          </ul>
        </div>
        <div>
          <p className="font-display font-bold text-gold-400 text-[0.9rem] mb-3.5">Platform</p>
          <ul className="space-y-2 text-[0.83rem]">
            <li><Link to="/chat" className="text-pine-100/85 hover:text-gold-400 transition-colors">General Chat</Link></li>
            <li><Link to="/announcements" className="text-pine-100/85 hover:text-gold-400 transition-colors">Announcements</Link></li>
            <li><Link to="/profile" className="text-pine-100/85 hover:text-gold-400 transition-colors">Your profile</Link></li>
            <li><Link to="/admin" className="text-pine-100/85 hover:text-gold-400 transition-colors">Staff dashboard</Link></li>
          </ul>
          <p className="text-[0.7rem] text-pine-300/60 mt-5 leading-relaxed">
            Materials are shared for educational purposes. Career paths listed on this site are potential opportunities, not guarantees.
          </p>
        </div>
      </div>
      <div className="border-t border-pine-800/70">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-[0.72rem] font-mono text-pine-300/75">
          <p>© 2025 Hawassa University Exams &amp; Courses · 2017 E.C.</p>
          <p>Made with care beside Lake Hawassa <span className="text-gold-400">◆</span></p>
        </div>
      </div>
    </footer>
  );
}

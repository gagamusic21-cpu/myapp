import React from "react";

type P = { size?: number; className?: string; strokeWidth?: number };
const base = (p: P) => ({
  width: p.size ?? 18, height: p.size ?? 18, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: p.strokeWidth ?? 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  className: p.className,
});

export const ISearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>);
export const IBook = (p: P) => (<svg {...base(p)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 0 4 5.5v14Z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /><path d="M9 7h7M9 11h5" /></svg>);
export const IExam = (p: P) => (<svg {...base(p)}><path d="M6 2h9l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M15 2v4h4" /><path d="m8.5 13.5 2 2 4.5-4.5" /><path d="M8 18h8" /></svg>);
export const IKey = (p: P) => (<svg {...base(p)}><circle cx="8" cy="15" r="4.5" /><path d="m11.5 11.5 8-8" /><path d="M17 6l2.5 2.5M14.5 8.5 17 11" /></svg>);
export const IDoc = (p: P) => (<svg {...base(p)}><path d="M6 2h9l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M15 2v4h4" /><path d="M8 12h8M8 16h8M8 8h3" /></svg>);
export const INote = (p: P) => (<svg {...base(p)}><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11l-5 5H6a2 2 0 0 1-2-2V5Z" /><path d="M15 21v-5h5" /><path d="M8 8h8M8 12h5" /></svg>);
export const IPdf = (p: P) => (<svg {...base(p)}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 12.5c0-1 .8-1.7 1.8-1.7s1.7.8 1.7 1.8-1.7 1-1.7 2.4M13 10v5M13 12.5h2" /></svg>);
export const IPhoto = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.6" /><path d="m21 15.5-4.5-4.5L7 20" /></svg>);
export const IChat = (p: P) => (<svg {...base(p)}><path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z" /><path d="M8.5 10.5h7M8.5 13.5h4.5" /></svg>);
export const IDownload = (p: P) => (<svg {...base(p)}><path d="M12 3v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4 19h16" /></svg>);
export const IArrowR = (p: P) => (<svg {...base(p)}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>);
export const IArrowL = (p: P) => (<svg {...base(p)}><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></svg>);
export const IChevD = (p: P) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const IX = (p: P) => (<svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" /></svg>);
export const IMenu = (p: P) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const ISun = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></svg>);
export const IMoon = (p: P) => (<svg {...base(p)}><path d="M20 13.5A8.5 8.5 0 0 1 10.5 4a8.5 8.5 0 1 0 9.5 9.5Z" /></svg>);
export const IBell = (p: P) => (<svg {...base(p)}><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>);
export const IUser = (p: P) => (<svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></svg>);
export const IReply = (p: P) => (<svg {...base(p)}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 6 6v3" /></svg>);
export const IFlag = (p: P) => (<svg {...base(p)}><path d="M5 21V4" /><path d="M5 4c4-2 7 2 14 0v9c-7 2-10-2-14 0" /></svg>);
export const ITrash = (p: P) => (<svg {...base(p)}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6.5 7 7.5 21h9L17.5 7" /><path d="M10 11v6M14 11v6" /></svg>);
export const ISend = (p: P) => (<svg {...base(p)}><path d="m3.5 11 17-7-4.5 16-4-6.5L3.5 11Z" /><path d="M12 13.5 20.5 4" /></svg>);
export const IZoomIn = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /><path d="M8.5 11h5M11 8.5v5" /></svg>);
export const IZoomOut = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /><path d="M8.5 11h5" /></svg>);
export const IEye = (p: P) => (<svg {...base(p)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
export const IClock = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const ICal = (p: P) => (<svg {...base(p)}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M8 3v4M16 3v4" /></svg>);
export const ICap = (p: P) => (<svg {...base(p)}><path d="m2.5 9 9.5-5 9.5 5-9.5 5L2.5 9Z" /><path d="M6.5 11.5V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.5" /><path d="M21.5 9v5" /></svg>);
export const IShield = (p: P) => (<svg {...base(p)}><path d="M12 2.5 20 6v6.5c0 5-3.4 7.8-8 9-4.6-1.2-8-4-8-9V6l8-3.5Z" /><path d="m8.8 12 2.2 2.2 4.2-4.4" /></svg>);
export const IBriefcase = (p: P) => (<svg {...base(p)}><rect x="3" y="7.5" width="18" height="13" rx="2" /><path d="M9 7.5V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></svg>);
export const ISpark = (p: P) => (<svg {...base(p)}><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3Z" /><path d="M18.5 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" /></svg>);
export const IMegaphone = (p: P) => (<svg {...base(p)}><path d="M3.5 10.5v3a1.5 1.5 0 0 0 1.5 1.5h2l7 4V5l-7 4H5a1.5 1.5 0 0 0-1.5 1.5Z" /><path d="M17.5 9.5a4 4 0 0 1 0 5" /><path d="M7 15v4.5a1 1 0 0 0 1 1h1.5" /></svg>);
export const IChip = (p: P) => (<svg {...base(p)}><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></svg>);
export const ILeaf = (p: P) => (<svg {...base(p)}><path d="M5 19C5 9 12 4 20 4c0 9-5 15-13 15" /><path d="M5 19c2-5 6-9 10-11" /></svg>);
export const IPulse = (p: P) => (<svg {...base(p)}><path d="M3 12h4l2.5-6 4 12L16 12h5" /></svg>);
export const IPin = (p: P) => (<svg {...base(p)}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>);
export const IGrid = (p: P) => (<svg {...base(p)}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>);
export const IWave = (p: P) => (<svg {...base(p)}><path d="M2.5 9c2.5-3 5-3 7.5 0s5 3 7.5 0 4-2.5 4 0" /><path d="M2.5 15c2.5-3 5-3 7.5 0s5 3 7.5 0 4-2.5 4 0" /></svg>);
export const ICheck = (p: P) => (<svg {...base(p)}><path d="m5 13 4.5 4.5L19 7" /></svg>);
export const ILock = (p: P) => (<svg {...base(p)}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>);

export const Logo = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
    <path d="M16 2 29 8v10c0 7-5.6 10.9-13 12C8.6 28.9 3 25 3 18V8l13-6z" fill="#0E5A45" />
    <path d="M16 2 29 8v10c0 7-5.6 10.9-13 12V2Z" fill="#0B4838" />
    <path d="M10 15c2-2.4 4-2.4 6 0s4 2.4 6 0M10 19.5c2-2.4 4-2.4 6 0s4 2.4 6 0" stroke="#F2B33D" strokeWidth="1.9" strokeLinecap="round" />
    <path d="M9.5 9.5h13" stroke="#FDFDF8" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="16" cy="24.4" r="1.4" fill="#F2B33D" />
  </svg>
);

import React, { useCallback, useEffect, useState } from "react";
import { CampusPhoto } from "../data/types";
import { IArrowL, IArrowR, IX, IZoomIn, IZoomOut } from "./icons";

export default function Lightbox({ photos, index, onClose, onIndex }: {
  photos: CampusPhoto[]; index: number; onClose: () => void; onIndex: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const photo = photos[index];

  const prev = useCallback(() => { setZoom(1); onIndex((index - 1 + photos.length) % photos.length); }, [index, photos.length, onIndex]);
  const next = useCallback(() => { setZoom(1); onIndex((index + 1) % photos.length); }, [index, photos.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, prev, next]);

  if (!photo) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-night/96 flex flex-col anim-fade">
      <div className="flex items-center justify-between px-4 py-3 text-pine-100">
        <p className="font-mono text-[0.75rem] tracking-wide">{index + 1} / {photos.length} · <span className="text-gold-400">{photo.tag}</span></p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))} className="p-2 rounded-lg hover:bg-pine-50/10 transition-colors" aria-label="Zoom out"><IZoomOut size={18} /></button>
          <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1)))} className="p-2 rounded-lg hover:bg-pine-50/10 transition-colors" aria-label="Zoom in"><IZoomIn size={18} /></button>
          <span className="font-mono text-[0.7rem] w-12 text-center text-pine-200/70">{Math.round(zoom * 100)}%</span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-clay-600 transition-colors ml-2" aria-label="Close viewer"><IX size={19} /></button>
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center overflow-hidden px-4 pb-4">
        <button onClick={prev} aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-pine-50/10 text-pine-50 hover:bg-pine-50/25 transition-colors"><IArrowL size={20} /></button>
        <img src={photo.src} alt={photo.caption}
          onClick={() => setZoom((z) => (z > 1 ? 1 : 1.75))}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl cursor-zoom-in transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }} />
        <button onClick={next} aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-pine-50/10 text-pine-50 hover:bg-pine-50/25 transition-colors"><IArrowR size={20} /></button>
      </div>
      <p className="text-center text-pine-100/85 text-[0.85rem] pb-5 px-6">{photo.caption}</p>
    </div>
  );
}

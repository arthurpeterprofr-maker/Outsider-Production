import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { asset } from "../lib/i18n";
import { VideoPlayer, toPlayable, toPreview } from "./VideoPlayer";

// Cover image, replaced by a muted looping preview when a video link exists (iframe scaled to cover the frame).
export const LoopMedia = ({ image, video, className = "" }) => {
  const pv = toPreview(asset(video));
  return (
    <div className={`absolute inset-0 overflow-hidden bg-zinc-950 [container-type:size] ${className}`}>
      {image && <img src={asset(image)} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {pv?.kind === "video" && <video src={pv.src} poster={asset(image)} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />}
      {pv?.kind === "iframe" && (
        <iframe title="preview" src={pv.src} allow="autoplay; fullscreen" tabIndex={-1}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[max(100cqh,56.25cqw)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 border-0" />
      )}
    </div>
  );
};

export const PlayOverlay = ({ label }) => (
  <span className="absolute inset-0 flex items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white opacity-90 transition-opacity duration-500 group-hover:opacity-100">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:scale-110"><Play className="ml-1 h-5 w-5 fill-current" /></span>
    <span className="hidden sm:inline">{label}</span>
  </span>
);

// Clickable video tile: loop preview, opens the full-screen player with sound.
export const VideoTile = ({ image, video, title, watch, className = "", testId, children }) => {
  const [open, setOpen] = useState(false);
  const media = toPlayable(asset(video));
  return (
    <>
      <button type="button" onClick={() => media && setOpen(true)} disabled={!media} data-testid={testId}
        className={`group relative block w-full overflow-hidden text-left ${media ? "cursor-pointer" : "cursor-default"} ${className}`}>
        <LoopMedia image={image} video={video} className="transition-transform duration-[1.6s] group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {media && <PlayOverlay label={watch} />}
        {children}
      </button>
      <AnimatePresence>{open && <VideoPlayer media={media} title={title} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
};

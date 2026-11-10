import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Maximize, X } from "lucide-react";
import { lockScroll } from "../lib/smooth";

export const toPlayable = (url) => {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&title=0&byline=0` };
  if (/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url) || url.includes("/api/media/")) return { kind: "video", src: url };
  return null;
};

// Muted, looping, chrome-less version of a video link, for background previews.
export const toPreview = (url) => {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}?background=1&autoplay=1&muted=1&loop=1&autopause=0` };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/api/media/")) return { kind: "video", src: url };
  return null;
};

export const VideoPlayer = ({ media, title, onClose, closeLabel = "Fermer" }) => {
  const boxRef = useRef(null);
  useEffect(() => {
    lockScroll(true);
    const onKey = (e) => { if (e.key === "Escape" && !document.fullscreenElement) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { lockScroll(false); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const fullscreen = () => boxRef.current?.requestFullscreen?.();

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      data-testid="video-player"
    >
      <div className="absolute right-5 top-5 z-10 flex gap-2">
        <button onClick={fullscreen} className="op-icon-btn bg-black/40" aria-label="plein écran" data-testid="video-fullscreen-btn"><Maximize className="h-4 w-4" /></button>
        <button onClick={onClose} className="op-icon-btn bg-black/40" aria-label={closeLabel} data-testid="video-close-btn"><X className="h-4 w-4" /></button>
      </div>
      <motion.div ref={boxRef} className="aspect-video w-full max-w-[min(100vw,177vh)] bg-black"
        initial={{ scale: 0.96 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        {media.kind === "iframe" ? (
          <iframe title={title} src={media.src} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen data-testid="video-iframe" />
        ) : (
          <video src={media.src} className="h-full w-full" controls autoPlay playsInline data-testid="video-element" />
        )}
      </motion.div>
    </motion.div>
  );
};

import { useState } from "react";
import { Play } from "lucide-react";
import { asset } from "../lib/i18n";
import { toPlayable } from "./VideoPlayer";

// Large in-page player: cover + play button, then the video plays in place with sound and controls.
export const InlineVideo = ({ image, video, title, testId }) => {
  const [on, setOn] = useState(false);
  const media = toPlayable(asset(video));
  if (!media) return null;
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-zinc-950" data-testid={testId}>
      {on ? (
        media.kind === "iframe"
          ? <iframe title={title || "video"} src={media.src} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" data-testid={`${testId}-iframe`} />
          : <video src={media.src} poster={asset(image)} className="h-full w-full bg-black" controls autoPlay playsInline data-testid={`${testId}-video`} />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 block" aria-label={title} data-testid={`${testId}-play`}>
          {image && <img src={asset(image)} alt="" className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-[1.04]" />}
          <span className="absolute inset-0 bg-black/35 transition-colors duration-700 group-hover:bg-black/20" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:scale-110 sm:h-24 sm:w-24"><Play className="ml-1 h-7 w-7 fill-current" /></span>
          </span>
        </button>
      )}
    </div>
  );
};

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Film } from "lucide-react";
import { useAT } from "../../lib/adminI18n";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const opts = { withCredentials: true };

// Sends a video in 5 MB pieces (proxies limit request size), then asks the server to assemble it.
const uploadVideo = async (file, onProgress) => {
  const { data } = await axios.post(`${API}/admin/videos/init`, { filename: file.name, content_type: file.type || "video/mp4", size: file.size }, opts);
  const step = data.chunk_size;
  const parts = Math.ceil(file.size / step);
  for (let i = 0; i < parts; i += 1) {
    const blob = file.slice(i * step, (i + 1) * step);
    await axios.put(`${API}/admin/videos/${data.upload_id}/chunk?index=${i}`, blob, { ...opts, headers: { "Content-Type": "application/octet-stream" } });
    onProgress(Math.round(((i + 1) / parts) * 100));
  }
  const done = await axios.post(`${API}/admin/videos/${data.upload_id}/complete`, { parts }, opts);
  return done.data.url;
};

export const VideoField = ({ value, onChange, path }) => {
  const ref = useRef(null);
  const a = useAT();
  const [pct, setPct] = useState(null);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPct(0);
    try {
      onChange(await uploadVideo(file, setPct));
      toast.success(a.videoUploaded);
    } catch (err) {
      const d = err?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : a.uploadFailed);
    } finally {
      setPct(null);
    }
  };
  return (
    <div>
      <div className="flex items-center gap-4">
        <input className="op-admin-input flex-1" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://vimeo.com/… · https://youtu.be/…" data-testid={`cms-${path}`} />
        <input ref={ref} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={pick} data-testid={`cms-video-file-${path}`} />
        <button type="button" onClick={() => ref.current?.click()} disabled={pct !== null} className="op-icon-btn shrink-0" aria-label={a.uploadVideo} title={a.uploadVideo} data-testid={`cms-upload-video-${path}`}>
          <Film className="h-4 w-4" />
        </button>
      </div>
      {pct !== null && (
        <div className="mt-3" data-testid={`cms-video-progress-${path}`}>
          <div className="h-1 w-full overflow-hidden bg-white/10"><div className="h-full bg-white transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 font-mono text-[11px] text-zinc-400">{a.uploadingVideo} {pct}%</p>
        </div>
      )}
    </div>
  );
};

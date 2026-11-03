import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { History, X } from "lucide-react";
import { useAdminLang, useAT, dateLocale } from "../../lib/adminI18n";

const http = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`, withCredentials: true });
const fmtIn = (l) => (iso) => new Date(iso).toLocaleString(dateLocale(l), { dateStyle: "medium", timeStyle: "short" });

export const Versions = ({ onRestored, onClose }) => {
  const a = useAT();
  const fmt = fmtIn(useAdminLang());
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const { data } = await http.get("/admin/content/versions");
    setList(Array.isArray(data) ? data : []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const restore = async (v) => {
    if (!window.confirm(a.confirmRestore(fmt(v.saved_at)))) return;
    setBusy(v.id);
    try {
      const { data } = await http.post(`/admin/content/versions/${v.id}/restore`);
      onRestored(data?.content);
      toast.success(a.restored);
      load();
    } catch {
      toast.error(a.restoreFailed);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mt-6 border border-white/15 bg-white/[0.02] p-5" data-testid="versions-panel">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-xl text-white"><History className="h-4 w-4" />{a.history}</p>
        <button onClick={onClose} className="text-zinc-400 hover:text-white" aria-label="fermer" data-testid="versions-close-btn"><X className="h-4 w-4" /></button>
      </div>
      {list.length === 0 && <p className="mt-4 font-body text-sm text-zinc-400">{a.noVersions}</p>}
      <ul className="mt-4 divide-y divide-white/10">
        {list.map((v, i) => (
          <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3" data-testid={`version-row-${i}`}>
            <div>
              <p className="font-body text-sm text-white">{fmt(v.saved_at)} {i === 0 && <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">{a.live}</span>}</p>
              <p className="font-mono text-[11px] text-zinc-400">{v.saved_by}{v.note?.startsWith("restored:") ? a.restoredFrom(fmt(v.note.slice(9))) : ""}</p>
            </div>
            {i > 0 && (
              <button onClick={() => restore(v)} disabled={busy === v.id} className="rounded-full border border-white/25 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-200 hover:bg-white hover:text-black" data-testid={`version-restore-${i}`}>
                {busy === v.id ? "…" : a.restore}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

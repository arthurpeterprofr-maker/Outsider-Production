import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { useAT } from "../../lib/adminI18n";

const http = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`, withCredentials: true });
const errText = (e) => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg).filter(Boolean).join(" ");
  return "Erreur";
};
const empty = { name: "", email: "", password: "" };

export const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const a = useAT();

  const load = useCallback(async () => {
    const { data } = await http.get("/admin/users");
    setUsers(Array.isArray(data) ? data : []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await http.post("/admin/users", form);
      toast.success(a.accountCreated);
      setForm(empty);
      load();
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setBusy(false);
    }
  };
  const remove = async (u) => {
    if (!window.confirm(a.confirmRemoveAccess(u.email))) return;
    await http.delete(`/admin/users/${u.id}`);
    toast.success(a.accessRemoved);
    load();
  };

  return (
    <div data-testid="accounts-panel">
      <h1 className="font-display text-5xl sm:text-6xl">{a.accountsTitle}</h1>
      <p className="mt-4 max-w-xl font-body text-sm text-zinc-400">{a.accountsIntro}</p>
      <div className="mt-10 border-t border-white/10" data-testid="accounts-list">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-4 border-b border-white/10 py-4" data-testid={`account-row-${u.email}`}>
            <div>
              <p className="font-body text-white">{u.name || u.email}</p>
              <p className="font-mono text-xs text-zinc-400">{u.email} · {u.role === "admin" ? a.roleAdmin : a.roleEditor}</p>
            </div>
            {u.role === "editor" && (
              <button onClick={() => remove(u)} className="op-icon-btn hover:!border-red-400 hover:!text-red-400" aria-label="supprimer" data-testid={`account-delete-${u.email}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={create} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="account-create-form">
        <input className="op-admin-input" placeholder={a.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="account-name-input" />
        <input className="op-admin-input" type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="account-email-input" />
        <input className="op-admin-input" type="text" required minLength={8} placeholder={a.pwdMin} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="account-password-input" />
        <button type="submit" disabled={busy} className="op-btn justify-self-start sm:col-span-3" data-testid="account-create-btn"><UserPlus className="h-4 w-4" /><span>{a.createEditor}</span></button>
      </form>
    </div>
  );
};

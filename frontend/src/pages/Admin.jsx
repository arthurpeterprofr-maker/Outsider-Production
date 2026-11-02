import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { LogOut, Trash2, Mail, MailOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoMark } from "../components/Logo";
import { ContentEditor } from "../components/admin/ContentEditor";
import { Accounts } from "../components/admin/Accounts";
import { PasswordForm } from "../components/admin/PasswordForm";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const http = axios.create({ baseURL: API, withCredentials: true });

const errText = (e) => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg).filter(Boolean).join(" ");
  return "Erreur / Error";
};

const Login = ({ onDone }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await http.post("/auth/login", { email, password });
      onDone(data);
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm space-y-8" data-testid="admin-login-form">
      <h1 className="font-display text-5xl text-white">Admin</h1>
      <label className="op-field"><span className="op-label !text-[10px] !text-zinc-400">Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="admin-email-input" /></label>
      <label className="op-field"><span className="op-label !text-[10px] !text-zinc-400">Mot de passe / Password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="admin-password-input" /></label>
      {error && <p className="font-body text-sm text-red-400" data-testid="admin-login-error">{error}</p>}
      <button type="submit" disabled={busy} className="op-btn" data-testid="admin-login-submit">{busy ? "…" : "Connexion / Sign in"}</button>
    </form>
  );
};

const statusLabel = { sent: "email envoyé", failed: "email échoué", skipped: "email non configuré", pending: "email en cours" };

const MessageRow = ({ m, onToggle, onDelete }) => (
  <article className={`border-t border-white/10 py-6 ${m.read ? "opacity-60" : ""}`} data-testid={`admin-message-${m.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="font-display text-2xl text-white">{m.name} {!m.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-white align-middle" />}</p>
        <p className="mt-1 font-body text-sm text-zinc-300">
          <a href={`mailto:${m.email}`} className="op-underline">{m.email}</a>{m.company && ` · ${m.company}`}{m.project_type && ` · ${m.project_type}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-zinc-400">{new Date(m.created_at).toLocaleString()} · {statusLabel[m.email_status] || m.email_status}</span>
        <button onClick={() => onToggle(m)} className="op-icon-btn" aria-label="toggle read" data-testid={`admin-toggle-read-${m.id}`}>
          {m.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
        </button>
        <button onClick={() => onDelete(m)} className="op-icon-btn hover:!border-red-400 hover:!text-red-400" aria-label="delete" data-testid={`admin-delete-${m.id}`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
    <p className="mt-4 whitespace-pre-line font-body text-sm leading-relaxed text-zinc-200">{m.message}</p>
  </article>
);

export default function Admin() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [view, setView] = useState(null);
  const isAdmin = user?.role === "admin";
  const load = useCallback(async () => {
    try {
      const { data } = await http.get("/admin/messages");
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e?.response?.status === 401) setUser(false);
    }
  }, []);

  useEffect(() => {
    http.get("/auth/me").then((r) => setUser(r.data)).catch(() => setUser(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setView((v) => v || (user.role === "admin" ? "messages" : "content"));
    if (user.role === "admin") load();
  }, [user, load]);

  const toggle = async (m) => {
    const { data } = await http.patch(`/admin/messages/${m.id}`, { read: !m.read });
    setMessages((list) => list.map((x) => (x.id === m.id ? data : x)));
  };
  const remove = async (m) => {
    if (!window.confirm("Supprimer ce message ? / Delete this message?")) return;
    await http.delete(`/admin/messages/${m.id}`);
    setMessages((list) => list.filter((x) => x.id !== m.id));
    toast.success("Message supprimé");
  };
  const logout = async () => {
    await http.post("/auth/logout");
    setUser(false);
    setView(null);
    setMessages([]);
  };

  const unread = messages.filter((m) => !m.read).length;
  const tabs = isAdmin
    ? [["messages", `Messages (${unread})`], ["content", "Contenu du site"], ["accounts", "Comptes éditeurs"], ["password", "Mot de passe"]]
    : [["content", "Contenu du site"], ["password", "Mot de passe"]];

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-8 text-white sm:px-10" data-testid="admin-page">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-zinc-300 hover:text-white" data-testid="admin-back-link">
          <ArrowLeft className="h-4 w-4" /><LogoMark className="h-6 w-6" /><span className="op-label !text-white">Outsiders</span>
        </Link>
        {user && <button onClick={logout} className="op-icon-btn" aria-label="logout" data-testid="admin-logout-btn"><LogOut className="h-4 w-4" /></button>}
      </header>
      {user === null && <p className="mt-24 text-center font-mono text-xs text-zinc-400">…</p>}
      {user === false && <Login onDone={setUser} />}
      {user && (
        <nav className="mx-auto mt-12 flex max-w-5xl flex-wrap items-center gap-2" data-testid="admin-tabs">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} data-testid={`admin-tab-${k}`}
              className={`rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] ${view === k ? "bg-white text-black" : "border border-white/15 text-zinc-300 hover:text-white"}`}>{l}</button>
          ))}
          <span className="ml-auto font-mono text-[11px] text-zinc-400" data-testid="admin-current-user">{user.email} · {isAdmin ? "admin" : "éditeur"}</span>
        </nav>
      )}
      {user && view === "content" && <section className="mx-auto mt-6 max-w-5xl"><ContentEditor /></section>}
      {isAdmin && view === "accounts" && <section className="mx-auto mt-12 max-w-5xl"><Accounts /></section>}
      {user && view === "password" && <section className="mx-auto mt-12 max-w-5xl"><PasswordForm /></section>}
      {isAdmin && view === "messages" && (
        <section className="mx-auto mt-16 max-w-5xl">
          <div className="flex items-end justify-between">
            <h1 className="font-display text-5xl sm:text-6xl">Messages</h1>
            <p className="font-mono text-xs text-zinc-400" data-testid="admin-unread-count">{unread} non lu(s) · {messages.length} total</p>
          </div>
          <div className="mt-10" data-testid="admin-messages-list">
            {messages.length === 0 && <p className="border-t border-white/10 py-10 font-body text-zinc-400">Aucun message pour le moment.</p>}
            {messages.map((m) => <MessageRow key={m.id} m={m} onToggle={toggle} onDelete={remove} />)}
          </div>
        </section>
      )}
    </main>
  );
}

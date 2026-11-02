import { useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "../components/Logo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ForgotForm = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
    } finally {
      setBusy(false);
      setSent(true);
    }
  };
  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm space-y-8" data-testid="forgot-form">
      <h1 className="font-display text-5xl text-white">Mot de passe oublié</h1>
      {sent ? (
        <p className="font-body text-sm leading-relaxed text-zinc-300" data-testid="forgot-sent-msg">
          Si un compte existe pour cette adresse, un email avec un lien de réinitialisation vient d'être envoyé. Le lien est valable 1 heure.
        </p>
      ) : (
        <>
          <p className="font-body text-sm text-zinc-400">Indiquez l'email de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
          <label className="op-field"><span className="op-label !text-[10px] !text-zinc-400">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="forgot-email-input" /></label>
          <button type="submit" disabled={busy} className="op-btn" data-testid="forgot-submit-btn">{busy ? "…" : "Envoyer le lien"}</button>
        </>
      )}
      <button type="button" onClick={onBack} className="op-underline block font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400" data-testid="forgot-back-btn">Retour à la connexion</button>
    </form>
  );
};

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (pwd.length < 8) return setError("Au moins 8 caractères.");
    if (pwd !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { token, new_password: pwd });
      setDone(true);
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === "string" ? d : "Lien invalide ou expiré.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-8 text-white sm:px-10" data-testid="reset-page">
      <Link to="/admin" className="mx-auto flex max-w-5xl items-center gap-3 text-zinc-300 hover:text-white" data-testid="reset-back-link">
        <ArrowLeft className="h-4 w-4" /><LogoMark className="h-6 w-6" /><span className="op-label !text-white">Outsiders</span>
      </Link>
      <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm space-y-8" data-testid="reset-form">
        <h1 className="font-display text-5xl">Nouveau mot de passe</h1>
        {done ? (
          <>
            <p className="font-body text-sm text-zinc-300" data-testid="reset-done-msg">Mot de passe modifié. Vous pouvez vous connecter.</p>
            <Link to="/admin" className="op-btn" data-testid="reset-login-link">Se connecter</Link>
          </>
        ) : (
          <>
            <label className="op-field"><span className="op-label !text-[10px] !text-zinc-400">Nouveau mot de passe (8 caractères min.)</span>
              <input type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)} data-testid="reset-password-input" /></label>
            <label className="op-field"><span className="op-label !text-[10px] !text-zinc-400">Confirmer</span>
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} data-testid="reset-confirm-input" /></label>
            {error && <p className="font-body text-sm text-red-400" data-testid="reset-error">{error}</p>}
            <button type="submit" disabled={busy || !token} className="op-btn" data-testid="reset-submit-btn">{busy ? "…" : "Enregistrer"}</button>
          </>
        )}
      </form>
    </main>
  );
}

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const empty = { current: "", next: "", confirm: "" };

export const PasswordForm = () => {
  const [f, setF] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (f.next.length < 8) return setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
    if (f.next !== f.confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    try {
      await axios.post(`${API}/auth/change-password`, { current_password: f.current, new_password: f.next }, { withCredentials: true });
      toast.success("Mot de passe modifié");
      setF(empty);
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === "string" ? d : "Échec de la modification");
    } finally {
      setBusy(false);
    }
  };

  const field = (k, label) => (
    <label className="op-field">
      <span className="op-label !text-[10px] !text-zinc-400">{label}</span>
      <input type="password" required value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`password-${k}-input`} />
    </label>
  );

  return (
    <form onSubmit={submit} className="max-w-md space-y-8" data-testid="password-form">
      <h1 className="font-display text-5xl sm:text-6xl">Mot de passe</h1>
      {field("current", "Mot de passe actuel")}
      {field("next", "Nouveau mot de passe (8 caractères min.)")}
      {field("confirm", "Confirmer le nouveau mot de passe")}
      {error && <p className="font-body text-sm text-red-400" data-testid="password-error">{error}</p>}
      <button type="submit" disabled={busy} className="op-btn" data-testid="password-submit-btn"><KeyRound className="h-4 w-4" /><span>Changer le mot de passe</span></button>
    </form>
  );
};

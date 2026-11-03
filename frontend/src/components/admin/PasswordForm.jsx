import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { useAT } from "../../lib/adminI18n";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const empty = { current: "", next: "", confirm: "" };

export const PasswordForm = () => {
  const [f, setF] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const a = useAT();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (f.next.length < 8) return setError(a.pwdTooShort);
    if (f.next !== f.confirm) return setError(a.pwdMismatch);
    setBusy(true);
    try {
      await axios.post(`${API}/auth/change-password`, { current_password: f.current, new_password: f.next }, { withCredentials: true });
      toast.success(a.pwdChanged);
      setF(empty);
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === "string" ? d : a.pwdFailed);
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
      <h1 className="font-display text-5xl sm:text-6xl">{a.password}</h1>
      {field("current", a.pwdCurrent)}
      {field("next", a.pwdNew)}
      {field("confirm", a.pwdConfirm)}
      {error && <p className="font-body text-sm text-red-400" data-testid="password-error">{error}</p>}
      <button type="submit" disabled={busy} className="op-btn" data-testid="password-submit-btn"><KeyRound className="h-4 w-4" /><span>{a.pwdSubmit}</span></button>
    </form>
  );
};

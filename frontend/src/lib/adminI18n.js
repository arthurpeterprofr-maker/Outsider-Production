import { useSyncExternalStore } from "react";

// Admin interface language (independent from the public site language), remembered per browser.
const KEY = "op-admin-lang";
const subs = new Set();
const read = () => (localStorage.getItem(KEY) === "en" ? "en" : "fr");
export const setAdminLang = (l) => { localStorage.setItem(KEY, l); subs.forEach((f) => f()); };
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };
export const useAdminLang = () => useSyncExternalStore(subscribe, read, () => "fr");

const STR = {
  fr: {
    error: "Erreur", password: "Mot de passe", signIn: "Connexion", forgot: "Mot de passe oublié ?",
    emailStatus: { sent: "email envoyé", failed: "email échoué", skipped: "email non configuré", pending: "email en cours" },
    confirmDeleteMsg: "Supprimer ce message ?", msgDeleted: "Message supprimé",
    tabMessages: "Messages", tabContent: "Contenu du site", tabAccounts: "Comptes éditeurs", tabPassword: "Mot de passe",
    guide: "Mode d'emploi (PDF)", roleAdmin: "admin", roleEditor: "éditeur",
    unread: (u, n) => `${u} non lu(s) · ${n} total`, noMessages: "Aucun message pour le moment.",
    accountsTitle: "Comptes", accountsIntro: "Les éditeurs peuvent modifier les textes et les images du site, mais n'ont pas accès aux messages ni aux comptes.",
    accountCreated: "Compte éditeur créé — transmettez l'email et le mot de passe à votre client", confirmRemoveAccess: (e) => `Supprimer l'accès de ${e} ?`,
    accessRemoved: "Accès supprimé", name: "Nom", pwdMin: "Mot de passe (8 caractères min.)", createEditor: "Créer un accès éditeur",
    pwdTooShort: "Le nouveau mot de passe doit contenir au moins 8 caractères.", pwdMismatch: "Les deux mots de passe ne correspondent pas.",
    pwdChanged: "Mot de passe modifié", pwdFailed: "Échec de la modification", pwdCurrent: "Mot de passe actuel",
    pwdNew: "Nouveau mot de passe (8 caractères min.)", pwdConfirm: "Confirmer le nouveau mot de passe", pwdSubmit: "Changer le mot de passe",
    history: "Historique (10 dernières versions)", noVersions: "Aucune version enregistrée pour l'instant.", live: "en ligne",
    restoredFrom: (d) => ` · restauration du ${d}`, restore: "Restaurer", confirmRestore: (d) => `Restaurer la version du ${d} ? Elle sera publiée immédiatement.`,
    restored: "Version restaurée et publiée", restoreFailed: "Échec de la restauration",
    saved: "Contenu enregistré — le site est à jour", saveFailed: "Échec de l'enregistrement", preview: "Aperçu", save: "Enregistrer",
    editorHelp: "Les modifications ne sont visibles par le public qu'après « Enregistrer ». Le bouton « Aperçu » ouvre le site avec vos changements non publiés (mis à jour en direct). Pour les images, importez un fichier (max 6 Mo) ou collez un lien.",
    add: "Ajouter", dragHint: "Glisser pour réordonner", imgUploaded: "Image importée — pensez à enregistrer", uploadFailed: "Échec de l'import",
    uploadVideo: "Importer un fichier vidéo (500 Mo max)", uploadingVideo: "Import de la vidéo…", videoUploaded: "Vidéo importée — pensez à enregistrer",
    homeOrderHelp: "L'ouverture (titre et bandeau défilant) reste toujours en haut. Glissez les sections pour changer leur ordre ; l'œil masque une section sans la supprimer.",
    forgotTitle: "Mot de passe oublié", forgotSent: "Si un compte existe pour cette adresse, un email avec un lien de réinitialisation vient d'être envoyé. Le lien est valable 1 heure.",
    forgotIntro: "Indiquez l'email de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.", sendLink: "Envoyer le lien", backToLogin: "Retour à la connexion",
    resetTitle: "Nouveau mot de passe", resetMin: "Au moins 8 caractères.", resetInvalid: "Lien invalide ou expiré.", resetDone: "Mot de passe modifié. Vous pouvez vous connecter.",
    login: "Se connecter", confirm: "Confirmer",
  },
  en: {
    error: "Error", password: "Password", signIn: "Sign in", forgot: "Forgot password?",
    emailStatus: { sent: "email sent", failed: "email failed", skipped: "email not configured", pending: "email pending" },
    confirmDeleteMsg: "Delete this message?", msgDeleted: "Message deleted",
    tabMessages: "Messages", tabContent: "Site content", tabAccounts: "Editor accounts", tabPassword: "Password",
    guide: "User guide (PDF)", roleAdmin: "admin", roleEditor: "editor",
    unread: (u, n) => `${u} unread · ${n} total`, noMessages: "No messages yet.",
    accountsTitle: "Accounts", accountsIntro: "Editors can change the site's texts and images, but cannot access messages or accounts.",
    accountCreated: "Editor account created — send the email and password to the person", confirmRemoveAccess: (e) => `Remove access for ${e}?`,
    accessRemoved: "Access removed", name: "Name", pwdMin: "Password (8 characters min.)", createEditor: "Create editor access",
    pwdTooShort: "The new password must be at least 8 characters long.", pwdMismatch: "The two passwords do not match.",
    pwdChanged: "Password changed", pwdFailed: "Could not change the password", pwdCurrent: "Current password",
    pwdNew: "New password (8 characters min.)", pwdConfirm: "Confirm the new password", pwdSubmit: "Change password",
    history: "History (last 10 versions)", noVersions: "No saved version yet.", live: "live",
    restoredFrom: (d) => ` · restore of ${d}`, restore: "Restore", confirmRestore: (d) => `Restore the version from ${d}? It will be published immediately.`,
    restored: "Version restored and published", restoreFailed: "Restore failed",
    saved: "Content saved — the site is up to date", saveFailed: "Save failed", preview: "Preview", save: "Save",
    editorHelp: "Changes are only visible to the public after « Save ». The « Preview » button opens the site with your unpublished changes (updated live). For images, upload a file (6 MB max) or paste a link.",
    add: "Add", dragHint: "Drag to reorder", imgUploaded: "Image uploaded — remember to save", uploadFailed: "Upload failed",
    uploadVideo: "Upload a video file (500 MB max)", uploadingVideo: "Uploading video…", videoUploaded: "Video uploaded — remember to save",
    homeOrderHelp: "The opening (title and scrolling banner) always stays at the top. Drag sections to change their order; the eye hides a section without deleting it.",
    forgotTitle: "Forgot password", forgotSent: "If an account exists for this address, an email with a reset link has just been sent. The link is valid for 1 hour.",
    forgotIntro: "Enter your account email: you will receive a link to choose a new password.", sendLink: "Send the link", backToLogin: "Back to sign in",
    resetTitle: "New password", resetMin: "At least 8 characters.", resetInvalid: "Invalid or expired link.", resetDone: "Password changed. You can now sign in.",
    login: "Sign in", confirm: "Confirm",
  },
};

export const useAT = () => STR[useAdminLang()];
export const dateLocale = (l) => (l === "en" ? "en-GB" : "fr-FR");

export const AdminLangToggle = () => {
  const lang = useAdminLang();
  return (
    <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em]" data-testid="admin-lang-toggle">
      {["fr", "en"].map((l) => (
        <button key={l} type="button" onClick={() => setAdminLang(l)} data-testid={`admin-lang-${l}`}
          className={`px-2 py-1 ${lang === l ? "text-white underline underline-offset-4" : "text-zinc-500 hover:text-white"}`}>{l}</button>
      ))}
    </div>
  );
};

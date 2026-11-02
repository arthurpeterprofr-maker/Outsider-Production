# PRD — Outsiders Production (site vitrine)

## Original problem statement
"Confidentiel Projet outsider. On me demande de creer un site de ce genre. Peux-tu me creer un site sur cet exemple, que je modifierais par la suite une fois le contenu reçu de la part de mon client. Fais un site responsive Web et mobile stp" (+ capture d'écran du site de référence Outsiders Production).

User choices: bilingue FR/EN avec bouton de langue; formulaire = enregistrement dans le site (admin) + vrai email; images générées par IA.

## Architecture
- Frontend React (CRA) : one-page `/` + `/admin`. framer-motion (reveals, masked lines, parallax, 3D tilt hero), lenis (smooth scroll). Contenu FR/EN centralisé dans `src/lib/content.js` (+ `contactInfo`).
- Backend FastAPI : `/api/contact` (public, rate-limit 5/10min/IP), JWT cookie auth admin (`/api/auth/*`, brute-force lock), `/api/admin/messages` (list/patch read/delete).
- Email : Emergent managed Resend (`email_service.py`), destinataire `CONTACT_NOTIFY_EMAIL` dans backend/.env (vide = pas d'envoi, statut "skipped").
- Images IA dans `frontend/public/images/`.

## User personas
- Le développeur/agence (utilisateur) qui adaptera le contenu ; le client (société de production) qui consulte les messages ; les visiteurs/prospects.

## Implemented (2026-11-02)
- Hero cinématique (reveal ligne par ligne, parallax, spotlight + tilt 3D souris), marquee éditorial, About, Fondateurs, Manifeste Wild & Free, Vision, Expertise, Contact + carte Casablanca N&B, footer.
- Logo SVG original + favicon, toggle FR/EN persistant, menu mobile plein écran.
- Formulaire → MongoDB + email (testé : 202 Accepted), portail admin (login, lu/non lu, suppression).

## Backlog
- P0 : renseigner l'email de réception réel (CONTACT_NOTIFY_EMAIL), remplacer contenus/photos par ceux du client.
- P1 : section projets/filmographie, vrais liens réseaux sociaux, SEO (OG, sitemap).
- P2 : changement de mot de passe admin depuis l'interface, export CSV des messages.

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

## Implemented (2026-11-02, itération 2)
- Section Filmographie (#films) : 4 affiches IA, fiche film en modale (synopsis, sélections festivals, lecteur bande-annonce YouTube/Vimeo via `trailer`), données dans `filmItems` (content.js) — contenus d'exemple entre [crochets].
- Écran d'ouverture (rideau + logo dessiné + compteur), 1 fois par session ; animations du hero décalées en conséquence.

## Implemented (2026-11-02, itération 3)
- Filmographie en pellicule horizontale épinglée au scroll (desktop, barre de progression, perforations), swipe horizontal sur mobile, carte de fin vers Contact.
- Section « Sélections & presse » : 6 lauriers SVG (festivals cités dans la bio de référence) + 3 citations presse placeholders.
- Lecteur bande-annonce prêt (YouTube/Vimeo) — liens réels non fournis.

## Implemented (2026-11-02, itération 4)
- Textes alignés sur la maquette client (menu Home/About/Cinema/Commercials/Contact, labels Capabilities, bios, footer Navigate: Studio/Services/Founders/DNA/Contact).
- Cinéma (#films) : bouton « Regarder sur Netflix » (champ `netflix`) à la place des bandes-annonces. Nouvelle section Publicités (#commercials) avec 4 visuels IA + lien Netflix.
- CMS admin (/admin → « Contenu du site ») : édition de tous les textes FR/EN, films, pubs, fondateurs, lauriers, coordonnées, images (upload stocké en base, max 6 Mo). API : GET /api/content, PUT /api/admin/content, POST /api/admin/media, GET /api/media/{id}. Le frontend fusionne le contenu enregistré avec les valeurs par défaut de content.js.

## Implemented (2026-11-02, itération 5)
- Comptes éditeurs (rôle editor) créés/supprimés par l'admin : accès au contenu et aux images uniquement (messages et comptes interdits, 403).
- Changement de mot de passe pour tout utilisateur connecté (/admin → « Mot de passe »).
- Aperçu avant publication : bouton « Aperçu » ouvre /?preview=1 avec le brouillon (localStorage, mise à jour en direct), bandeau « Aperçu — non publié ».

## Implemented (2026-11-02, itération 6)
- Mot de passe oublié : /admin → lien « Mot de passe oublié ? », email (Resend managé) avec lien /admin/reset?token= (1 h, usage unique, 3 demandes/h max, token hashé). FRONTEND_URL dans backend/.env sert à construire le lien (à mettre à jour avec le domaine final).
- Historique : chaque enregistrement crée une version (10 dernières gardées), restauration en un clic (admin et éditeurs).

## Implemented (2026-11-02, itération 7)
- Export Google Cloud : EMAIL_PROVIDER (managed par défaut | resend avec RESEND_API_KEY + EMAIL_FROM, SDK resend async), Dockerfiles backend (Cloud Run) et frontend (build CRA + nginx qui relaie /api → même domaine, cookies OK), .env.example, guide pas à pas /app/DEPLOY_GCP.md.
- Frontend : REACT_APP_BACKEND_URL vide ⇒ appels relatifs /api.

## Implemented (2026-11-02, itération 8)
- Artistes résidents : entrée de menu (route /artistes), page liste avec filtres (métier / secteur / zone, noms non concernés atténués, aperçu photo au survol), fiche /artistes/:slug (nom, catégories, bio FR/EN, précédent/suivant, onglets Film (image + lien vidéo) / Photo (mosaïque)). 8 artistes placeholders, éditables dans l'admin (onglets « Artistes » et « Filtres artistes »).
- Navigation inter-pages (hook useGoTo), intro jouée une seule fois, menu desktop à partir de 1280 px.

## Implemented (2026-11-02, itération 9)
- Lecteur vidéo plein écran (YouTube, Vimeo, .mp4) sur la fiche artiste ; Netflix/autres liens s'ouvrent dans un nouvel onglet.
- Admin : réordonnancement par glisser-déposer (poignée) + flèches haut/bas sur toutes les listes (artistes, films, pubs…).

## Implemented (2026-11-02, itération 10)
- Vraies photos des fondateurs (public/images/founder1.jpg = Hicham, founder2.jpg = Nadia) ; les galeries d'artistes n'utilisent plus ces photos.
- Logos officiels détourés en blanc : logo-mark.png (nav, intro, admin), logo-full.png (footer), favicon.png + apple-touch-icon.png.

## Implemented (2026-11-02, itération 11)
- Logos modifiables dans l'admin (onglet « Images du site » : media.logoMark, media.logoFull) ; photos fondateurs via onglet « Fondateurs ».
- Ouverture animée : logo entier découpé automatiquement lettre par lettre (LetterLogo.jsx + lib/logoSlices.js), fonctionne aussi avec un logo importé. Intro 3,8 s.
- Nouvelle photo de Nadia (founder2.jpg, portrait assis).

## Implemented (2026-11-02, itération 12)
- Mode d'emploi PDF de l'admin (18 pages, captures réelles) : source /app/docs/guide/guide.html + shots/, PDF publié dans frontend/public/guide-admin-outsiders.pdf (régénérer : google-chrome --headless --print-to-pdf). Lien « Mode d'emploi (PDF) » dans l'en-tête de l'admin.
- Libellés admin ajoutés : « Lauriers (festivals) », « Mention sous les lauriers ».

## Implemented (2026-11-02, itération 13)
- Nouvelles pages /ai-studio (Outsiders AI Studio) et /voice-room (The Voice Room, collaboration WE4SHE), textes client EN + traduction FR, liens dans le menu (ajoutés automatiquement aux menus déjà enregistrés via withNewPages dans i18n.js).
- Vidéos : liens YouTube/Vimeo/.mp4 → aperçu muet en boucle (VideoTile/LoopMedia) + lecteur plein écran au clic. Admin : onglets « AI Studio — vidéos » et « Voice Room — vidéos » (cover + projets/capsules). Images d'ambiance stock en attendant (public/images/ai*.jpg, voice*.jpg). Titres projets = placeholders [Projet IA 0x], Capsule 0x.
- Le guide PDF ne couvre pas encore ces deux pages.

## Implemented (2026-11-02, itérations 14-15)
- Accueil : bandeaux « À découvrir » (Discover.jsx) vers AI Studio / Voice Room (textes fr/en.discover, médias = covers des pages).
- Voice Room : partenaires engagés (voiceRoomMedia.partners : name, logo, url), nom affiché si pas de logo. Placeholders [Partenaire 0x] + WE4SHE.
- Guide PDF : 21 pages, section 12 vidéos AI Studio / Voice Room / partenaires / bandeaux.
- Cinéma & Publicités : défilement horizontal bloquant remplacé par grille + fiche au clic (FilmGrid.jsx, AdGrid.jsx, Chips.jsx). Accueil = 6 premiers + bouton ; pages /cinema (filtres par type) et /publicites (filtres par client si ≥2). Pub avec lien YouTube/Vimeo lue sur le site. lockScroll = compteur (overlays imbriqués).
- Admin : en-têtes de fiches affichent le titre FR quand titre bilingue.


## Backlog
- P0 : renseigner l'email de réception réel (CONTACT_NOTIFY_EMAIL), remplacer contenus/photos par ceux du client.
- P1 : section projets/filmographie, vrais liens réseaux sociaux, SEO (OG, sitemap).
- P2 : changement de mot de passe admin depuis l'interface, export CSV des messages.

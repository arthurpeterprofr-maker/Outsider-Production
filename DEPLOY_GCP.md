# Guide de déploiement — Outsiders Production sur Google Cloud

Ce guide met en ligne le site sur votre projet Google Cloud **Outsider-Production**.
Comptez environ 1 h la première fois. Aucune connaissance avancée n'est nécessaire : il suffit de copier-coller les commandes.

## Architecture

```
Visiteur ──► outsiders-web (Cloud Run : site + proxy /api) ──► outsiders-api (Cloud Run : FastAPI)
                                                              ├──► MongoDB Atlas (données, images importées)
                                                              └──► Resend (emails)
```

Le site et l'API sont servis depuis **la même adresse** (le conteneur `outsiders-web` relaie `/api` vers l'API).
C'est indispensable pour que la connexion à l'espace admin fonctionne sur tous les navigateurs, Safari compris.

---

## Étape 0 — Ce qu'il vous faut

| Élément | Où | Coût |
|---|---|---|
| Projet Google Cloud avec la facturation activée | https://console.cloud.google.com | Cloud Run a un palier gratuit, ce qui suffit souvent pour un site vitrine |
| Google Cloud CLI (`gcloud`) installé | https://cloud.google.com/sdk/docs/install | gratuit |
| Le code sur GitHub | Emergent → bouton **Save** → **Save to GitHub** | — |
| Un compte MongoDB Atlas | https://www.mongodb.com/cloud/atlas/register | offre M0 gratuite |
| Un compte Resend (emails) | https://resend.com | gratuit jusqu'à 3 000 emails/mois |
| L'accès DNS du domaine `outsidersproduction.ma` | chez votre registraire | — |

Récupérez l'**ID** de votre projet (différent du nom) : Console Google Cloud → sélecteur de projet → colonne « ID ».
Dans la suite, remplacez `VOTRE_ID_PROJET` par cet ID.

---

## Étape 1 — Récupérer le code

```bash
git clone https://github.com/VOTRE_COMPTE/VOTRE_DEPOT.git outsiders
cd outsiders
```

Les fichiers utiles au déploiement sont déjà prêts :
- `backend/Dockerfile`, `backend/.env.example`
- `frontend/Dockerfile`, `frontend/nginx.conf.template`

---

## Étape 2 — Base de données MongoDB Atlas

1. Créez un cluster **M0 (gratuit)**, de préférence dans une région européenne (par exemple Paris ou Francfort).
2. **Database Access** → *Add New Database User* : choisissez un nom et un mot de passe (sans caractères spéciaux, c'est plus simple).
3. **Network Access** → *Add IP Address* → `0.0.0.0/0`. Cloud Run n'a pas d'adresse IP fixe, et la base reste protégée par le mot de passe.
4. **Connect** → *Drivers* → copiez l'adresse, qui ressemble à
   `mongodb+srv://UTILISATEUR:MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## Étape 3 — Emails avec Resend

1. **Domains** → *Add Domain* → `outsidersproduction.ma`. Ajoutez chez votre registraire les enregistrements DNS indiqués (SPF, DKIM), puis attendez que le statut passe à **Verified**.
2. **API Keys** → *Create API Key* avec la permission **Sending access**. Copiez la clé (`re_...`) : elle ne sera plus affichée ensuite.
3. Pour recevoir les messages du formulaire, la boîte `hello@outsidersproduction.ma` doit exister (Google Workspace, Zoho, ou la messagerie de votre hébergeur).

---

## Étape 4 — Préparer Google Cloud

```bash
gcloud auth login
gcloud config set project VOTRE_ID_PROJET
gcloud config set run/region europe-west1

gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com
```

### Enregistrer les secrets
Les secrets ne sont jamais écrits dans le code.

```bash
printf '%s' 'mongodb+srv://UTILISATEUR:MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority' | gcloud secrets create MONGO_URL --data-file=-
printf '%s' "$(openssl rand -hex 32)" | gcloud secrets create JWT_SECRET --data-file=-
printf '%s' 'UnMotDePasseAdminFort2026!' | gcloud secrets create ADMIN_PASSWORD --data-file=-
printf '%s' 're_votre_cle_resend' | gcloud secrets create RESEND_API_KEY --data-file=-
```

Autorisez Cloud Run à lire ces secrets :

```bash
PROJECT_NUMBER=$(gcloud projects describe VOTRE_ID_PROJET --format='value(projectNumber)')
for s in MONGO_URL JWT_SECRET ADMIN_PASSWORD RESEND_API_KEY; do
  gcloud secrets add-iam-policy-binding $s \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

---

## Étape 5 — Déployer l'API (backend)

```bash
gcloud run deploy outsiders-api \
  --source backend \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars "DB_NAME=outsiders,ADMIN_EMAIL=admin@outsidersproduction.ma,EMAIL_PROVIDER=resend,EMAIL_FROM_NAME=Outsiders Production,EMAIL_FROM=Outsiders Production <no-reply@outsidersproduction.ma>,CONTACT_NOTIFY_EMAIL=hello@outsidersproduction.ma,CORS_ORIGINS=https://www.outsidersproduction.ma,FRONTEND_URL=https://www.outsidersproduction.ma" \
  --set-secrets "MONGO_URL=MONGO_URL:latest,JWT_SECRET=JWT_SECRET:latest,ADMIN_PASSWORD=ADMIN_PASSWORD:latest,RESEND_API_KEY=RESEND_API_KEY:latest"
```

À la fin, notez l'adresse affichée, par exemple `https://outsiders-api-abc123-ew.a.run.app`.
Vérifiez qu'elle répond : `https://outsiders-api-…run.app/api/` doit renvoyer `{"message":"Outsiders Production API"}`.

> Au premier démarrage, le compte admin est créé automatiquement avec `ADMIN_EMAIL` et le secret `ADMIN_PASSWORD`.
> Les démarrages suivants ne le modifient plus : changez ensuite le mot de passe depuis l'espace admin.

---

## Étape 6 — Déployer le site (frontend)

Remplacez l'adresse par celle notée à l'étape 5, **sans `/` à la fin** :

```bash
gcloud run deploy outsiders-web \
  --source frontend \
  --allow-unauthenticated \
  --memory 256Mi \
  --set-env-vars "BACKEND_URL=https://outsiders-api-abc123-ew.a.run.app"
```

Ouvrez l'adresse `https://outsiders-web-…run.app` : le site doit s'afficher.
Tant que le domaine n'est pas branché (étape 7), le lien « Mot de passe oublié » pointera déjà vers `www.outsidersproduction.ma`.

---

## Étape 7 — Brancher le domaine

```bash
gcloud beta run domain-mappings create --service outsiders-web --domain www.outsidersproduction.ma
gcloud beta run domain-mappings describe --domain www.outsidersproduction.ma
```

Ajoutez chez votre registraire l'enregistrement DNS indiqué (en général un `CNAME www → ghs.googlehosted.com.`).
Le certificat HTTPS est créé automatiquement en 15 minutes à quelques heures.
Validez d'abord la propriété du domaine si Google la demande (Search Console).

Si vous utilisez une autre adresse que `https://www.outsidersproduction.ma`, mettez à jour l'API :

```bash
gcloud run services update outsiders-api \
  --update-env-vars "FRONTEND_URL=https://VOTRE_ADRESSE,CORS_ORIGINS=https://VOTRE_ADRESSE"
```

---

## Étape 8 — Vérifications

1. Ouvrez le site, changez de langue (FR/EN) et faites défiler toutes les sections.
2. Allez sur `/admin` et connectez-vous avec `admin@outsidersproduction.ma` et le mot de passe du secret `ADMIN_PASSWORD`.
3. Ouvrez l'onglet **Mot de passe** et choisissez un nouveau mot de passe.
4. Envoyez un message depuis le formulaire de contact : il doit apparaître dans **Messages**, et un email doit arriver sur `hello@`.
5. Testez **Mot de passe oublié** sur la page de connexion.
6. Créez le compte éditeur de votre client dans **Comptes éditeurs**.

---

## Le contenu modifié dans Emergent

Les textes de départ sont dans le code (`frontend/src/lib/content.js`) et s'affichent tout de suite.
En revanche, **les modifications faites dans l'admin de la version Emergent ne sont pas transférées** : contenu, images importées, messages et comptes sont stockés dans la base d'Emergent.
Refaites ces modifications dans l'admin de la nouvelle version, ou demandez un export/import du contenu.

---

## Mettre à jour le site

Après une modification du code (nouveau push sur GitHub, puis `git pull`) :

```bash
gcloud run deploy outsiders-api --source backend
gcloud run deploy outsiders-web --source frontend
```

Les variables et secrets déjà configurés sont conservés.

## Pour aller plus loin
- **Démarrage à froid** : sans visite pendant un moment, le premier chargement peut prendre 2 à 3 secondes. Pour l'éviter, ajoutez `--min-instances 1` (payant, quelques euros par mois).
- **Logs** : `gcloud run services logs read outsiders-api --limit 50`
- **Changer un secret** : `printf '%s' 'nouvelle_valeur' | gcloud secrets versions add RESEND_API_KEY --data-file=-`, puis redéployez l'API.

## Dépannage

| Problème | Cause probable | Solution |
|---|---|---|
| Erreur 502 sur `/api` | `BACKEND_URL` incorrect | Vérifiez l'adresse (https, sans `/` final), puis redéployez `outsiders-web` |
| Connexion admin qui « ne tient pas » | Le site est ouvert via l'adresse de l'API | Utilisez toujours l'adresse `outsiders-web` ou votre domaine |
| Aucun email reçu | Domaine non vérifié sur Resend, ou boîte `hello@` inexistante | Vérifiez le statut du domaine sur Resend et lisez les logs de l'API |
| L'API ne démarre pas | Secret manquant ou adresse MongoDB incorrecte | `gcloud run services logs read outsiders-api` |
| Image refusée à l'import | Fichier de plus de 6 Mo ou qui n'est pas une image | Compressez l'image (JPEG, moins de 6 Mo) |

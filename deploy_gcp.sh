#!/usr/bin/env bash
# Déploiement Outsiders Production sur Google Cloud Run. Usage : ./deploy_gcp.sh (depuis la racine du projet)
set -euo pipefail

# ====== À RENSEIGNER ======
PROJECT_ID="${PROJECT_ID:-${GOOGLE_CLOUD_PROJECT:-}}"
REGION="europe-west1"
SITE_URL="https://www.outsidersproduction.ma"
ADMIN_EMAIL="admin@outsidersproduction.ma"
CONTACT_EMAIL="hello@outsidersproduction.ma"
EMAIL_FROM="Outsiders Production <no-reply@outsidersproduction.ma>"
# ==========================

if [ -z "$PROJECT_ID" ]; then
  echo "Vos projets Google Cloud :"
  gcloud projects list --format="table(projectId,name)"
  read -rp "Copiez l'ID du projet (colonne PROJECT_ID) : " PROJECT_ID
fi
echo "Projet utilisé : $PROJECT_ID"

gcloud config set project "$PROJECT_ID"
gcloud config set run/region "$REGION"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
SA="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Droits nécessaires à la construction depuis les sources (projets récents)
for role in roles/run.builder roles/storage.objectViewer roles/artifactregistry.writer roles/logging.logWriter; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="$SA" --role="$role" --condition=None >/dev/null
done

ensure_secret() {
  local name="$1" prompt="$2" value
  if gcloud secrets describe "$name" >/dev/null 2>&1; then
    echo "Secret $name : déjà présent"
  else
    if [ "$name" = "JWT_SECRET" ]; then value=$(openssl rand -hex 32); else read -rsp "$prompt : " value; echo; fi
    printf '%s' "$value" | gcloud secrets create "$name" --data-file=-
  fi
  gcloud secrets add-iam-policy-binding "$name" --member="$SA" --role="roles/secretmanager.secretAccessor" >/dev/null
}

ensure_secret MONGO_URL "Adresse MongoDB Atlas (mongodb+srv://...)"
ensure_secret JWT_SECRET ""
ensure_secret ADMIN_PASSWORD "Mot de passe admin initial"
ensure_secret RESEND_API_KEY "Clé API Resend (re_...)"

# Espace de stockage des vidéos importées depuis l'admin (privé, lu uniquement via l'API)
VIDEO_BUCKET="${PROJECT_ID}-outsiders-videos"
gcloud services enable storage.googleapis.com
if ! gcloud storage buckets describe "gs://${VIDEO_BUCKET}" >/dev/null 2>&1; then
  gcloud storage buckets create "gs://${VIDEO_BUCKET}" --location="$REGION" --uniform-bucket-level-access
fi
gcloud storage buckets add-iam-policy-binding "gs://${VIDEO_BUCKET}" --member="$SA" --role="roles/storage.objectUser" >/dev/null

gcloud run deploy outsiders-api \
  --source backend \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --set-env-vars "^|^DB_NAME=outsiders|GCS_BUCKET=${VIDEO_BUCKET}|ADMIN_EMAIL=${ADMIN_EMAIL}|EMAIL_PROVIDER=resend|EMAIL_FROM_NAME=Outsiders Production|EMAIL_FROM=${EMAIL_FROM}|CONTACT_NOTIFY_EMAIL=${CONTACT_EMAIL}|CORS_ORIGINS=${SITE_URL}|FRONTEND_URL=${SITE_URL}" \
  --set-secrets "MONGO_URL=MONGO_URL:latest,JWT_SECRET=JWT_SECRET:latest,ADMIN_PASSWORD=ADMIN_PASSWORD:latest,RESEND_API_KEY=RESEND_API_KEY:latest"

API_URL=$(gcloud run services describe outsiders-api --format='value(status.url)')
echo "API : $API_URL"

gcloud run deploy outsiders-web \
  --source frontend \
  --allow-unauthenticated \
  --memory 256Mi \
  --set-env-vars "BACKEND_URL=${API_URL}"

WEB_URL=$(gcloud run services describe outsiders-web --format='value(status.url)')
echo ""
echo "Site en ligne : $WEB_URL"
echo "Admin : $WEB_URL/admin  (identifiant : $ADMIN_EMAIL)"
echo "Domaine : gcloud beta run domain-mappings create --service outsiders-web --domain ${SITE_URL#https://}"

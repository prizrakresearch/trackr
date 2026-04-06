#!/usr/bin/env bash
set -euo pipefail

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud is required. Install Google Cloud SDK first."
  exit 1
fi

PROJECT_ID="${1:-}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-trackr-backend}"
CORS_ORIGINS="${4:-http://localhost:5173,http://127.0.0.1:5173}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CORS_ORIGIN_REGEX="${5:-https://.*\\.vercel\\.app}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "Usage: ./deploy_cloudrun.sh <PROJECT_ID> [REGION] [SERVICE_NAME] [CORS_ORIGINS]"
  echo "Example: ./deploy_cloudrun.sh my-project us-central1 trackr-backend https://myapp.vercel.app"
  exit 1
fi

gcloud config set project "${PROJECT_ID}"

echo "Enabling required APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com

echo "Building container image..."
cd "${SCRIPT_DIR}"
gcloud builds submit --tag "gcr.io/${PROJECT_ID}/${SERVICE_NAME}" .

echo "Deploying Cloud Run service..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "gcr.io/${PROJECT_ID}/${SERVICE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars "TRACKR_DB_BACKEND=firestore,CORS_ORIGINS=${CORS_ORIGINS},CORS_ORIGIN_REGEX=${CORS_ORIGIN_REGEX}"

echo "Cloud Run deployment completed."

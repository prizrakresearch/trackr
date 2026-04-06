#!/usr/bin/env bash
set -euo pipefail

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud is required. Install Google Cloud SDK first."
  exit 1
fi

PROJECT_ID="${1:-}"
LOCATION="${2:-us-central}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "Usage: ./init_firestore.sh <PROJECT_ID> [LOCATION]"
  echo "Example: ./init_firestore.sh my-project us-central"
  exit 1
fi

gcloud config set project "${PROJECT_ID}"

echo "Enabling Firestore API..."
gcloud services enable firestore.googleapis.com

echo "Creating Firestore Native database..."
gcloud firestore databases create --location="${LOCATION}" --type=firestore-native || true

echo "Firestore initialization attempted. If database already exists, this is expected."

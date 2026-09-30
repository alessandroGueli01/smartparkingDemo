#!/usr/bin/env bash
set -euo pipefail

echo "Esecuzione backend Java localmente (richiede maven e postgresql in esecuzione)"

export SPRING_DATASOURCE_URL=${SPRING_DATASOURCE_URL:-jdbc:postgresql://localhost:5432/pissirdb}
export SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME:-pissir}
export SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD:-pissir}
export JWT_SECRET=${JWT_SECRET:-devsecret}

echo "SPRING_DATASOURCE_URL=$SPRING_DATASOURCE_URL"

cd java-backend
if command -v mvn >/dev/null 2>&1; then
  mvn spring-boot:run
else
  echo "Maven non trovato localmente. Eseguo tramite container Maven..."
  docker run --rm -v "$PWD":/workspace -w /workspace -e SPRING_DATASOURCE_URL="$SPRING_DATASOURCE_URL" -e SPRING_DATASOURCE_USERNAME="$SPRING_DATASOURCE_USERNAME" -e SPRING_DATASOURCE_PASSWORD="$SPRING_DATASOURCE_PASSWORD" -e JWT_SECRET="$JWT_SECRET" maven:3.8.8-jdk-17 mvn spring-boot:run
fi

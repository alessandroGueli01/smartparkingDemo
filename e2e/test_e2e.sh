#!/usr/bin/env bash
set -euo pipefail

echo "E2E: register -> login -> request charging -> get queue"

API_PROXY="http://localhost:3000/api"

echo "Registering user..."
curl -s -X POST $API_PROXY/register -H "Content-Type: application/json" -d '{"username":"e2euser","password":"e2epass","tipo":"base"}' | jq .

echo "Logging in..."
TOKEN_JSON=$(curl -s -X POST $API_PROXY/login -H "Content-Type: application/json" -d '{"username":"e2euser","password":"e2epass"}')
echo "$TOKEN_JSON" | jq .

TOKEN=$(echo "$TOKEN_JSON" | jq -r '.token')
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Login failed or token not found" >&2
  exit 1
fi

echo "Requesting charging..."
curl -s -X POST $API_PROXY/java/charging/request -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"userId":1,"placeId":1,"targa":"E2E123","desiredPercent":80}' | jq .

echo "Getting queue..."
curl -s -X GET $API_PROXY/java/charging/queue -H "Authorization: Bearer $TOKEN" | jq .

echo "E2E complete"

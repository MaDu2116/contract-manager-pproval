#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL
MAX_RETRIES=30
RETRY_COUNT=0

until cd server && npx prisma db push --accept-data-loss 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: PostgreSQL not ready after ${MAX_RETRIES} attempts"
    exit 1
  fi
  echo "PostgreSQL not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 2s..."
  sleep 2
done

echo "Database schema applied successfully"

# Run seed (optional, only on first run)
cd /app/server && npx prisma db seed 2>/dev/null || echo "Seed skipped or already applied"

echo "Starting application..."
cd /app/server && node dist/index.js

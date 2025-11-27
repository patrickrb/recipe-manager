#!/bin/bash

# Script to copy production database to local database
# This script will:
# 1. Dump data from production database
# 2. Restore to local database

set -e  # Exit on error

echo "🔄 Starting database migration from production to local..."

# Use PostgreSQL 17 binaries to match production version
PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"

# Database URLs
PROD_URL="postgresql://recipe_user:1DwWOOjWf2ggGZe3pcqOoBWcu@primary-burns-db.postgres.database.azure.com:5432/recipe_manager?sslmode=require"
LOCAL_URL="postgresql://postgres:postgres@localhost:5432/recipe_manager"

# Temporary dump file
DUMP_FILE="/tmp/prod_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Dumping production database..."
"$PG_DUMP" "$PROD_URL" -F p -f "$DUMP_FILE"

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Failed to create dump file"
    exit 1
fi

echo "✅ Production database dumped successfully to $DUMP_FILE"

echo "🧹 Dropping and recreating local database..."
# Drop and recreate the local database
"$PSQL" "postgresql://postgres:postgres@localhost:5432/postgres" -c "DROP DATABASE IF EXISTS recipe_manager;"
"$PSQL" "postgresql://postgres:postgres@localhost:5432/postgres" -c "CREATE DATABASE recipe_manager;"

echo "📥 Restoring to local database..."
"$PSQL" "$LOCAL_URL" < "$DUMP_FILE"

echo "✅ Database restored successfully!"

echo "🧹 Cleaning up dump file..."
rm "$DUMP_FILE"

echo "✨ Migration complete! Production data has been copied to local database."

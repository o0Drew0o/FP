#!/bin/bash

# Proton Drive Remote and Folder Configuration
REMOTE="tcadb:/"
LOCAL_DIR="$(dirname "$0")"  # Same directory as the script
DB_FILE="crypto_army.db"

echo "Uploading database to Proton Drive..."

# Upload the database file
rclone copy "$LOCAL_DIR/$DB_FILE" "$REMOTE" --progress

if [ $? -eq 0 ]; then
  echo "Successfully uploaded $DB_FILE to Proton Drive."
else
  echo "Error: Failed to upload $DB_FILE."
  exit 1
fi

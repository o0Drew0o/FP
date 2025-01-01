#!/bin/bash

# Proton Drive Remote and Folder Configuration
REMOTE="tcadb:"
LOCAL_DIR="$(dirname "$0")"  # Same directory as the script
DB_FILE="crypto_army.db"

echo "Downloading database from Proton Drive..."

# Download the database file
rclone copy "$REMOTE$DB_FILE" "$LOCAL_DIR" --progress

if [ $? -eq 0 ]; then
  echo "Successfully downloaded $DB_FILE to $LOCAL_DIR."
else
  echo "Error: Failed to download $DB_FILE."
  exit 1
fi

#!/bin/bash

# Ensure the local path exists
mkdir -p /opt/render/project/src/TCA

# Proton Drive Remote and Folder Configuration
REMOTE="tcadb:"
LOCAL_DIR="$(dirname "$0")"  # Same directory as the script
DB_FILE="crypto_army.db"

echo "Downloading database from Proton Drive..."

# Download the database file
./rclone --config ./config/rclone.conf copy tcadb:crypto_army.db /opt/render/project/src/TCA/ --progress

if [ $? -eq 0 ]; then
  echo "Successfully downloaded $DB_FILE to $LOCAL_DIR."
else
  echo "Error: Failed to download $DB_FILE."
  exit 1
fi

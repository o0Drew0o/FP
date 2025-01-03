#!/bin/bash

# Full path to rclone binary
RCLONE="./rclone"

# Ensure the rclone binary exists
if [ ! -f "$RCLONE" ]; then
  echo "Error: rclone binary not found at $RCLONE"
  exit 1
fi

SOURCE_FILE="/opt/render/project/src/TCA/crypto_army.db"
if [ ! -f "$SOURCE_FILE" ]; then
  echo "Error: Source file $SOURCE_FILE not found."
  exit 1
fi

echo "Attempting to upload crypto_army.db..."
$RCLONE --config ./config/rclone.conf copyto "$SOURCE_FILE" tcadb:tcadb/crypto_army.db --progress

if [ $? -eq 0 ]; then
  echo "Successfully uploaded crypto_army.db to Proton Drive."
else
  echo "Error: Failed to upload crypto_army.db."
  exit 1
fi

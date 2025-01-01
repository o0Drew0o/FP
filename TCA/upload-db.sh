#!/bin/bash

# Path to rclone binary
RCLONE="./rclone"

# Ensure the rclone binary exists
if [ ! -f "$RCLONE" ]; then
  echo "Error: rclone binary not found at $RCLONE"
  exit 1
fi

# Ensure the source file exists
SOURCE_FILE="/opt/render/project/src/TCA/crypto_army.db"
if [ ! -f "$SOURCE_FILE" ]; then
  echo "Error: Source file $SOURCE_FILE not found."
  exit 1
fi

# Upload the database file to Proton Drive
rclone --config "C:/Users/CodeCenter/AppData/Roaming/rclone/rclone.conf" copy ./crypto_army.db tcadb:tcadb/crypto_army.db --progress

if [ $? -eq 0 ]; then
  echo "Successfully uploaded crypto_army.db to Proton Drive."
else
  echo "Error: Failed to upload crypto_army.db."
  exit 1
fi

#!/bin/bash

# Path to rclone binary
RCLONE="./.rclone/rclone"

# Ensure the rclone binary exists
if [ ! -f "$RCLONE" ]; then
  echo "Error: rclone binary not found at $RCLONE"
  exit 1
fi

# Ensure the target directory exists
TARGET_DIR="/opt/render/project/src/TCA"
mkdir -p "$TARGET_DIR"

# Copy the database file from Proton Drive
./rclone --config ./config/rclone.conf copy tcadb:tcadb/crypto_army.db /opt/render/project/src/TCA/ --progress

if [ $? -eq 0 ]; then
  echo "Successfully downloaded crypto_army.db to $TARGET_DIR"
else
  echo "Error: Failed to download crypto_army.db."
  exit 1
fi

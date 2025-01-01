#!/bin/bash

# Full path to rclone binary
RCLONE="./rclone"

# Ensure the target directory exists
mkdir -p /opt/render/project/src/TCA

# Correct path to copy the file
$RCLONE --config ./config/rclone.conf copy tcadb:crypto_army.db /opt/render/project/src/TCA/ --progress

if [ $? -eq 0 ]; then
  echo "Successfully downloaded crypto_army.db to /opt/render/project/src/TCA/"
else
  echo "Error: Failed to download crypto_army.db."
  exit 1
fi

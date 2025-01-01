#!/bin/bash

# Ensure the target directory exists
mkdir -p /opt/render/project/src/TCA

# Copy the database file from Proton Drive
./rclone --config ./config/rclone.conf copy tcadb:crypto_army.db /opt/render/project/src/TCA/ --progress

if [ $? -eq 0 ]; then
  echo "Successfully downloaded crypto_army.db to /opt/render/project/src/TCA/"
else
  echo "Error: Failed to download crypto_army.db."
  exit 1
fi

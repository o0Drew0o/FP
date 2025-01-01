#!/bin/bash

echo "Starting download-db.sh..."
echo "Current working directory: $(pwd)"
echo "Checking for rclone binary at ./rclone..."
if [ ! -f "./rclone" ]; then
  echo "Error: rclone binary not found."
  exit 1
fi

echo "Attempting to download crypto_army.db..."
./rclone --config ./config/rclone.conf copy tcadb:tcadb/crypto_army.db /opt/render/project/src/TCA/ --progress

if [ $? -eq 0 ]; then
  echo "Successfully downloaded crypto_army.db to /opt/render/project/src/TCA/"
else
  echo "Error: Failed to download crypto_army.db."
  exit 1
fi

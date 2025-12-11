#!/bin/bash

# Router DHCP Updater Installation Script for Umbrel

INSTALL_DIR="/home/umbrel/router-dhcp-updater"
SERVICE_NAME="router-dhcp-updater"

echo "[INFO] Installing Router DHCP Updater..."

# Find Node.js path
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    echo "[ERROR] Node.js not found. Please install Node.js first."
    exit 1
fi

echo "[INFO] Found Node.js at: $NODE_PATH"

# Create installation directory
sudo mkdir -p "$INSTALL_DIR"

# Copy files
sudo cp -r src package.json tsconfig.json "$INSTALL_DIR/"
sudo cp .env "$INSTALL_DIR/" 2>/dev/null || echo "Warning: .env not found"

# Install dependencies
cd "$INSTALL_DIR"
sudo npm install
sudo npm run build

# Create systemd service
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=Router DHCP DNS Updater
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=umbrel
WorkingDirectory=${INSTALL_DIR}
ExecStart=${NODE_PATH} ${INSTALL_DIR}/dist/run.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}
sudo systemctl start ${SERVICE_NAME}

echo ""
echo "[INFO] Installation complete!"
echo "[INFO] Node.js path: ${NODE_PATH}"
echo "[INFO] Check status: sudo systemctl status ${SERVICE_NAME}"
echo "[INFO] View logs: sudo journalctl -u ${SERVICE_NAME} -f"
echo ""


#!/bin/bash
# ============================================================
# FLAG AI Platform — DigitalOcean Server Setup
# Run on a fresh Ubuntu 24.04 droplet as root:
#   curl -fsSL https://raw.githubusercontent.com/udaydhanush0207/FLAG_AI_Engineering_Portfolio/master/scripts/deploy_server.sh | bash
#
# After running, edit /opt/flag-ai-platform/.env with real keys,
# then: systemctl restart brick
# ============================================================
set -e

echo "==> [1/8] System update + packages"
apt-get update -y
apt-get upgrade -y
apt-get install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx git ufw curl

echo "==> [2/8] Firewall"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> [3/8] Clone repo"
rm -rf /opt/flag-ai-platform
git clone https://github.com/udaydhanush0207/FLAG_AI_Engineering_Portfolio.git /opt/flag-ai-platform
cd /opt/flag-ai-platform

echo "==> [4/8] Python virtualenv + deps"
python3 -m venv backend/venv
backend/venv/bin/pip install --upgrade pip
backend/venv/bin/pip install -r backend/requirements.txt

echo "==> [5/8] Create .env (fill in real keys after setup)"
cat > /opt/flag-ai-platform/.env << 'ENVEOF'
# ─── Fill in your real keys after running this script ───
ANTHROPIC_API_KEY=REPLACE_ME
GOOGLE_API_KEY=REPLACE_ME
PERPLEXITY_API_KEY=
OPENAI_API_KEY=REPLACE_ME
SUPABASE_URL=REPLACE_ME
SUPABASE_SERVICE_KEY=REPLACE_ME
TWILIO_ACCOUNT_SID=ACyour-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TELEGRAM_BOT_TOKEN=your-bot-token
INGEST_API_KEY=flag-ingest-2026
ENVEOF

echo "==> [6/8] Systemd service"
cat > /etc/systemd/system/brick.service << 'SVCEOF'
[Unit]
Description=FLAG AI Platform - BRICK v2
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/flag-ai-platform
EnvironmentFile=/opt/flag-ai-platform/.env
ExecStart=/opt/flag-ai-platform/backend/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SVCEOF

echo "==> [7/8] Nginx config"
cat > /etc/nginx/sites-available/brick << 'NGXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
NGXEOF

ln -sf /etc/nginx/sites-available/brick /etc/nginx/sites-enabled/brick
rm -f /etc/nginx/sites-enabled/default
nginx -t

echo "==> [8/8] Start services"
systemctl daemon-reload
systemctl enable brick
systemctl start brick
systemctl reload nginx

sleep 4
echo ""
echo "==> Health check (will fail until .env is filled in):"
curl -s http://localhost:8000/api/health || echo "WARN: backend not responding yet — fill in /opt/flag-ai-platform/.env then run: systemctl restart brick"
echo ""
echo "============================================================"
echo " NEXT STEP: Fill in /opt/flag-ai-platform/.env with real keys"
echo " Then run:  systemctl restart brick"
echo " Then test: curl http://localhost:8000/api/health"
echo "============================================================"

# Setup Guide

## Prerequisites
- A VPS (Hetzner CX22, Hostinger KVM1, or DigitalOcean Basic Droplet)
- OpenAI API key (from platform.openai.com)
- SSH access to your server

## Step-by-Step Setup

Detailed setup instructions will be added as each project is built.

### Quick Start
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Clone the repo
git clone https://github.com/udaydhanush0207/FLAG_AI_Engineering_Portfolio.git
cd FLAG_AI_Engineering_Portfolio

# Run the setup script
chmod +x infrastructure/server-setup.sh
./infrastructure/server-setup.sh

# Configure environment
cp .env.example .env
nano .env  # Add your OpenAI API key

# Start everything
docker compose up -d
```

## Provider-Specific Instructions
- [Hetzner Setup](./hetzner-setup.md)
- [Hostinger Setup](./hostinger-setup.md)
- [DigitalOcean Setup](./digitalocean-setup.md)

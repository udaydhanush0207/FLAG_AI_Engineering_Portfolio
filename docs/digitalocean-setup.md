# DigitalOcean Setup

## Create Droplet
1. Go to [digitalocean.com](https://digitalocean.com)
2. Create Droplet:
   - **Image:** Ubuntu 24.04
   - **Plan:** Basic ($6/mo, 1GB RAM)
   - **Datacenter:** NYC1 or SFO3
   - **Auth:** SSH key
3. Copy IP address

## Cost
- $6/month (1GB RAM) or $12/month (2GB RAM recommended)
- Monthly billing

## Connect
```bash
ssh root@YOUR_IP
```

Then follow the [main setup guide](./setup-guide.md).

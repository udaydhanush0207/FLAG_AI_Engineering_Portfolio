# Hetzner CX22 Setup

## Create Server
1. Go to [hetzner.com/cloud](https://hetzner.com/cloud)
2. Sign up → Add payment method
3. New Project → "BRICK"
4. Create Server:
   - **Name:** brick-flag
   - **Location:** Ashburn, VA
   - **Image:** Ubuntu 24.04
   - **Type:** CX22 (2 vCPU, 4GB RAM, 40GB NVMe)
   - **SSH Key:** Generate or upload
5. Copy public IP address

## Cost
- $4.15/month (hourly billing, cancel anytime)
- No setup fee
- No commitment

## Connect
```bash
ssh root@YOUR_IP
```

Then follow the [main setup guide](./setup-guide.md).

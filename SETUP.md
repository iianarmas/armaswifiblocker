# Armas WiFi - Setup Guide

This guide will help you set up the parental WiFi control system.

## Overview

The system has two parts:
1. **Backend** - Python Flask API running on your Ubuntu server (192.168.100.16)
2. **Frontend** - React Native app running on your phone/browser

## Part 1: Ubuntu Server Setup

SSH into your Ubuntu server:
```bash
ssh your-username@192.168.100.16
```

### Step 1.1: Install Dependencies

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv arp-scan nmap iptables-persistent
```

When asked about saving iptables rules, select **Yes** for both IPv4 and IPv6.

### Step 1.2: Enable IP Forwarding

This allows your server to forward network traffic.

```bash
# Edit sysctl.conf
sudo nano /etc/sysctl.conf
```

Find the line `#net.ipv4.ip_forward=1` and uncomment it (remove the #):
```
net.ipv4.ip_forward=1
```

Save and exit (Ctrl+X, Y, Enter), then apply:
```bash
sudo sysctl -p
```

### Step 1.3: Find Your Network Interface

```bash
ip link show
```

Look for your ethernet interface (usually `eth0`, `enp0s3`, `eno1`, or similar). Note this down.

### Step 1.4: Configure iptables NAT

Replace `eth0` with your actual interface name from step 1.3:

```bash
# Enable NAT (Network Address Translation)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Allow forwarding
sudo iptables -A FORWARD -i eth0 -o eth0 -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i eth0 -o eth0 -j ACCEPT

# Save the rules
sudo netfilter-persistent save
```

### Step 1.5: Copy Backend Files

From your Windows PC, copy the backend folder to your server. You can use SCP, SFTP, or any file transfer method.

Using PowerShell:
```powershell
scp -r backend your-username@192.168.100.16:/opt/armas-wifi/
```

Or create the folder on the server and copy manually:
```bash
sudo mkdir -p /opt/armas-wifi
sudo chown $USER:$USER /opt/armas-wifi
```

### Step 1.6: Set Up Python Virtual Environment

```bash
cd /opt/armas-wifi/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 1.7: Configure the Backend

```bash
# Edit the .env file
nano /opt/armas-wifi/backend/.env
```

Update these values:
```
API_KEY=your-secure-random-key-here
NETWORK_RANGE=192.168.100.0/24
NETWORK_INTERFACE=eth0
```

**Important:**
- Change `API_KEY` to a secure random string (you'll need this in the app)
- Update `NETWORK_INTERFACE` to match your actual interface from step 1.3
- Update `NETWORK_RANGE` if your network uses a different range

### Step 1.8: Test the Backend

```bash
cd /opt/armas-wifi/backend
source venv/bin/activate
python run.py
```

You should see:
```
Starting Armas WiFi Control API on 0.0.0.0:5000
```

Test from another terminal:
```bash
curl -H "X-API-Key: your-api-key" http://localhost:5000/api/health
```

Press Ctrl+C to stop the test.

### Step 1.9: Install as a Service

```bash
# Copy the service file
sudo cp /opt/armas-wifi/backend/wifi-control.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable wifi-control
sudo systemctl start wifi-control

# Check status
sudo systemctl status wifi-control
```

### Step 1.10: Open Firewall Port

```bash
# Allow port 5000 from local network only
sudo ufw allow from 192.168.100.0/24 to any port 5000
```

---

## Part 2: Router Configuration

### Step 2.1: Find Your Router's IP

Your router is likely at `192.168.100.1`. Try opening this in your browser.

### Step 2.2: Login to Router Admin

1. Open browser and go to your router's IP
2. Login with admin credentials (check router sticker or ISP documentation)

### Step 2.3: Change Default Gateway

1. Find **DHCP Settings** or **LAN Settings** (location varies by router)
2. Look for "Default Gateway" or "Gateway Address"
3. **Write down the current value** (e.g., 192.168.100.1) - this is your fallback
4. Change it to: **192.168.100.16** (your Ubuntu server)
5. Save and apply

### Step 2.4: Reconnect Your Devices

After changing the gateway, your devices need to get new network settings:
- Disconnect and reconnect WiFi on each device, OR
- Restart the device, OR
- Wait for DHCP lease renewal (can take hours)

### Step 2.5: Verify Traffic Flows Through Server

On your Ubuntu server:
```bash
sudo tcpdump -i eth0 -n | head -20
```

Browse the internet from another device. You should see traffic appearing in tcpdump.

---

## Part 3: Frontend Setup (Windows Development)

### Step 3.1: Install Dependencies

Open PowerShell in the `frontend` folder:
```powershell
cd frontend
npm install
```

### Step 3.2: Configure the App

Edit `frontend/services/config.js`:
```javascript
export const DEFAULT_API_URL = 'http://192.168.100.16:5000';
export const DEFAULT_API_KEY = 'your-secure-random-key-here';  // Same as backend
```

### Step 3.3: Run the App

```powershell
npm start
```

Then:
- Press `w` for web browser
- Press `a` for Android (requires Expo Go app)

### Step 3.4: Test the App

1. Open the app in your browser or phone
2. Go to Settings and verify the server URL and API key
3. Click "Test Connection"
4. If successful, go back to Dashboard - you should see your devices

---

## Part 4: Reverting Router (Fallback)

If your Ubuntu server goes down and you need internet:

1. Login to router admin panel
2. Go to DHCP/LAN Settings
3. Change "Default Gateway" back to your router's IP (the one you wrote down)
4. Save and apply
5. Reconnect devices

When server is back up, change gateway back to 192.168.100.16.

---

## Troubleshooting

### Cannot connect to server from app

1. Make sure your phone is on the same WiFi network
2. Check if server is running: `sudo systemctl status wifi-control`
3. Check firewall: `sudo ufw status`
4. Verify API key matches between app and server

### Devices not showing up

1. SSH to server and run: `sudo arp-scan --interface=eth0 192.168.100.0/24`
2. If arp-scan fails, try: `arp -a`
3. Make sure the network range in .env matches your network

### Blocking doesn't work

1. Verify IP forwarding is enabled: `cat /proc/sys/net/ipv4/ip_forward` (should be 1)
2. Check iptables rules: `sudo iptables -L FORWARD -n`
3. Make sure traffic is going through the server (tcpdump test)

### Server not starting

Check logs:
```bash
sudo journalctl -u wifi-control -f
```

---

## Quick Reference

| Action | Command/Location |
|--------|-----------------|
| Start server | `sudo systemctl start wifi-control` |
| Stop server | `sudo systemctl stop wifi-control` |
| View logs | `sudo journalctl -u wifi-control -f` |
| Block a MAC manually | `sudo iptables -I FORWARD -m mac --mac-source AA:BB:CC:DD:EE:FF -j DROP` |
| Unblock a MAC manually | `sudo iptables -D FORWARD -m mac --mac-source AA:BB:CC:DD:EE:FF -j DROP` |
| List blocked MACs | `sudo iptables -L FORWARD -n` |
| Scan network | `sudo arp-scan --interface=eth0 192.168.100.0/24` |

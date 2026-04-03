# Collabryx AWS EC2 Setup Guide 📡

This folder contains the complete deployment suite for Collabryx on an AWS EC2 instance (Ubuntu 22.04).

## 🛠️ Configuration Details

### 1. Environment Variables (`.env`)
Before running the deployment script, ensure you have your backend environment variables set up. 

**Location**: `/home/ubuntu/collabryx/backend/.env`

Create this file manually on the EC2 instance with the following content:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/collabryx
JWT_SECRET=your_super_secret_high_entropy_key
PORT=3000
```
> [!IMPORTANT]
> PM2 will automatically inject these variables from your `.env` when it starts using the `ecosystem.config.js`.

### 2. AWS Security Group Configuration
To make Collabryx accessible to the world, you must open the following ports in your AWS EC2 Security Group:

| Type | Protocol | Port Range | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | 22 | My IP / 0.0.0.0 | Secure access to the server |
| **HTTP** | TCP | 80 | 0.0.0.0/0 | Public access to Collabryx |
| **HTTPS (Optional)** | TCP | 443 | 0.0.0.0/0 | For SSL (Certbot setup required) |

### 3. Execution Commands
On your remote EC2 server, execute these commands from the root directory:

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

## 🚀 Troubleshooting
- **PM2 Logs**: Run `pm2 logs` to see real-time output from the backend.
- **Nginx Status**: Run `sudo systemctl status nginx` to check if the reverse proxy is healthy.
- **WebSocket Connection**: If real-time sync fails, ensure the `Upgrade` and `Connection` headers are correctly mapped in `/etc/nginx/sites-available/default`.

✨ **Enjoy your live Collabryx instance!**

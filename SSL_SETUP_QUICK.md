# Quick SSL Setup for WebSocket Backend

## Option A: Using Nginx as Reverse Proxy (Recommended)

### Step 1: Install Nginx
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

### Step 2: Get SSL Certificate
```bash
# Replace 'your-domain.com' with your actual domain
sudo certbot --nginx -d your-domain.com
```

### Step 3: Configure Nginx for WebSocket
```bash
sudo nano /etc/nginx/sites-available/your-domain.com
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # WebSocket proxy
    location /ccxt-socket {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Regular HTTP proxy (if needed)
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: Test and Reload
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Update Vercel Environment Variable
- Variable: `NEXT_PUBLIC_BACKEND_WS_URL`
- Value: `wss://your-domain.com`
- Redeploy Vercel app

---

## Option B: Using Cloudflare Tunnel (No Domain Needed)

### Step 1: Install Cloudflare Tunnel
```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

### Step 2: Authenticate
```bash
cloudflared tunnel login
```

### Step 3: Create Tunnel
```bash
cloudflared tunnel create ws-tunnel
```

### Step 4: Create Config
```bash
sudo nano ~/.cloudflared/config.yml
```

Add:
```yaml
tunnel: <tunnel-id>
credentials-file: /home/your-user/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: ws-tunnel.your-account.workers.dev
    service: http://localhost:3001
  - service: http_status:404
```

### Step 5: Run Tunnel
```bash
# Run in background
cloudflared tunnel --config ~/.cloudflared/config.yml run ws-tunnel

# Or use systemd service
sudo cloudflared service install
sudo systemctl start cloudflared
```

### Step 6: Update Vercel Environment Variable
- Variable: `NEXT_PUBLIC_BACKEND_WS_URL`
- Value: `wss://ws-tunnel.your-account.workers.dev`
- Redeploy Vercel app

---

## Option C: Quick Test - Use ngrok (Temporary)

For testing only (not for production):

```bash
# Install ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Run ngrok
ngrok http 3001
```

Use the `wss://` URL it provides (looks like `wss://xxxx.ngrok.io`)

---

## Option D: Update NestJS to Support HTTPS Directly

If you already have SSL certificate:

```typescript
// main.ts
import { readFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      https: {
        key: readFileSync('/path/to/privkey.pem'),
        cert: readFileSync('/path/to/fullchain.pem'),
      },
    })
  );

  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({ origin: true, credentials: true });

  await app.listen(3001, '0.0.0.0');
  console.log('🚀 Server running on https://your-domain.com:3001');
  console.log('🔌 WebSocket available at wss://your-domain.com/ccxt-socket');
}
```

---

## Troubleshooting

### Check if WebSocket endpoint is accessible:
```bash
# Test WebSocket connection
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
  https://your-domain.com/ccxt-socket
```

### Check firewall:
```bash
# Allow ports
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw allow 3001/tcp
```

### Check backend is running:
```bash
curl http://localhost:3001
```


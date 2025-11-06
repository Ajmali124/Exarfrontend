# WebSocket Setup Guide for Vercel Deployment

## 🔴 The Problem

When you deploy to Vercel, your frontend is served over **HTTPS**. Browsers block insecure WebSocket connections (`ws://`) from HTTPS pages due to **mixed content policy**.

## ✅ Solution Implemented

I've updated your code to automatically handle this:

1. **Automatic Protocol Detection**: The code now detects if you're on HTTPS and automatically converts `ws://` to `wss://`
2. **Better Error Handling**: Added detailed console logging to help debug connection issues
3. **Auto-Reconnection**: Added reconnection logic with exponential backoff

## 📝 What You Need to Do

### Option 1: Set Up SSL on Your Backend (Recommended)

You need to enable **WSS (WebSocket Secure)** on your backend server.

#### If using a domain name:

1. **Get SSL Certificate** (Free with Let's Encrypt):
   ```bash
   # Install certbot
   sudo apt-get update
   sudo apt-get install certbot
   
   # Get certificate
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. **Update Your NestJS Backend**:
   
   Install dependencies:
   ```bash
   npm install @nestjs/platform-ws
   ```

   Update `main.ts`:
   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
   import { WsAdapter } from '@nestjs/platform-ws';
   import { readFileSync } from 'fs';
   import { AppModule } from './app.module';

   async function bootstrap() {
     const app = await NestFactory.create<NestFastifyApplication>(
       AppModule,
       new FastifyAdapter({
         logger: true,
         https: {
           key: readFileSync('/etc/letsencrypt/live/your-domain.com/privkey.pem'),
           cert: readFileSync('/etc/letsencrypt/live/your-domain.com/fullchain.pem'),
         },
       })
     );

     app.useWebSocketAdapter(new WsAdapter(app));
     
     app.enableCors({
       origin: true,
       credentials: true,
       methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
       allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
     });

     await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
     console.log('🚀 Server running on https://your-domain.com:3001');
     console.log('🔌 WebSocket available at wss://your-domain.com/ccxt-socket');
   }

   bootstrap();
   ```

3. **Update Vercel Environment Variable**:
   - Variable: `NEXT_PUBLIC_BACKEND_WS_URL`
   - Value: `wss://your-domain.com`
   - Environment: Production, Preview, Development

#### Using Nginx as Reverse Proxy (Alternative):

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Use a WebSocket Proxy Service

If you can't set up SSL, use a service like:
- **Cloudflare Tunnel** (Free)
- **ngrok** (Free tier available)
- **WebSocket Proxy** services

### Option 3: Use Render/Railway (Easier)

These platforms provide HTTPS automatically:

1. Deploy your NestJS backend to **Render** or **Railway**
2. They automatically provide HTTPS endpoints
3. Update `NEXT_PUBLIC_BACKEND_WS_URL` to `wss://your-app.onrender.com`

## 🔍 Testing & Debugging

### Check Browser Console

Open your Vercel site and check the browser console. You should see:

```
🔌 WebSocket URL: wss://your-backend.com/ccxt-socket
✅ WebSocket connected: wss://your-backend.com/ccxt-socket
```

### Common Errors:

1. **"Mixed Content" Error**:
   - ❌ Using `ws://` from HTTPS page
   - ✅ Solution: Use `wss://` or set up SSL

2. **"Connection Refused"**:
   - ❌ Backend server not running
   - ✅ Solution: Start your backend server

3. **"CORS Error"**:
   - ❌ Backend CORS not configured
   - ✅ Solution: Check backend CORS settings

## 📋 Environment Variables

### Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add:
   - **Name**: `NEXT_PUBLIC_BACKEND_WS_URL`
   - **Value**: `wss://your-backend-domain.com` (or `ws://` if on HTTP)
   - **Environment**: Production, Preview, Development

3. **Redeploy** your app after adding the variable

## 🎯 Quick Checklist

- [ ] Backend has SSL certificate (for HTTPS)
- [ ] Backend WebSocket endpoint supports `wss://`
- [ ] CORS configured on backend
- [ ] Environment variable set in Vercel: `NEXT_PUBLIC_BACKEND_WS_URL`
- [ ] Value uses `wss://` if frontend is on HTTPS
- [ ] Backend server is running and accessible
- [ ] Tested connection in browser console

## 💡 Current Implementation

The code now:
- ✅ Automatically converts `ws://` → `wss://` when on HTTPS
- ✅ Logs connection attempts and errors
- ✅ Auto-reconnects on connection loss
- ✅ Handles connection errors gracefully

## 🚀 Next Steps

1. **Set up SSL on your backend** (recommended)
2. **Update environment variable** in Vercel
3. **Redeploy** your Vercel app
4. **Test** the WebSocket connection in browser console

---

**Note**: The code will now automatically handle the protocol conversion, but you still need to ensure your backend supports `wss://` for it to work from Vercel.


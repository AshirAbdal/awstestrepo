# API Server

A simple Python JSON API backend with an HTML/JS frontend.

## Project structure

```
api-server/
├── backend/
│   ├── app.py               # zero-dependency Python backend (stdlib only)
│   └── requirements.txt
├── frontend/
│   ├── index.html           # served by nginx
│   ├── style.css
│   └── app.js               # calls the backend via fetch
└── deploy/
    ├── ecosystem.config.js  # PM2 config for the backend
    └── nginx.conf           # nginx reverse-proxy config
```

## API

| Method | Path            | Description            |
|--------|-----------------|------------------------|
| GET    | /health         | Health check           |
| GET    | /api/items      | List items             |
| POST   | /api/items      | Create item (JSON)     |
| DELETE | /api/items/<id> | Delete an item         |

Every response uses one envelope:

```json
{"success": true, "status": 200, "message": "OK", "data": ...}
```

## Run locally

```bash
# terminal 1 - backend on http://localhost:8000
python3 backend/app.py

# terminal 2 - serve frontend (any static server works)
python3 -m http.server 8080 --directory frontend
```

For the frontend to reach the API in dev, the page must be served on the same
host/port or CORS must be added. Behind nginx this works out of the box via
the `/api/` reverse proxy.

## Deploy to Ubuntu (npm + nginx + pm2 already installed)

On your server:

```bash
# 1. clone the project
cd ~
git clone <your-repo-url> api-server
cd api-server

# 2. start the backend with PM2
mkdir -p logs
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup

# 3. configure nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/api-server
sudo ln -sf /etc/nginx/sites-available/api-server /etc/nginx/sites-enabled/api-server
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Your site is then live at the server's public IP:

```bash
curl http://localhost/health
curl http://localhost/api/items
```

Useful PM2 commands: `pm2 status`, `pm2 logs api-backend`, `pm2 restart api-backend`.

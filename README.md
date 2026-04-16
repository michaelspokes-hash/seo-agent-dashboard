# SEO Agent Dashboard

Your SEO audit, keyword tracking, and WordPress deployment dashboard — powered by Google Search Console.

## Deploy to Render (Free)

1. Push this repo to GitHub (new repo: `seo-agent-dashboard`)
2. Go to [render.com](https://render.com) → **New** → **Static Site**
3. Connect your GitHub repo
4. Settings will auto-fill from `render.yaml`:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `./dist`
5. Click **Create Static Site**

Your dashboard will be live at `https://seo-agent-dashboard.onrender.com` (or similar).

## Connecting to Your Backend

The dashboard is pre-configured to connect to your backend at:
```
https://seo-agent-backend-1.onrender.com
```

If your backend URL changes, update the `API_BASE` variable in `src/App.jsx`.

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

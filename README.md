# 🎉 Josh's 21st — RSVP Site

A birthday RSVP landing page with a video invite, guest counter, and SQLite backend.

---

## Project Structure

```
josh-21st/
├── frontend/
│   ├── index.html      ← Main page
│   ├── style.css       ← Styles
│   └── app.js          ← Form logic + confetti
└── backend/
    ├── server.js       ← Express + SQLite API
    └── package.json
```

---

## 1. Add Your Video

Drop your invitation video into the `frontend/` folder and name it **`invite.mp4`**.

- Supported formats: `.mp4`, `.webm`
- Recommended: compress to under 50MB for fast loading
- Optional: add a `poster.jpg` (thumbnail shown before play)

---

## 2. Run the Backend Locally

```bash
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:3000`

### API Endpoints

| Method | Path     | Description              |
|--------|----------|--------------------------|
| POST   | /rsvp    | Submit an RSVP           |
| GET    | /rsvps   | View all RSVPs + summary |

To view all RSVPs locally:
```
http://localhost:3000/rsvps
```

---

## 3. Deploy the Backend → Railway (free)

1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **New Project → Deploy from GitHub repo**
3. Select your repo, set the **Root Directory** to `backend`
4. Railway auto-detects Node.js and runs `npm start`
5. Copy your Railway URL (e.g. `https://josh-21st-backend.up.railway.app`)
6. Open `frontend/app.js` and update line 3:

```js
const API_URL = 'https://your-railway-url.up.railway.app/rsvp';
```

---

## 4. Deploy the Frontend → GitHub Pages

```bash
# In the project root
git init
git add .
git commit -m "Josh's 21st RSVP site"
git remote add origin https://github.com/YOUR_USERNAME/josh-21st.git
git push -u origin main
```

Then in GitHub:
1. Go to your repo → **Settings → Pages**
2. Set Source to **Deploy from branch: main**
3. Set folder to **`/frontend`**
4. Your site will be live at: `https://YOUR_USERNAME.github.io/josh-21st`

---

## 5. View Your RSVPs

Once live, hit your Railway URL:
```
https://your-railway-url.up.railway.app/rsvps
```

Returns JSON like:
```json
{
  "summary": { "total_rsvps": 12, "total_guests": 27 },
  "rsvps": [ ... ]
}
```

---

## Optional: Protect the /rsvps endpoint

In `backend/server.js`, uncomment these lines to require a secret key:

```js
if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) 
  return res.status(401).json({ error: 'Unauthorised' });
```

Then set `ADMIN_KEY=your-secret` in Railway's environment variables.

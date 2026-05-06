# ⚡ TASKFORGE — Tactical Project Operations

A high-velocity, full-stack project & task management app.  
**Black background · Acid yellow (#CCFF00) accents · Bebas Neue typography · Space Mono labels · Grid texture**

![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)

---

## ✨ Features

- **Projects** — create workspaces, invite members, manage independently
- **Kanban board** — per-project drag-and-drop (Todo / In Progress / Done)
- **Overdue detection** — red border pulse on past-due tasks
- **Dashboard** — my tasks, status distribution, project count
- **Role-based access** — Admin (first user) vs Member
- **JWT auth** — secure, 7-day tokens
- **Tactical dark UI** — grid texture, acid yellow, Bebas Neue headers
- **Fully responsive**

---

## 🗂️ Structure

```
taskforge/
├── backend/
│   ├── controllers/  authController, projectController, taskController
│   ├── middleware/   auth.js (JWT + admin guard)
│   ├── models/       User, Project, Task
│   ├── routes/       auth, projects, tasks, users
│   ├── seed.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── kanban/  TaskCard, KanbanColumn, TaskModal
        │   └── layout/  AppLayout (top nav)
        ├── context/  AuthContext
        ├── pages/    Login, Register, Dashboard, Projects, ProjectDetail
        └── utils/    api.js, helpers.js
```

---

## 🚀 Quick Start

```bash
# 1. Install
cd backend && npm install
cd ../frontend && npm install

# 2. Configure
cp backend/.env.example backend/.env
# Edit MONGO_URI and JWT_SECRET

# 3. Seed demo data
cd backend && npm run seed

# 4. Run
cd backend && npm run dev    # :5000
cd frontend && npm run dev   # :5173
```

**Demo logins:**
```
admin@taskforge.com / Admin@12345   (Admin)
demo@taskforge.com  / Demo@12345    (Member)
```

---

## 🚂 Railway Deployment

### 1. MongoDB Atlas
- Create free cluster → Database Access → add user → Network Access → `0.0.0.0/0`
- Copy connection string

### 2. Backend on Railway
- New Project → Deploy from GitHub → root: `backend/`
- Env vars:
  ```
  PORT=5000
  MONGO_URI=<atlas_uri>
  JWT_SECRET=<long_random_string>
  CLIENT_URL=<frontend_url>
  NODE_ENV=production
  ```

### 3. Frontend on Railway
- New Project → root: `frontend/`
- Env vars: `VITE_API_URL=https://your-backend.up.railway.app/api`
- Build: `npm run build`
- Start: `npx serve dist -l $PORT`

### 4. Update CORS
Back in backend → set `CLIENT_URL` to frontend URL → Redeploy.

---

## 📡 API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register (first = admin) |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/projects` | ✓ | My projects |
| POST | `/api/projects` | ✓ | Create project |
| GET | `/api/projects/stats` | ✓ | Dashboard stats |
| GET | `/api/projects/:id` | ✓ | Project + tasks |
| DELETE | `/api/projects/:id` | Owner/Admin | Delete project |
| GET | `/api/tasks` | ✓ | Tasks (filtered) |
| POST | `/api/tasks` | ✓ | Create task |
| PUT | `/api/tasks/:id` | ✓ | Update/move task |
| DELETE | `/api/tasks/:id` | ✓ | Delete task |

---

## 🔒 Security
- bcrypt (cost 12) password hashing
- JWT verified on every protected route
- Role checks server-side only
- CORS locked to `CLIENT_URL`

## 📄 License
MIT

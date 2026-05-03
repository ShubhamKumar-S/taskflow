# TaskFlow — Project & Task Management System

A full-stack project management tool built for teams that need 
structure without complexity. TaskFlow lets admins create projects, 
assign work, and track progress — while members stay focused on 
what's assigned to them.

Built as part of a full-stack development assignment, this project 
covers everything from JWT auth and role-based access to a 
PostgreSQL-backed REST API with a responsive React frontend.

---

## 🌐 Live Demo

| | URL |
|--|--|
| **App** | https://accurate-achievement-prod.railway.app |
| **API** | https://taskflow-production-fc23.up.railway.app |

> Try it instantly — no signup needed. Use the demo accounts below.

### Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@example.com | password123 | Full control |
| Member | member@example.com | password123 | View + update assigned tasks |

---

## What I Built

This isn't a todo app with a fancy name. TaskFlow handles real 
team workflows:

- An **Admin** creates a project, adds teammates, and breaks work 
  into tasks with priorities, due dates, and assignees
- A **Member** logs in and sees only what's relevant to them — 
  their assigned tasks, their projects, their deadlines
- The **Dashboard** gives a live overview: how many tasks are done, 
  what's overdue, what's in progress
- Everything is protected — wrong role trying to delete a task? 
  The API rejects it, not just the UI

---

## Features

**Authentication**
- Secure signup and login with JWT tokens
- Passwords hashed with bcrypt
- Auto logout on token expiry

**Projects**
- Create projects with name and description
- Add or remove team members
- Assign roles per project (Admin / Member)

**Tasks**
- Create tasks with title, description, priority (High/Medium/Low)
- Set due date AND due time
- Assign to any project member
- Track status: Todo → In Progress → Done
- Overdue detection based on due datetime

**Dashboard**
- Total projects, tasks by status, overdue count
- Live stats update as data changes

**Other**
- My Tasks page — all tasks assigned to you across projects
- Team page — see everyone on your team and their roles
- Global search — filter projects and tasks instantly
- Light / Dark mode toggle (preference saved locally)
- Kanban board view per project

---

## Tech Stack

**Backend**
- Node.js + Express.js — REST API
- Sequelize ORM — database modeling and migrations
- PostgreSQL (production) / SQLite (local dev)
- JWT — stateless authentication
- bcrypt — password hashing
- express-validator — input validation

**Frontend**
- React 18 + Vite
- React Router v6 — client-side routing
- Axios — API calls with interceptors
- Context API — global auth state
- CSS Variables — theming system with dark mode

**Deployment**
- Railway — backend + frontend + PostgreSQL all hosted separately
- GitHub — version control and CI/CD trigger

---

## Local Setup

### Requirements
- Node.js v18 or higher
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ShubhamKumar-S/taskflow.git
cd taskflow

# 2. Install dependencies for both backend and frontend
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Seed the database with demo data
npm run seed

# 5. Start both servers
npm run dev
```

Open in browser:
- Frontend → http://localhost:5173
- Backend API → http://localhost:5001

Login with `admin@example.com` / `password123` to explore 
all features.

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, returns JWT |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | All projects for current user |
| POST | /api/projects | Create new project |
| GET | /api/projects/:id | Project detail + members + tasks |
| PUT | /api/projects/:id | Update project (admin only) |
| DELETE | /api/projects/:id | Delete project (admin only) |
| POST | /api/projects/:id/members | Add member (admin only) |
| DELETE | /api/projects/:id/members/:uid | Remove member (admin only) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects/:id/tasks | List tasks in project |
| POST | /api/projects/:id/tasks | Create task (admin only) |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task (admin only) |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Stats for current user |
| GET | /api/health | Health check |

All protected routes require `Authorization: Bearer <token>` header.

---

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create / delete project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Create / delete tasks | ✅ | ❌ |
| Assign tasks to members | ✅ | ❌ |
| Update status of own tasks | ✅ | ✅ |
| View projects and tasks | ✅ | ✅ |

Role is enforced at the API level — not just hidden in the UI.
A member hitting an admin-only endpoint gets a 403 regardless 
of what the frontend shows.

---

## Project Structure
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── middleware/    # Auth, role checks, validation
│   │   ├── models/        # User, Project, Task, ProjectMember
│   │   ├── routes/        # auth, projects, tasks, dashboard
│   │   ├── seed.js        # Demo data seeder
│   │   └── server.js      # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar, TaskCard, MemberList...
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Login, Dashboard, Projects, Team...
│   │   ├── utils/         # Axios instance
│   │   └── App.jsx
│   └── package.json
│
└── README.md
---

## Environment Variables

**Backend `.env`**
PORT=5001
JWT_SECRET=your_secret_here
DATABASE_URL=             # PostgreSQL URL (Railway sets this)
FRONTEND_URL=             # Your frontend domain for CORS
NODE_ENV=development

**Frontend `.env`**
VITE_API_URL=http://localhost:5001

---

Built by Shubham Kumar
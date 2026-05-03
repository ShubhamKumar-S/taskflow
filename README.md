# TaskFlow — Project & Task Management System

A full-stack web application for managing projects and tasks 
with role-based access control.

## 🌐 Live Demo
- **App**: [Frontend URL here]
- **API**: [Backend URL here]

## 🔑 Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Member | member@example.com | password123 |

## ✨ Features
- JWT Authentication (Login/Register)
- Role-Based Access Control (Admin/Member)
- Project creation and team management
- Task management with Kanban board
- Due date and time tracking
- Overdue task detection
- Dashboard with real-time stats
- My Tasks and Team pages
- Global search
- Light/Dark mode toggle

## 🛠 Tech Stack
**Backend**: Node.js, Express.js, Sequelize ORM, PostgreSQL/SQLite, JWT
**Frontend**: React 18, Vite, Axios, React Router v6

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- npm

### Installation
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install all dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Seed the database
npm run seed

# Start the app
npm run dev
```

### Open in browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Project details |
| POST | /api/projects/:id/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| GET | /api/dashboard | Dashboard stats |

## 🔐 Role Permissions
| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks) |
| View project & tasks | ✅ | ✅ |

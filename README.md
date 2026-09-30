# RHIZAN Hub 🚀

> **Internal Operations & Workspace Platform for [Rhizan Technologies](https://www.rhizantech.com)**  
> *"Everyone knows what they need to do, what they are working on, what is happening with clients/projects, and what the team has accomplished."*

[![Rhizan Technologies](https://img.shields.io/badge/Rhizan-Technologies-0d9488?style=flat-square)](https://www.rhizantech.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-Backend-gray?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-emerald?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

---

## 🏗️ Architecture (Option A: Decoupled)

- **Frontend (`/client`):** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend (`/server`):** Express, TypeScript, MongoDB (Mongoose), JWT Authentication, Bcrypt.
- **Root Runner:** Single `npm run dev` using `concurrently` to boot both services.

---

## 📦 Core Modules Implemented (V1 MVP)

1. **🏠 Dashboard (`/`)**
   - KPI counters: Total Tasks, Due Today, Overdue Tasks, Active Projects, Active Clients, Hours Worked This Week.
   - Active Projects visual progress bars (% complete, task count, deadline).
   - "My Tasks" interactive checklist (assigned directly to current logged-in member).
   - Recent Team Activity Feed (real-time task movements, lead creations, time logs).
   - Team weekly hours overview.

2. **📋 Tasks & Kanban Board (`/tasks`)**
   - 4-column workflow: `TODO` → `IN PROGRESS` → `REVIEW` → `DONE`.
   - Click/move tasks through the pipeline.
   - Priority indicators (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
   - Assignee filter (Filter by **Abdulaziz**, **Nebiyu**, or **Sadam**).
   - "+ New Task" modal.
   - Task details & threaded comment discussion modal.

3. **🚀 Projects (`/projects`)**
   - Project cards with client names, budget, deadline, and member avatars.
   - Aggregated task completion progress.
   - "+ New Project" creation modal.

4. **👥 Team Directory (`/team`)**
   - Dedicated cards for **Abdulaziz** (Development), **Nebiyu** (Business / Client), and **Sadam** (Operations / Product).
   - Shows active projects, assigned tasks count, weekly capacity progress, and contact details.

5. **🤝 Clients & Lead Pipeline CRM (`/clients`)**
   - 5-stage sales pipeline: `LEAD` → `CONTACTED` → `MEETING` → `PROPOSAL` → `ACTIVE CLIENT`.
   - Track contact person, phone, email, service interested (ERP, POS, Web), estimated deal value, and notes.
   - Quick "Advance Stage" progression button.
   - "+ New Lead" modal.

6. **⏱️ Time Tracking (`/time`)**
   - Lightweight ClickUp/Clockify alternative.
   - Quick time entry logger (Project selector, hours, minutes, notes).
   - Today's logged activities breakdown.
   - Team weekly hours summary against 40h target.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or v20+)
- **MongoDB** running locally (`mongodb://localhost:27017/rhizan_hub`) or a MongoDB Atlas URI.

### 2. Configure Environment Variables
- `server/.env` (already created with defaults):
  ```env
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/rhizan_hub
  JWT_SECRET=rhizan_secret_key_change_in_production
  CLIENT_URL=http://localhost:3000
  ```
- `client/.env.local` (already created):
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```

### 3. Seed Initial Rhizan Team & Workspace Data
Populate Abdulaziz, Nebiyu, Sadam, sample projects, tasks, CRM leads, and time logs:
```bash
npm --prefix server run seed
```

### 4. Run Both Client & Server Concurrently
From the root directory:
```bash
npm run dev
```

- **Frontend Web App:** [http://localhost:3001](http://localhost:3001)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Initial Seed Accounts

| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Abdulaziz** | Admin / Development | `abdulaziz@rhizan.com` | `password123` |
| **Nebiyu** | Member / Business & Client | `nebiyu@rhizan.com` | `password123` |
| **Sadam** | Member / Operations & Product | `sadam@rhizan.com` | `password123` |

*(You can also switch profiles instantly using the quick member buttons at the bottom of the sidebar!)*

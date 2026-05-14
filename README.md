# ⚔️ QuestLife — Student RPG Gamification App

A Habitica-style gamification system for students. Complete daily habits, to-dos, and earn rewards!

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and create your hero!

## 🗂️ Project Structure
```
questlife/
├── backend/
│   ├── models/        # User, Habit, Daily, Todo, Reward schemas
│   ├── routes/        # auth.js, tasks.js
│   ├── middleware/    # JWT auth
│   ├── .env           # Environment variables
│   └── server.js      # Express entry point
└── frontend/
    └── src/
        ├── api/       # Axios API calls
        ├── components/ # CharPanel, AddModal, ToastContainer
        ├── context/   # AuthContext
        ├── hooks/     # useToast
        └── pages/     # AuthPage, Dashboard
```

## ⚙️ Environment Variables (backend/.env)
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/questlife
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## 🎮 Features
- ⚡ **Habits** — Click + or − to track good/bad habits
- 📅 **Dailies** — Tasks that reset every day
- ✅ **To-Dos** — One-time tasks with priority and due dates
- 🏪 **Reward Shop** — Spend gold on real-life rewards
- 📊 **Stats & Achievements** — Track your progress
- 👥 **Leaderboard** — Compete with classmates
- 🌟 **Leveling System** — Gain XP, level up, unlock stats
- 🔥 **Streak Tracking** — Daily login streaks

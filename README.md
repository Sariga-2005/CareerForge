# 🚀 CareerForge - AI-Powered Placement Platform

**From Resume to Offer Letter, Autonomously**

CareerForge is an intelligent placement platform that leverages AI to streamline the campus recruitment process. It provides AI-powered resume analysis, adaptive mock interviews, smart job matching, career advising, and real-time analytics.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables Setup](#-environment-variables-setup)
- [Running the Application](#-running-the-application)
- [User Roles & Access](#-user-roles--access)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Team](#-team)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI Resume Analysis** | Semantic analysis for resume scoring, ATS compatibility, and improvement suggestions |
| **Adaptive Mock Interviews** | AI-powered interviews with speech recognition and real-time feedback |
| **Smart Job Matching** | ML-based algorithm matching skills with job requirements |
| **Career Advisor** | AI-driven career path recommendations based on skills and goals |
| **Learning Roadmap** | Personalized skill development roadmaps |
| **Real-time Analytics** | Live dashboards tracking placement readiness |
| **Alumni Network** | Connect with industry professionals for mentorship |
| **Admin Dashboard** | Manage students, jobs, placement reports, and system settings |

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router v6** for routing

### Backend
- **Node.js + Express** (API Gateway - Port 5000)
- **Python + Flask** (AI Microservices - Ports 5001, 5002)
- **MongoDB Atlas** for database
- **JWT** for authentication
- **Socket.IO** for real-time features

### AI/ML
- **Groq** (LLaMA 3.3 70B) for AI-powered features (resume analysis, career advice, interview evaluation)
- **Web Speech API** for real-time speech recognition during interviews
- **PyPDF2** for resume parsing

---

## 📁 Project Structure

```
CareerForge/
├── frontend/                      # React TypeScript app (Port 3000)
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Register, Forgot Password
│   │   │   ├── student/           # Student dashboard, resume, interview, jobs
│   │   │   ├── admin/             # Admin dashboard, analytics, job management
│   │   │   └── alumni/            # Alumni dashboard, referrals, mentorship
│   │   ├── layouts/               # Auth & Dashboard layouts
│   │   ├── store/                 # Redux store & slices
│   │   └── services/              # API & Socket services
│   └── public/
│
├── backend/
│   ├── api-gateway/               # Node.js Express gateway (Port 5000)
│   │   ├── src/
│   │   │   ├── routes/            # API routes
│   │   │   ├── controllers/       # Request handlers
│   │   │   ├── models/            # MongoDB models (User, Interview, Job, Resume)
│   │   │   └── middlewares/       # Auth, rate limiting, error handling
│   │   ├── .env.example           # Environment template
│   │   └── package.json
│   │
│   └── microservices/
│       ├── ai-brain/              # Resume analysis, career advice, job matching (Port 5001)
│       │   ├── routes/            # Flask API routes
│       │   ├── models/            # AI model logic
│       │   ├── .env.example       # Environment template
│       │   └── requirements.txt
│       │
│       └── cognitive-screener/    # Interview evaluation service (Port 5002)
│           ├── routes/            # Flask API routes
│           ├── models/            # Interview evaluation logic
│           ├── .env.example       # Environment template
│           └── requirements.txt
│
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **Python** v3.9 or higher — [Download](https://python.org/)
- **MongoDB Atlas** account (or local MongoDB) — [Sign up](https://www.mongodb.com/atlas)
- **Groq API Key** — [Get one free](https://console.groq.com/)
- **npm** (comes with Node.js)
- **pip** (comes with Python)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Sariga-2005/CareerForge.git
cd CareerForge
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install API Gateway Dependencies

```bash
cd ../backend/api-gateway
npm install
```

### 4. Install Python Microservices Dependencies

```bash
# AI Brain Service
cd ../microservices/ai-brain
pip install -r requirements.txt

# Cognitive Screener Service
cd ../cognitive-screener
pip install -r requirements.txt
```

---

## 🔐 Environment Variables Setup

Each service has its own `.env` file. Copy the `.env.example` template in each service folder and fill in your values.

### API Gateway (`backend/api-gateway/.env`)

```bash
cd backend/api-gateway
cp .env.example .env
```

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/careerforge

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change in production)
JWT_SECRET=your-jwt-secret-key-here

# Redis Configuration (optional — app works without Redis)
REDIS_URL=redis://localhost:6379

# AI Microservices URLs
AI_SERVICE_URL=http://localhost:5001
COGNITIVE_SERVICE_URL=http://localhost:5002
```

### AI Brain Service (`backend/microservices/ai-brain/.env`)

```bash
cd backend/microservices/ai-brain
cp .env.example .env
```

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/careerforge
DATABASE_NAME=careerforge

# Server Configuration
PORT=5001
DEBUG=False

# Groq AI Configuration
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

### Cognitive Screener (`backend/microservices/cognitive-screener/.env`)

```bash
cd backend/microservices/cognitive-screener
cp .env.example .env
```

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/careerforge
DATABASE_NAME=careerforge

# Server Configuration
PORT=5002
DEBUG=False

# Groq AI Configuration
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=1

# Resume Analysis
MAX_RESUME_SIZE_MB=5
```

> **Note:** All three services share the same MongoDB Atlas connection string and Groq API key. You only need one Groq API key for both AI microservices.

---

## ▶️ Running the Application

You need **4 separate terminals** to run all services. Start them in this order:

### Terminal 1 — API Gateway (start first)

```bash
cd backend/api-gateway
npx ts-node src/server.ts
```
✅ Runs on `http://localhost:5000`

### Terminal 2 — AI Brain Service

```bash
cd backend/microservices/ai-brain
python app.py
```
✅ Runs on `http://localhost:5001`

### Terminal 3 — Cognitive Screener Service

```bash
cd backend/microservices/cognitive-screener
python app.py
```
✅ Runs on `http://localhost:5002`

### Terminal 4 — Frontend (start last)

```bash
cd frontend
npm start
```
✅ Runs on `http://localhost:3000`

> **Tip:** Once all 4 services are running, open `http://localhost:3000` in your browser (Google Chrome recommended for speech recognition support).

---

## 👤 User Roles & Access

CareerForge supports three user roles. Each role has its own dashboard and features.

| Role | Registration | Dashboard URL | Features |
|------|-------------|---------------|----------|
| **Student** | Register at `/register` | `/student/dashboard` | Resume upload & analysis, mock interviews, job matching, career advisor, learning roadmap |
| **Admin** | Register with role `admin` | `/admin/dashboard` | Student management, job management, batch analytics, placement reports, system settings |
| **Alumni** | Register with role `alumni` | `/alumni/dashboard` | Referral requests, mentorship |

### Accessing the Admin Panel

1. Register a new account at `http://localhost:3000/register`
2. Select the **Admin** role during registration
3. Log in with the admin credentials
4. You will be redirected to `/admin/dashboard`

### Admin Dashboard Features

- **Dashboard** — Overview of platform statistics
- **Batch Analytics** — Track batch-wise placement data
- **Student Management** — View and manage student accounts
- **Job Management** — Create, edit, and publish job postings
- **Alumni Engagement** — Manage alumni connections
- **Placement Reports** — Generate and view placement reports
- **System Settings** — Configure platform settings

---

## 📚 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new user (student/admin/alumni) |
| `/api/v1/auth/login` | POST | Login user |
| `/api/v1/auth/me` | GET | Get current user profile |
| `/api/v1/auth/profile` | PUT | Update user profile |

### Resume
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/resume/upload` | POST | Upload resume (PDF) |
| `/api/v1/resume` | GET | Get user's resumes |
| `/api/v1/resume/:id/reanalyze` | POST | Re-analyze a resume with AI |

### Interview
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/interview` | POST | Create interview session |
| `/api/v1/interview/:id/start` | POST | Start an interview |
| `/api/v1/interview/:id/answer` | POST | Submit answer (with audio) |
| `/api/v1/interview/:id/complete` | POST | Complete interview |
| `/api/v1/interview` | GET | Get interview history |
| `/api/v1/interview/:id` | GET | Get interview details |

### Jobs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/jobs` | GET | Get all job listings |
| `/api/v1/jobs/:id` | GET | Get job details |
| `/api/v1/jobs/saved` | GET | Get saved jobs |
| `/api/v1/jobs/save` | POST | Save a job |
| `/api/v1/jobs/unsave/:jobId` | DELETE | Unsave a job |

### AI Services (via API Gateway)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/career/advice` | POST | Get AI career path advice |
| `/api/v1/skills/roadmap` | POST | Generate learning roadmap |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Style
- Use ESLint and Prettier for JavaScript/TypeScript
- Follow PEP 8 for Python code
- Write meaningful commit messages

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| Team Member 1 | Full Stack Developer | [@username1](https://github.com/username1) |
| Team Member 2 | Backend Developer | [@username2](https://github.com/username2) |
| Team Member 3 | Frontend Developer | [@username3](https://github.com/username3) |
| Team Member 4 | AI/ML Engineer | [@username4](https://github.com/username4) |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for fast AI inference with LLaMA 3.3
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting
- [React](https://react.dev/) for the frontend framework

---

**Made with ❤️ by the CareerForge Team**

# 🚀 CareerForge - AI-Powered Placement Platform

**From Resume to Offer Letter, Autonomously**

CareerForge is an intelligent placement platform that leverages AI to streamline the campus recruitment process. It provides AI-powered resume analysis, adaptive mock interviews, smart job matching, and real-time analytics.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Team](#-team)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI Resume Analysis** | BERT-based semantic analysis for resume scoring and ATS compatibility |
| **Adaptive Mock Interviews** | GPT-4o powered interviews that adapt to candidate responses |
| **Smart Job Matching** | ML-based algorithm matching skills with job requirements |
| **Real-time Analytics** | Live dashboards tracking placement readiness |
| **Alumni Network** | Connect with industry professionals for mentorship |

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling

### Backend
- **Node.js + Express** (API Gateway)
- **Python + Flask** (AI Microservices)
- **MongoDB** for database
- **JWT** for authentication

### AI/ML
- **OpenAI GPT-4o** for interviews
- **BERT** for semantic matching
- **PyPDF2** for resume parsing

---

## 📁 Project Structure

```
CareerForge/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── store/            # Redux store & slices
│   │   ├── services/         # API services
│   │   └── hooks/            # Custom React hooks
│   └── public/               # Static assets
│
├── backend/
│   ├── api-gateway/          # Node.js Express gateway
│   │   ├── src/
│   │   │   ├── routes/       # API routes
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── models/       # MongoDB models
│   │   │   └── middleware/   # Auth, validation, etc.
│   │   └── package.json
│   │
│   └── microservices/        # Python Flask services
│       ├── ai-brain/         # Resume analysis & job matching
│       └── cognitive-screener/  # Mock interview service
│
├── docker-compose.yml        # Docker orchestration
├── .env.example              # Environment template
└── README.md                 # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**
- **pip** (Python package manager)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Sariga-2005/CareerForge.git
cd CareerForge
```

### 2. Setup Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your credentials
# See Environment Variables section below
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Install Backend (API Gateway) Dependencies

```bash
cd ../backend/api-gateway
npm install
```

### 5. Install Python Microservices Dependencies

```bash
# AI Brain Service
cd ../microservices/ai-brain
pip install -r requirements.txt

# Cognitive Screener Service
cd ../cognitive-screener
pip install -r requirements.txt
```

---

## ▶️ Running the Application

### Option 1: Run Services Individually

**Terminal 1 - Frontend:**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

**Terminal 2 - API Gateway:**
```bash
cd backend/api-gateway
npx ts-node src/server.ts
# Runs on http://localhost:5000
```

**Terminal 3 - AI Brain Service:**
```bash
cd backend/microservices/ai-brain
python app.py
# Runs on http://localhost:5001
```

**Terminal 4 - Cognitive Screener:**
```bash
cd backend/microservices/cognitive-screener
python app.py
# Runs on http://localhost:5002
```

### Option 2: Use Docker Compose

```bash
docker-compose up --build
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/careerforge

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Server Ports
API_GATEWAY_PORT=5000
AI_BRAIN_PORT=5001
COGNITIVE_SCREENER_PORT=5002

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📚 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |

### Resume
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resume/upload` | POST | Upload resume |
| `/api/resume` | GET | Get user resumes |
| `/api/resume/:id/reanalyze` | POST | Re-analyze resume |

### Interview
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/interview/start` | POST | Start mock interview |
| `/api/interview/:id/respond` | POST | Submit response |
| `/api/interview/history` | GET | Get interview history |

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

- OpenAI for GPT-4o API
- MongoDB Atlas for database hosting
- Vercel/Netlify for frontend hosting

---

**Made with ❤️ by the CareerForge Team**

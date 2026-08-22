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
| **Smart Job Matching** | RAG-powered semantic matching using Sentence Transformers and Qdrant Vector DB |
| **Placement Applications** | End-to-end workflow for students to apply and admins to manage/export applications |
| **Career Advisor** | AI-driven career path recommendations based on skills and goals |
| **Learning Roadmap** | Personalized skill development roadmaps |
| **User Feedback System** | Dedicated portal for ratings and suggestions to improve platform quality |
| **Real-time Analytics** | Live dashboards tracking placement readiness |
| **Alumni Network** | Connect with industry professionals for mentorship |
| **Admin Command Center** | Manage students, jobs, placement reports, and system settings |

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **MUI X-Data-Grid** for advanced administrative tables
- **React Router v6** for routing

### Backend
- **Node.js + Express** (API Gateway - Port 5000)
- **Python + FastAPI** (AI Microservices - Ports 5001, 5002)
- **Qdrant Vector DB** for semantic search and RAG pipelines
- **Sentence Transformers** for local text embeddings
- **MongoDB Atlas** for database
- **Socket.IO** for real-time application notifications
- **Express Validator** for robust data validation

---

## 📁 Project Structure

```
CareerForge/
├── frontend/                      # React TypeScript app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/             # Admin portal (Applications, Analytics, Jobs)
│   │   │   ├── student/           # Student portal (Resume, Interviews, Job Matches)
│   │   │   └── FeedbackPage.tsx   # Public feedback portal
```

---

## 👤 User Roles & Access

| Role | Registration | Dashboard URL | Features |
|------|-------------|---------------|----------|
| **Student** | Register at `/register` | `/student/dashboard` | Resume upload, Mock interviews, Job matches (Apply), Career advisor |
| **Admin** | Register with role `admin` | `/admin/dashboard` | Student/Job management, Application portal, Export CSV, Reports |
| **Alumni** | Register with role `alumni` | `/alumni/dashboard` | Referral requests, Mentorship engagement |

---

## 📚 API Documentation

### Placement & Applications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/jobs/applications/me` | GET | Get user's applied job list |
| `/api/v1/jobs/:id/apply` | POST | Submit a job application |
| `/api/v1/jobs/applications` | GET | (Admin) Get all applications across drives |
| `/api/v1/jobs/applications/export` | POST | (Admin) Export selected apps to CSV |

### Feedback
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/feedback` | POST | Submit anonymous or authenticated feedback |
| `/api/v1/feedback` | GET | (Admin) View all system feedback |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| **Naren M** | Lead Developer | [@Sariga-2005](https://github.com/Sariga-2005) |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** for high-speed LLaMA 3.3 inferencing
- **Amrita Vishwa Vidyapeetham** for the project framework
- **MongoDB Atlas** for cloud database infrastructure

---

**Made with ❤️ by Naren M**

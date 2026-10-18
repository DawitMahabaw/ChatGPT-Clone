# AI-Powered ChatGPT Clone

A full-stack conversational AI application built with **React**, **Node.js/Express**, **MySQL**, and the **Google Gemini API**. Developed as a capstone project for the **AI-Powered Fullstack Application Development** program at **Evangadi Networks**.

The application replicates the core experience of ChatGPT, featuring interactive AI conversations with context memory, user authentication, multi-thread session management, and persistent chat history.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Design](#architecture--design)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Directory Structure](#project-directory-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Installation & Local Setup](#installation--local-setup)
- [Deployment](#deployment)
- [Evaluation & Learning Outcomes](#evaluation--learning-outcomes)

---

## Project Overview

This project implements an end-to-end AI chat application following industry-standard **Model-View-Controller (MVC)** architectural patterns. It demonstrates:

1. **AI Integration**: Integrating Google Gemini (`@google/genai`) to generate contextual, multi-turn AI responses.
2. **Session & History Management**: Organizing messages into dedicated chat sessions that users can create, rename, revisit, and delete.
3. **Secure Authentication**: Password encryption via `bcryptjs` and stateless session authorization via `jsonwebtoken` (JWT).
4. **Guest & Authenticated Flows**: Guests can immediately chat with lightweight in-memory context; registered users receive persistent database storage.
5. **Production Database Engineering**: Automated schema synchronization, collation alignment (`utf8mb4_unicode_ci`), and SSL/TLS verification for remote cloud databases (Aiven / Render).

---

## Architecture & Design

The application follows a decoupled client-server architecture with clean separation of concerns:

```
[ User Browser / Client ]
           │
           │  HTTP / JSON (REST)
           ▼
[ React 18 + Vite Frontend ]
    ├── Components (Chat, Sidebar, Auth Modal)
    ├── AuthContext (Global Auth State)
    └── API Client (Axios + JWT Interceptors)
           │
           │  REST Requests with Bearer Token
           ▼
[ Express.js Backend (MVC Architecture) ]
    ├── Routes:       /api/auth & /api/chat
    ├── Middleware:   JWT verification & error handlers
    ├── Controllers:  authController & chatController
    ├── Services:     geminiService (Google Gemini API)
    └── Models:       userModel, sessionModel, conversationModel
           │
           ├──► [ Google Gemini AI API ] (Contextual generation)
           │
           └──► [ MySQL Database (Local / Aiven Cloud) ]
                 ├── users
                 ├── sessions
                 └── conversations
```

---

## Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **HTTP Client:** Axios (configured with automated JWT authorization headers)
- **Styling:** CSS Modules & Vanilla CSS (scoped component styles and responsive layouts)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database Driver:** `mysql2/promise` (connection pooling with verified TLS/SSL support)
- **Authentication:** `jsonwebtoken` (JWT) & `bcryptjs`
- **AI SDK:** `@google/genai` (Google Gemini models)
- **Security & Config:** CORS, `dotenv`, SSL X.509 certificate validation

### Infrastructure & Hosting
- **Backend:** Render (Web Service)
- **Database:** Aiven for MySQL (Cloud-managed database with TLS/SSL encryption)
- **Frontend:** Vercel

---

## Key Features

### 1. Conversational AI with Context Memory
- Real-time responses generated via the Google Gemini API.
- Multi-turn conversation awareness: previous context is supplied to the AI model so responses remain coherent across follow-up questions.
- Formatted markdown and clean code block rendering.

### 2. User Authentication & Authorization
- Secure user signup and login with email and password.
- Password hashing using `bcryptjs` with salt rounds.
- JWT-based authorization protecting private sessions and message history.

### 3. Session & Chat History Management
- **Multi-session Sidebar:** Users can manage multiple conversation threads.
- **Auto-titling:** New chats are automatically named based on the first prompt.
- **Rename & Delete:** Users can rename chat titles or delete entire session threads with transactional cascade deletion.
- **Conversation Search:** Quick filtering of saved chats directly from the sidebar.

### 4. Dual User Experience (Guest vs. Authenticated)
- **Guest Mode:** First-time visitors can chat immediately without signing up. Context is temporarily stored in-memory during the session.
- **Authenticated Mode:** Signing in automatically creates persistent sessions and associates history with the user's account.

### 5. Resilient Database Initialization
- Backend automatically checks and initializes `users`, `sessions`, and `conversations` tables on startup.
- Enforces uniform `utf8mb4_unicode_ci` collations across all tables to avoid cross-table comparison mismatches.
- Strict SSL certificate verification support for remote cloud databases.

---

## Project Directory Structure

```
ChatGPT-Clone/
├── backend/
│   ├── certs/
│   │   └── ca.pem                  # Aiven / Remote MySQL SSL CA certificate
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MySQL connection pool & SSL configuration
│   │   │   └── initializeDatabase.js# Auto-table creation & collation synchronization
│   │   ├── controllers/
│   │   │   ├── authController.js    # Registration, login, and user verification
│   │   │   └── chatController.js    # Chat session & message orchestration
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT token extraction & verification guard
│   │   ├── models/
│   │   │   ├── userModel.js         # User database queries
│   │   │   ├── sessionModel.js      # Chat session queries & transactions
│   │   │   └── conversationModel.js # Message history queries
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth routes
│   │   │   └── chatRoutes.js        # /api/chat routes
│   │   └── services/
│   │       └── geminiService.js     # Google Gemini API integration
│   ├── index.js                     # Express server entry point
│   ├── package.json                 # Backend dependencies & scripts
│   └── .env.example                 # Environment template
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── apiClient.js         # Axios instance with interceptors
    │   │   ├── authApi.js           # Auth endpoint requests
    │   │   └── chatApi.js           # Chat endpoint requests
    │   ├── components/
    │   │   ├── AuthModal/           # Login & Registration modal
    │   │   ├── ChatHeader/          # Header with user controls & model status
    │   │   ├── ChatInput/           # Prompt textarea and send action
    │   │   ├── ChatMessage/         # Individual message bubble component
    │   │   ├── MessageList/         # Scrollable message stream container
    │   │   └── Sidebar/             # Chat session history & search
    │   ├── context/
    │   │   └── AuthContext.jsx      # Global authentication provider
    │   ├── App.jsx                  # Main application container
    │   ├── main.jsx                 # React root mount
    │   └── index.css                # Global design system & theme variables
    ├── index.html                   # HTML template
    ├── package.json                 # Frontend dependencies & scripts
    └── vite.config.js               # Vite build configuration
```

---

## Database Schema

The database uses three relational tables configured with `InnoDB` and `utf8mb4_unicode_ci`:

```sql
-- 1. Users Table
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Sessions Table (Chat Threads)
CREATE TABLE sessions (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'New chat',
  model VARCHAR(64) NOT NULL DEFAULT 'gemini-3.5-flash-lite',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Conversations Table (Messages)
CREATE TABLE conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  token_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  CONSTRAINT fk_conversations_session FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register a new user (`username`, `email`, `password`) and receive JWT |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return a signed JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user profile data |

### Chat & Sessions (`/api/chat`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/conversations` | Public / Protected | Send a prompt to Gemini; persists to database if authenticated |
| `GET` | `/api/chat/sessions` | Protected | Fetch all saved chat sessions for the authenticated user |
| `GET` | `/api/chat/sessions/:id` | Protected | Retrieve message history for a specific chat session |
| `POST` | `/api/chat/sessions` | Protected | Manually create a new conversation session |
| `PUT` | `/api/chat/sessions/:id` | Protected | Rename a chat session title |
| `DELETE` | `/api/chat/sessions/:id` | Protected | Delete a session and all its associated messages |

---

## Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | No | Port on which Express runs (defaults to 5000 or Render port) | `5000` |
| `NODE_ENV` | No | Runtime environment (`development` or `production`) | `production` |
| `DB_HOST` | Yes | MySQL database hostname | `localhost` or Aiven host |
| `DB_PORT` | Yes | MySQL database port | `3306` |
| `DB_USER` | Yes | MySQL user | `root` or `avnadmin` |
| `DB_PASSWORD` | Yes | MySQL password | `your_secure_password` |
| `DB_NAME` | Yes | Database name | `chatgpt_clone` |
| `DB_SSL` | No | Enable SSL for remote MySQL connections | `true` |
| `DB_SSL_CA` | No | Raw PEM CA certificate string (recommended for Render) | `-----BEGIN CERTIFICATE-----...` |
| `DB_SSL_CA_PATH` | No | Path to CA PEM file | `certs/ca.pem` |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWT tokens | `64-character hex string` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key from Google AI Studio | `AIzaSy...` |

### Frontend Configuration (`frontend/.env`)

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | URL pointing to the running backend API | `http://localhost:5000/api` |

---

## Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MySQL](https://www.mysql.com/) server (running locally or via Docker/cloud)
- Google Gemini API Key ([Get one from Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/DawitMahabaw/ChatGPT-Clone.git
cd ChatGPT-Clone
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your MySQL credentials, GEMINI_API_KEY, and JWT_SECRET

# Start development server
npm run dev
```
The backend will run on `http://localhost:5000` and automatically create/synchronize database tables.

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create frontend environment configuration
cp .env.example .env
# Ensure VITE_API_URL=http://localhost:5000/api

# Start Vite dev server
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

---

## Deployment

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com) and link your GitHub repository.
2. Configure settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add Environment Variables in the Render dashboard:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `DB_SSL=true`
   - `DB_SSL_CA` *(Paste the full CA certificate PEM string from your database provider, e.g., Aiven)*
   - `JWT_SECRET` *(Generated random 64-byte hex string)*
   - `GEMINI_API_KEY` *(Google Gemini key)*
4. Deploy the service.

### Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Configure settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: Your live Render backend URL ending in `/api` (e.g. `https://chatgpt-clone-71v0.onrender.com/api`).
4. Deploy.

---

## Evaluation & Learning Outcomes

This project demonstrates core competencies taught in the **Evangadi AI-Powered Fullstack Development** curriculum:

- **Full-Stack Integration:** Seamless communication between a React Single Page Application (SPA) and an Express REST API.
- **AI Agent & LLM Orchestration:** Implementing Gemini model calls, history extraction, and context window formatting.
- **Relational Data Modeling:** Designing clean schema relationships across users, chat threads, and individual messages.
- **Authentication & Security:** Managing JWT lifecycles, hashing credentials with salt rounds, guarding protected endpoints, and enforcing strict SSL database encryption.
- **Error Handling & Resilience:** Robust exception handling, user-friendly frontend alerts, and automated database collation synchronization.

---

## Author & Acknowledgments

- **Developer:** Dawit Mahabaw
- **Program:** AI-Powered Fullstack Application Development — Evangadi Networks
- **Instructional Team:** Evangadi Faculty & Mentors

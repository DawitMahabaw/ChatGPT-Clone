# AI-Powered ChatGPT Clone

A full-stack conversational AI web application built with **React**, **Node.js**, **Express**, **MySQL**, and the **Google Gemini API**. Developed as a capstone project for the **AI-Powered Full-Stack Application Development** program at **Evangadi Networks**.

The application provides an interactive ChatGPT-style conversational assistant featuring multi-turn context memory, secure JWT authentication, multi-thread session management, and persistent database storage.

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
- [Author & Acknowledgments](#author--acknowledgments)

---

## Project Overview

This application demonstrates modern full-stack development and AI integration following industry-standard **Model-View-Controller (MVC)** architectural patterns:

1. **AI Integration**: Connects to Google Gemini (`@google/genai`) to deliver contextual, streaming-ready conversational AI responses.
2. **Session & History Management**: Organizes chats into dedicated conversation threads that users can create, rename, search, and delete.
3. **Secure Authentication**: Implements user registration and login with salt-hashed passwords via `bcryptjs` and stateless authorization via JSON Web Tokens (`jsonwebtoken`).
4. **Dual User Flow (Guest vs. Authenticated)**:
   - **Guest Mode**: Visitors can immediately test and chat with temporary, in-memory context.
   - **Authenticated Mode**: Registered users receive persistent database storage across devices and sessions.
5. **Production-Ready Relational Database**: Features connection pooling, automatic schema creation on startup, uniform collation (`utf8mb4_unicode_ci`), and verified TLS/SSL support for cloud-hosted MySQL (Aiven).

---

## Architecture & Design

The application follows a decoupled client-server architecture with clear separation of concerns:

```text
[ Client (Browser) ]
        │
        │  HTTP / REST API (JSON)
        ▼
[ React 18 Frontend (Vite) ]
   ├── Components (ChatArea, Sidebar, Header, AuthModal)
   ├── AuthContext (Global User State & Token Handling)
   └── API Client (Axios with Bearer Token Interceptors)
        │
        │  Protected Requests with Authorization Header
        ▼
[ Express.js Backend (MVC Architecture) ]
   ├── Routes:       /api/auth & /api/chat
   ├── Middleware:   JWT authentication guard & centralized error handler
   ├── Controllers:  authController & chatController
   ├── Services:     geminiService (Google Gemini AI API)
   └── Models:       userModel, sessionModel, conversationModel
        │
        ├──► [ Google Gemini AI API ] (Contextual response generation)
        │
        └──► [ MySQL Database ] (Local / Aiven Cloud)
               ├── users
               ├── sessions
               └── conversations
```

---

## Tech Stack

### Frontend (Client)
- **Framework:** React 18
- **Build Tool:** Vite
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)
- **HTTP Client:** Axios (configured with automated JWT interceptors)
- **Styling:** CSS Modules & Vanilla CSS (scoped styles, responsive layout, dark theme)
- **Icons:** Lucide React

### Backend (Server)
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database Driver:** `mysql2/promise` (connection pooling with verified TLS/SSL support)
- **Authentication:** `jsonwebtoken` (JWT) & `bcryptjs` (salt-hashed passwords)
- **AI SDK:** `@google/genai` (Google Gemini models)
- **Security:** CORS, `dotenv`, and SSL/TLS certificate validation

### Infrastructure & Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Cloud Database:** Aiven for MySQL (cloud-managed relational database with SSL encryption)

---

## Key Features

### 1. Conversational AI with Context Memory
- Generates intelligent, real-time responses using Google Gemini models.
- Maintains multi-turn conversation context so the model understands follow-up questions within the active session.
- Automatically handles formatted responses, markdown, and code blocks.

### 2. User Authentication & Authorization
- User registration and login validation.
- Secure password hashing using `bcryptjs`.
- Stateless authorization using JSON Web Tokens (JWT) protecting user chat sessions.

### 3. Session & Chat History Management
- **Multi-Session Sidebar**: Create multiple distinct chat sessions.
- **Automatic Titling**: Automatically generates conversation titles based on the user's initial prompt.
- **Rename & Delete**: Users can rename sessions or delete threads with cascading relational cleanup.
- **Conversation Search**: Filter past conversation titles in real time.

### 4. Dual User Experience (Guest & Authenticated)
- **Guest Access**: Immediate, zero-friction AI interaction without registration.
- **Authenticated Access**: Full history persistence, session synchronization, and account management.

### 5. Automated Database Initialization
- Automatically verifies and initializes `users`, `sessions`, and `conversations` tables at server startup.
- Enforces strict foreign key constraints (`ON DELETE CASCADE`) to maintain relational integrity.
- Standardizes `utf8mb4_unicode_ci` collation to ensure consistent multi-lingual character handling.

---

## Project Directory Structure

```text
ChatGPT-Clone/
├── backend/
│   ├── certs/
│   │   └── ca.pem                    # Cloud MySQL SSL CA certificate
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js            # MySQL connection pool & SSL config
│   │   │   └── initializeDatabase.js  # Schema auto-creation & collation sync
│   │   ├── controllers/
│   │   │   ├── authController.js      # User registration, login & profile
│   │   │   └── chatController.js      # Chat session & message handling
│   │   ├── middleware/
│   │   │   └── authMiddleware.js      # JWT extraction & route protection
│   │   ├── models/
│   │   │   ├── userModel.js           # User table queries
│   │   │   ├── sessionModel.js        # Chat session queries
│   │   │   └── conversationModel.js   # Message history queries
│   │   ├── routes/
│   │   │   ├── authRoutes.js          # /api/auth endpoints
│   │   │   └── chatRoutes.js          # /api/chat endpoints
│   │   └── services/
│   │       └── geminiService.js       # Google Gemini API integration
│   ├── index.js                       # Express application entry point
│   ├── package.json                   # Backend dependencies and scripts
│   └── .env.example                   # Backend environment template
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js           # Axios instance with auth interceptors
│   │   │   ├── authApi.js             # Authentication request handlers
│   │   │   └── chatApi.js             # Chat and session request handlers
│   │   ├── components/
│   │   │   ├── AuthModal/             # Login & registration modal dialog
│   │   │   ├── ChatHeader/            # Top bar with controls & user info
│   │   │   ├── ChatInput/             # Dynamic prompt input & submit controls
│   │   │   ├── ChatMessage/           # Individual user & AI message bubbles
│   │   │   ├── MessageList/           # Scrollable conversation message list
│   │   │   └── Sidebar/               # Session history drawer & search
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global authentication state provider
│   │   ├── App.jsx                    # Root view and state coordination
│   │   ├── main.jsx                   # React DOM mount point
│   │   └── index.css                  # Global styles and CSS variables
│   ├── index.html                     # HTML5 entry page
│   ├── package.json                   # Frontend dependencies and scripts
│   └── vite.config.js                 # Vite build configuration
│
├── .gitignore
└── README.md
```

---

## Database Schema

The database uses three relational tables configured with `InnoDB` and `utf8mb4_unicode_ci`:

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Sessions Table (Conversation Threads)
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'New chat',
  model VARCHAR(64) NOT NULL DEFAULT 'gemini-2.5-flash',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Conversations Table (Message Records)
CREATE TABLE IF NOT EXISTS conversations (
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
| `POST` | `/api/auth/signup` | Public | Registers a new user account and returns a signed JWT |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns user data with a signed JWT |
| `GET` | `/api/auth/me` | Protected | Returns profile data for the authenticated token holder |

### Chat & Sessions (`/api/chat`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/conversations` | Public / Protected | Submits a prompt to Gemini; persists to database if authenticated |
| `GET` | `/api/chat/sessions` | Protected | Fetches all chat sessions belonging to the authenticated user |
| `GET` | `/api/chat/sessions/:id` | Protected | Retrieves full message history for a specific session |
| `POST` | `/api/chat/sessions` | Protected | Creates a new chat session thread |
| `PUT` | `/api/chat/sessions/:id` | Protected | Renames an existing chat session title |
| `DELETE` | `/api/chat/sessions/:id` | Protected | Deletes a chat session and all associated messages via cascade |

---

## Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | No | Port on which Express server listens | `5000` |
| `NODE_ENV` | No | Environment mode (`development` / `production`) | `production` |
| `DB_HOST` | Yes | MySQL server hostname | `localhost` or cloud host |
| `DB_PORT` | Yes | MySQL server port | `3306` |
| `DB_USER` | Yes | MySQL database username | `root` or `avnadmin` |
| `DB_PASSWORD` | Yes | MySQL database password | `your_password` |
| `DB_NAME` | Yes | Database schema name | `chatgpt_clone` |
| `DB_SSL` | No | Enable SSL for remote MySQL connections | `true` |
| `DB_SSL_CA` | No | Raw CA certificate PEM string (recommended for Render) | `-----BEGIN CERTIFICATE-----...` |
| `DB_SSL_CA_PATH` | No | Local filesystem path to CA certificate | `certs/ca.pem` |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWT tokens | `64-character-hex-string` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key from Google AI Studio | `AIzaSy...` |

### Frontend Configuration (`frontend/.env`)

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | Full URL pointing to the backend API base path | `http://localhost:5000/api` |

---

## Installation & Local Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MySQL** (v8.0 or compatible cloud database)
- **Google Gemini API Key** (available from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/DawitMahabaw/ChatGPT-Clone.git
cd ChatGPT-Clone
```

### 2. Backend Setup
```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create your environment configuration file
cp .env.example .env
# Open .env and fill in your DB credentials, JWT_SECRET, and GEMINI_API_KEY

# 4. Start the backend development server
npm run dev
```
*The server will start on `http://localhost:5000` and automatically verify/initialize required database tables.*

### 3. Frontend Setup
```bash
# 1. Open a new terminal and navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create your environment configuration file
cp .env.example .env
# Verify VITE_API_URL is set to http://localhost:5000/api

# 4. Start the frontend development server
npm run dev
```
*The application will be accessible at `http://localhost:5173`.*

---

## Deployment Guide

### Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com) and connect the GitHub repository.
2. Set configuration:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add Environment Variables in the Render dashboard:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `DB_SSL=true`
   - `DB_SSL_CA` (paste the full CA certificate string from your database provider)
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
4. Deploy the service.

### Frontend Deployment (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set configuration:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: Your deployed Render backend URL ending in `/api` (e.g. `https://your-service.onrender.com/api`)
4. Deploy.

---

## Evaluation & Learning Outcomes

This capstone project demonstrates key competencies in the **Evangadi AI-Powered Full-Stack Application Development** curriculum:

- **End-to-End Full-Stack Architecture**: Designing and coordinating a decoupled React SPA frontend and an Express REST API backend.
- **AI Model Integration**: Implementing Google Gemini API communication, context array formatting, and response handling.
- **Relational Data Modeling & Security**: Creating normalized MySQL schemas with foreign key cascades, password hashing with salt rounds, and token-based route guards.
- **Production Resilience**: Managing cloud database SSL certificates, handling database collation alignment, and graceful UI error states.
- **Clean Code & Organization**: Strict adherence to the MVC pattern, modular CSS, and structured Git workflows.

---

## Author & Acknowledgments

- **Developer:** Dawit Mahabaw
- **Program:** AI-Powered Full-Stack Application Development — Evangadi Networks
- **Instructional Team:** Evangadi Faculty, Mentors, and Peer Community
# AI-Powered ChatGPT Clone

A full-stack conversational AI web application built with **React**, **Node.js**, **Express**, **MySQL**, and the **Google Gemini API**. Developed as a capstone project for the **AI-Powered Full-Stack Application Development** program at **Evangadi Networks**.

The application provides an interactive ChatGPT-style conversational assistant featuring multi-turn context memory, JWT-based authentication and authorization, multi-thread session management, and persistent database storage.

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
- [Technical Highlights](#technical-highlights)
- [Author & Acknowledgments](#author--acknowledgments)

---

## Project Overview

This application demonstrates full-stack development and AI integration following **Model-View-Controller (MVC)** architectural patterns:

1. **AI Integration**: Connects to Google Gemini (`@google/genai`) to generate contextual conversational AI responses.
2. **Session & History Management**: Organizes chats into dedicated conversation threads that users can create, rename, search, and delete.
3. **JWT-Based Authentication & Authorization**: Implements user registration and login with salt-hashed passwords via `bcryptjs` and stateless authorization via JSON Web Tokens (`jsonwebtoken`).
4. **Dual User Flow (Guest vs. Authenticated)**:
   - **Guest Mode**: Visitors can immediately test and chat with temporary, in-memory context.
   - **Authenticated Mode**: Registered users receive persistent database storage across devices and sessions.
5. **Persistent Relational Database**: Features connection pooling, automatic schema initialization on startup, uniform collation (`utf8mb4_unicode_ci`), and TLS/SSL support for cloud-hosted MySQL (such as Aiven).

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
- **Database Driver:** `mysql2/promise` (connection pooling with TLS/SSL support)
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
- Generates responses using Google Gemini models.
- Maintains multi-turn conversation context so the model understands follow-up questions within the active session.
- Handles formatted responses, markdown, and code blocks.

### 2. User Authentication & Authorization
- User registration and login validation.
- Password hashing using `bcryptjs`.
- Stateless authorization using JSON Web Tokens (JWT) protecting user chat sessions.

### 3. Session & Chat History Management
- **Multi-Session Sidebar**: Create multiple distinct chat sessions.
- **Automatic Titling**: Automatically generates conversation titles based on the user's initial prompt.
- **Rename & Delete**: Users can rename sessions or delete threads with cascading relational cleanup and a ChatGPT-style confirmation modal.
- **Conversation Search**: Filter past conversation titles in real time.

### 4. Dual User Experience (Guest & Authenticated)
- **Guest Access**: Immediate AI interaction without registration.
- **Authenticated Access**: Full history persistence, session synchronization, and account management.

### 5. Automated Database Initialization
- Automatically verifies and initializes `users`, `sessions`, and `conversations` tables at server startup.
- Enforces foreign key constraints (`ON DELETE CASCADE`) to maintain relational integrity.
- Standardizes `utf8mb4_unicode_ci` collation to ensure consistent character handling.

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
│   │   │   └── sessionModel.js        # Chat session queries
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

The database uses three relational tables configured with the `InnoDB` storage engine and `utf8mb4_unicode_ci` character set:

### Overview of Tables

- **`users`** — Stores registered user accounts and authentication data (username, unique email address, hashed password, and account creation timestamp).
- **`sessions`** — Represents individual chat threads belonging to users (unique session ID, reference to the owner in `users`, conversation title, AI model name, and timestamps).
- **`conversations`** — Stores user and assistant messages within each session (message content, role indicator `user` or `assistant`, reference to the parent `sessions` record, token count, and creation timestamp).

### Entity Relationships

```text
[ users ]
   │
   └── (1 : N) ──► [ sessions ]
                      │
                      └── (1 : N) ──► [ conversations ]
```

- **One User to Many Sessions (`1 : N`)**: A registered user can create and maintain multiple independent conversation threads. If a user is deleted, all of their sessions are automatically removed via cascading delete (`ON DELETE CASCADE`).
- **One Session to Many Conversations (`1 : N`)**: Each session contains an ordered sequence of user prompts and AI responses. If a session is deleted, all associated message records in the `conversations` table are automatically cleaned up via foreign key cascade.

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
| `DB_SSL_CA` | No | Raw CA certificate PEM string (for cloud deployments like Render) | `-----BEGIN CERTIFICATE-----...` |
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



## Technical Highlights

This capstone project demonstrates key competencies in the **Evangadi AI-Powered Full-Stack Application Development** curriculum:

- **End-to-End Full-Stack Architecture**: Designing and coordinating a decoupled React SPA frontend and an Express REST API backend.
- **AI Model Integration**: Implementing Google Gemini API communication, context array formatting, and response handling.
- **Relational Data Modeling**: Creating normalized MySQL schemas with foreign key cascades, password hashing with salt rounds, and token-based route guards.
- **Cloud Deployment & Database Configuration**: Managing cloud database SSL certificates, handling database collation alignment, and handling UI error states.
- **Clean Code & Organization**: Strict adherence to the MVC pattern, modular CSS, and structured Git workflows.

---

## Author & Acknowledgments

- **Developer:** Dawit Mahabaw
- **Program:** AI-Powered Full-Stack Application Development — Evangadi Networks
- **Instructional Team:** Evangadi Faculty, Mentors, and Peer Community

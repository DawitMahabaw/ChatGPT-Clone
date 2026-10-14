# ChatGPT Clone - Full Stack Application

A comprehensive full-stack AI-powered chatbot application built with modern web technologies. This project demonstrates the complete architecture of a production-ready chat application using React, Node.js/Express, MySQL, and Google Gemini API.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Learning Outcomes](#learning-outcomes)

---

## 🎯 Project Overview

This full-stack application allows users to interact with an AI-powered chatbot through an intuitive chat interface. Users can send messages, receive intelligent responses powered by Google Gemini API, and maintain conversation history stored in a MySQL database.

The project demonstrates:

- **Full-stack development** - from frontend UI to backend API and database
- **MVC architecture** - clean separation of concerns
- **REST API design** - proper HTTP methods and status codes
- **Database management** - conversation persistence
- **External API integration** - Google Gemini API
- **Modern frontend practices** - React with Vite

---

## 🏗️ Architecture

### Data Flow

```
User Interface (React)
        │
        │ HTTP Request
        ▼
    API Routes
        │
        ▼
   Controllers (MVC)
        │
        ▼
   Services Layer
        │
        ├──────────────► Google Gemini API (AI Responses)
        │
        ▼
    Models (Database)
        │
        ▼
   MySQL Database
        │
        ▼
   Backend Response
        │
        ▼
   User Interface (React)
```

### MVC Pattern

- **Models**: Database layer (`conversationModel.js`)
- **Views**: React components (ChatHeader, ChatInput, ChatMessage, etc.)
- **Controllers**: Business logic (`chatController.js`)
- **Services**: AI integration and helper functions (`geminiService.js`)

---

## 🛠️ Technologies

### Frontend Stack

- **React** - UI framework
- **Vite** - Fast build tool and development server
- **Axios** - HTTP client for API requests
- **CSS Modules** - Component-scoped styling

### Backend Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **Google Gemini API** - AI response generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools

- **Git** - Version control
- **GitHub** - Repository hosting
- **Vercel** - Cloud deployment platform
- **VS Code** - Code editor

---

## ✨ Features

### Frontend Features

- ✅ Real-time chat interface
- ✅ Message display with formatting
- ✅ Chat sidebar for conversation management
- ✅ Responsive design
- ✅ Smooth user experience

### Backend Features

- ✅ RESTful API endpoints
- ✅ AI-powered response generation
- ✅ Conversation history management
- ✅ Database persistence
- ✅ Error handling and validation

---

## 📁 Project Structure

```
ChatGPT_Clone_With_MVC/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatHeader/       # Header component
│   │   │   ├── ChatInput/        # Message input component
│   │   │   ├── ChatMessage/      # Message display component
│   │   │   ├── MessageList/      # Message list container
│   │   │   └── Sidebar/          # Sidebar navigation
│   │   ├── api/
│   │   │   └── chatApi.js        # API integration
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Database configuration
│   │   ├── controllers/
│   │   │   └── chatController.js # Business logic
│   │   ├── models/
│   │   │   └── conversationModel.js # Database queries
│   │   ├── routes/
│   │   │   └── chatRoutes.js     # API routes
│   │   ├── services/
│   │   │   └── geminiService.js  # AI integration
│   │   └── middleware/
│   │       └── error-handler.js  # Error handling
│   ├── index.js                  # Server entry point
│   ├── package.json
│   ├── vercel.json               # Deployment config
│   └── .env                      # Environment variables
│
└── README.md                     # This file
```

---

## 💻 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:

   ```
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   DB_SSL=true
   GEMINI_API_KEY=your_gemini_api_key
   PORT=5000
   ```

4. **Create the database**
   ```bash
   mysql -u root -p -e "CREATE DATABASE chatgpt_clone"
   ```
   On startup, the backend creates the `conversations` table if it is missing.
   Existing tables are left intact; incompatible `conversations` schemas stop
   startup with an error and must be corrected manually.

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Update `src/api/chatApi.js` with your backend URL:
   ```javascript
   const API_BASE_URL = "http://localhost:5000/api"; // or your deployment URL
   ```

---

## 🚀 Running the Application

### Development Mode

**Backend:**

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

**Frontend:**

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Production Build

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Endpoints

### Chat Endpoints

- **GET** `/api/chat/`
  - Check that the chat API is running.

- **GET** `/api/chat/conversations`
  - Return the five most recent saved messages, ordered oldest to newest.

- **POST** `/api/chat/conversations`
  - Save a user question and its Gemini response.
  - Request body:
    ```json
    {
      "question": "Your question here"
    }
    ```
  - Response:
    ```json
    {
      "userConversationId": 1,
      "assistantConversationId": 2,
      "answer": "..."
    }
    ```

---

## 🗄️ Database Schema

### Conversations Table

```sql
CREATE TABLE conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  token_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;
```

The application currently uses only `conversations`. It does not read or write
the `sessions` table. Existing extra columns, indexes, and records are not
modified by startup initialization.

---

## 🔐 Environment Variables

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chatgpt_clone
DB_SSL=false
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
```

### Render Backend Deployment

Set the backend root directory to `backend`, use `npm install` as the build
command, and `npm start` as the start command. Configure these environment
variables in Render:

```text
DB_HOST=<Aiven MySQL host>
DB_PORT=<Aiven MySQL port>
DB_USER=<Aiven MySQL user>
DB_PASSWORD=<Aiven MySQL password>
DB_NAME=defaultdb
DB_SSL=true
DB_SSL_CA=<full PEM CA certificate contents from Aiven>
GEMINI_API_KEY=<your Gemini API key>
```

In Aiven, open your MySQL service's **Overview** (or connection information),
find the **CA certificate** section, and copy the complete PEM certificate:
include the `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`
lines and all lines between them. To use a file locally, save it as
`backend/certs/ca.pem`; this is the default location read for remote database
connections. Alternatively, set `DB_SSL_CA_PATH` to the certificate file's
path.

To provide the certificate on Render, either include `backend/certs/ca.pem` in
the deployed backend, paste the PEM contents into the Render environment
variable `DB_SSL_CA`, or add it as a Render Secret File and set
`DB_SSL_CA_PATH` to its mounted path. A path on your development computer is
not available to Render.

The backend verifies both the certificate chain and server hostname. It refuses
remote connections if SSL is disabled or a valid CA certificate is missing;
`rejectUnauthorized` is never disabled.

Render supplies `PORT` automatically. The service listens only after the
database connection and table initialization succeed.

### Frontend (.env)

Create `frontend/.env` from the example file:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Set `VITE_API_URL` to the backend API URL, then restart the frontend dev server
after changing it. The URL should include `/api`.

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Deployment

### Backend Deployment (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

---

## 📚 Learning Outcomes

By completing this project, you will understand:

- ✅ **Full-stack architecture** - How frontend and backend communicate
- ✅ **MVC pattern** - Separation of concerns in backend development
- ✅ **REST APIs** - Designing and consuming APIs
- ✅ **React** - Component-based UI development
- ✅ **Node.js/Express** - Building scalable servers
- ✅ **MySQL** - Database design and queries
- ✅ **External API integration** - Working with third-party APIs
- ✅ **Git & GitHub** - Version control and collaboration
- ✅ **Deployment** - Hosting applications on cloud platforms

---

## 📝 License

This project is created as a learning exercise.

---

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the project maintainer.

---

**Happy Coding! 🚀**

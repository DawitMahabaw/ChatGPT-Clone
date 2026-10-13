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
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   GEMINI_API_KEY=your_gemini_api_key
   PORT=5000
   ```

4. **Setup database**
   ```bash
   mysql -u root -p < db/schema.sql
   ```

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

- **POST** `/api/chat/send`
  - Send a message and get AI response
  - Request body:
    ```json
    {
      "message": "Your question here",
      "conversationId": "optional_conversation_id"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "conversationId": "...",
        "userMessage": "...",
        "aiResponse": "...",
        "timestamp": "..."
      }
    }
    ```

- **GET** `/api/chat/history/:conversationId`
  - Retrieve conversation history
  - Response:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "...",
          "message": "...",
          "response": "...",
          "timestamp": "..."
        }
      ]
    }
    ```

---

## 🗄️ Database Schema

### Conversations Table

```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔐 Environment Variables

### Backend (.env)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chatgpt_clone
GEMINI_API_KEY=your_api_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)

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

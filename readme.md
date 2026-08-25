# LearnAI 🧠

**LearnAI** is a full-stack AI-powered study assistant that transforms any PDF document into an interactive learning experience. Upload your notes, textbooks, or research papers and let Google Gemini AI do the rest.

![LearnAI](https://img.shields.io/badge/Powered%20By-Google%20Gemini-4285F4?style=flat-square&logo=google)
![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20AI-6366f1?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Document Chat** | Ask any question about your PDF and get instant, context-aware answers |
| 💡 **Concept Explainer** | Explain any term or concept in the context of your document |
| 🃏 **Smart Flashcards** | Auto-generate a 3D flip-card study deck from your document |
| 🎯 **Adaptive Quizzes** | Take multiple-choice quizzes with instant feedback, scores, and explanations |
| 📊 **Learning Dashboard** | Track your documents, flashcard count, quizzes taken, and average score |
| 🔒 **Secure Auth** | JWT-based authentication with bcrypt password hashing |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — Modern, fast UI framework
- **Tailwind CSS v4** — Utility-first CSS with custom design tokens
- **React Router v6** — Client-side routing with protected routes
- **Lucide React** — Consistent icon system
- **Axios** — HTTP client with JWT interceptors
- **Canvas Confetti** — Celebration animations on quiz success

### Backend
- **Node.js** + **Express.js** — RESTful API server
- **MongoDB** + **Mongoose** — Document database with schema validation
- **Multer** — File upload handling
- **pdf-parse** — PDF text extraction
- **@google/generative-ai** — Google Gemini AI integration
- **bcryptjs** — Secure password hashing
- **jsonwebtoken** — JWT session management

---

## 🗂️ Project Structure

```
learnAI/
├── backend/
│   ├── controllers/        # Route handler logic
│   ├── middleware/         # Auth & error middleware
│   ├── models/             # Mongoose schemas (User, Document, Flashcard, Quiz, Chat)
│   ├── routes/             # Express route definitions
│   ├── services/
│   │   └── aiService.js    # Gemini AI integration (summary, chat, flashcards, quiz)
│   ├── uploads/            # PDF file storage (local)
│   └── server.js           # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/            # Axios instance with auth interceptors
│   │   ├── components/
│   │   │   └── workspace/  # AIChatTab, AIActionsTab, FlashcardsTab, QuizzesTab
│   │   ├── context/        # AuthContext (React Context + localStorage)
│   │   ├── pages/          # LandingPage, Login, Register, Dashboard, Workspace
│   │   ├── utils/          # authErrors, authStorage helpers
│   │   ├── App.jsx         # Route definitions
│   │   └── main.jsx        # App entry point
│   ├── index.html
│   └── vite.config.js
│
├── .env                    # Environment variables (DO NOT COMMIT)
├── render.yaml             # Render deployment config
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API Key → [Get one here](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/learnAI.git
cd learnAI
```

### 2. Configure Environment Variables

Create a `.env` file in the **root** directory:

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/learnai

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Server
PORT=5000
NODE_ENV=development
```

### 3. Install & Run the Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:5000`

### 4. Install & Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

The Vite dev server proxies all `/api` requests to `localhost:5000` automatically.

---

## 🌐 Deployment

### Backend → Render

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repository
4. Set the **Root Directory** to `backend`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `node server.js`
7. Add the following **Environment Variables** in the Render dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`

### Frontend → Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `frontend`
4. Vercel auto-detects Vite — no build command needed
5. Add **Environment Variable**:
   - `VITE_API_URL=https://your-render-backend.onrender.com/api`
6. Ensure `vercel.json` exists in `/frontend`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

> [!IMPORTANT]  
> After deploying the backend to Render, update the `VITE_API_URL` in Vercel to point to your Render service URL and redeploy the frontend.

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents` | List all user documents |
| POST | `/api/documents/upload` | Upload a PDF (multipart/form-data) |
| GET | `/api/documents/:id` | Get document details + extracted text |
| DELETE | `/api/documents/:id` | Delete a document |

### AI Features
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/:id/chat` | Chat with a document |
| POST | `/api/ai/:id/summary` | Generate a document summary |
| POST | `/api/ai/:id/explain` | Explain a concept |
| POST | `/api/ai/:id/flashcards` | Generate flashcard deck |
| POST | `/api/ai/:id/quiz` | Generate a quiz |

### Flashcards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/flashcards?document=:id` | Get flashcards for a document |
| POST | `/api/flashcards/bulk` | Save bulk flashcards |
| PUT | `/api/flashcards/:id/favorite` | Toggle favorite |

### Quizzes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/quizzes?document=:id` | Get quizzes for a document |
| POST | `/api/quizzes` | Save a new quiz |
| PUT | `/api/quizzes/:id/submit` | Submit quiz score |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Get aggregated learning stats |

---

## 🔒 Security

- All API routes (except `/auth/login` and `/auth/register`) require a valid Bearer JWT token
- Passwords are hashed using `bcryptjs` with a salt factor of 10
- Uploaded PDFs are stored server-side and only accessible by the authenticated uploader
- CORS is configured to allow only the frontend origin in production

---

## 🧠 AI Model

LearnAI uses **Google Gemini Flash** (cost-efficient, fast). All AI features use structured output schemas to guarantee valid JSON responses and eliminate brittle text parsing.

---

## 📄 License

MIT © 2026 LearnAI. Built for educational purposes.

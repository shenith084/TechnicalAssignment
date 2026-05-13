# 💰 Personal Finance Tracker

A full-stack personal finance management application that helps users track income, expenses, budgets, and financial goals — with insightful dashboard analytics.

---

## ✨ Features

- **User Authentication** — JWT-based secure register/login/logout
- **Transaction Management** — Add, edit, delete income & expense transactions with category tagging
- **Category Management** — Create custom income/expense categories
- **Budget Management** — Set monthly budgets per category with real-time progress tracking
- **Dashboard Analytics** — Visual charts for:
  - Income vs. Expense trends (monthly bar chart)
  - Expense breakdown by category (pie/donut chart)
  - Budget progress bars with overspend alerts
  - Key financial summary cards (balance, income, expenses)
- **Protected Routes** — All pages require authentication; unauthenticated users are redirected to login

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| React Router v6 | Client-side routing |
| Recharts | Data visualization (charts) |
| Axios | HTTP client for API calls |
| Vanilla CSS | Styling |

### Backend
| Technology | Purpose |
|---|---|
| Python 3 + Flask | REST API framework |
| Flask-SQLAlchemy | ORM for database interactions |
| Flask-JWT-Extended | JWT authentication |
| Flask-CORS | Cross-origin resource sharing |
| bcrypt | Password hashing |
| SQLite | Development database |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                                                              │
│   React (Vite) SPA                                           │
│   ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐  │
│   │ Dashboard│ │Transactions│ │ Budgets  │ │ Categories │  │
│   └──────────┘ └────────────┘ └──────────┘ └────────────┘  │
│              │                                               │
│         Axios HTTP Requests (JWT Bearer Token)               │
└──────────────┼───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│                    FLASK REST API (Port 5000)                │
│                                                              │
│  /api/auth        /api/transactions   /api/budgets           │
│  /api/categories  /api/dashboard                             │
│                                                              │
│  Flask-JWT-Extended (Auth Middleware)                        │
│  Flask-SQLAlchemy  (ORM)                                     │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
               ┌────────────────────┐
               │   SQLite Database   │
               │   (finance.db)      │
               └────────────────────┘
```

---
## 🚀 Setup Instructions

### 1. Prerequisites

Make sure you have the following installed:

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)

### 2. Installing Dependencies

#### Backend Dependencies

```bash
# Navigate to the Backend folder
cd Backend

# (Recommended) Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate


# Install Python packages
pip install -r requirements.txt
```

#### Frontend Dependencies

```bash
# Navigate to the Frontend folder
cd Frontend

# Install Node.js packages
npm install
```

### 3. Running the Database

The application uses **SQLite** — no external database setup is required. The database file (`finance.db`) is automatically created inside `Backend/instance/` the first time the backend starts.

> **Optional:** To configure a different database, set the `DATABASE_URL` environment variable in a `.env` file inside the `Backend/` folder:
> ```
> DATABASE_URL=sqlite:///finance.db
> SECRET_KEY=your-secret-key
> JWT_SECRET_KEY=your-jwt-secret
> ```

### 4. Running the Backend

```bash
# Make sure you are in the Backend directory with venv activated
cd Backend
python run.py
```

The Flask API will start at: **http://localhost:5000**

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### 5. Running the Frontend

Open a **new terminal window**:

```bash
# Navigate to Frontend directory
cd Frontend

# Start the Vite development server
npm run dev
```

The React app will start at: **http://localhost:5173**

Open your browser and navigate to `http://localhost:5173` to use the application.


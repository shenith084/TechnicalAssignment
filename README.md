# 💰 Personal Finance Tracker

A full-stack personal finance management application that helps users track income, expenses, budgets, and financial goals — with insightful dashboard analytics.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Installing Dependencies](#2-installing-dependencies)
  - [3. Running the Database](#3-running-the-database)
  - [4. Running the Backend](#4-running-the-backend)
  - [5. Running the Frontend](#5-running-the-frontend)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)

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

## 📁 Project Structure

```
Assigment/
├── Backend/
│   ├── app/
│   │   ├── __init__.py          # App factory, blueprint registration
│   │   ├── config.py            # Configuration (JWT, DB URI, secrets)
│   │   ├── extensions.py        # SQLAlchemy, JWT, CORS instances
│   │   ├── models/
│   │   │   ├── user.py          # User model
│   │   │   ├── category.py      # Category model
│   │   │   ├── transaction.py   # Transaction model
│   │   │   └── budget.py        # Budget model
│   │   └── routes/
│   │       ├── auth.py          # Register, Login, Me endpoints
│   │       ├── transactions.py  # CRUD for transactions
│   │       ├── budgets.py       # CRUD for budgets
│   │       ├── categories.py    # CRUD for categories
│   │       └── dashboard.py     # Analytics & summary endpoints
│   ├── requirements.txt
│   └── run.py
│
└── Frontend/
    ├── src/
    │   ├── App.jsx              # Root router with protected routes
    │   ├── main.jsx             # React entry point
    │   ├── index.css            # Global styles & design tokens
    │   ├── api/                 # Axios instance & API calls
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state (login/logout)
    │   ├── components/
    │   │   ├── Navbar.jsx       # Top navigation bar
    │   │   ├── Modal.jsx        # Reusable modal wrapper
    │   │   ├── ConfirmDelete.jsx # Inline delete confirmation
    │   │   ├── StatCard.jsx     # Dashboard stat card
    │   │   └── ProtectedRoute.jsx # Auth guard HOC
    │   └── pages/
    │       ├── Login.jsx        # Login page
    │       ├── Register.jsx     # Registration page
    │       ├── Dashboard.jsx    # Analytics & summary page
    │       ├── Transactions.jsx # Transaction CRUD page
    │       ├── Budgets.jsx      # Budget CRUD page
    │       └── Categories.jsx   # Category CRUD page
    ├── package.json
    └── vite.config.js
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

# macOS/Linux
source venv/bin/activate

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

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login and receive JWT | ❌ |
| GET | `/me` | Get current user info | ✅ |

### Transactions — `/api/transactions`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all user transactions | ✅ |
| POST | `/` | Create a new transaction | ✅ |
| PUT | `/<id>` | Update a transaction | ✅ |
| DELETE | `/<id>` | Delete a transaction | ✅ |

### Categories — `/api/categories`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all user categories | ✅ |
| POST | `/` | Create a new category | ✅ |
| PUT | `/<id>` | Update a category | ✅ |
| DELETE | `/<id>` | Delete a category | ✅ |

### Budgets — `/api/budgets`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all user budgets | ✅ |
| POST | `/` | Create a new budget | ✅ |
| PUT | `/<id>` | Update a budget | ✅ |
| DELETE | `/<id>` | Delete a budget | ✅ |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/summary` | Financial summary + recent transactions | ✅ |
| GET | `/expense-by-category` | Expense totals grouped by category | ✅ |
| GET | `/monthly` | Monthly income vs expense data | ✅ |
| GET | `/budget-progress` | Budget vs spent per category | ✅ |

---

## 🗄️ Database Schema

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| username | VARCHAR(80) | UNIQUE, NOT NULL |
| email | VARCHAR(120) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |

### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| type | VARCHAR(20) | NOT NULL (income/expense) |
| user_id | INTEGER | FK → users.id, NOT NULL |

### transactions
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| title | VARCHAR(200) | NOT NULL |
| amount | FLOAT | NOT NULL |
| type | VARCHAR(20) | NOT NULL (income/expense) |
| date | DATE | NOT NULL |
| note | TEXT | NULLABLE |
| category_id | INTEGER | FK → categories.id, NULLABLE |
| user_id | INTEGER | FK → users.id, NOT NULL |

### budgets
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| amount | FLOAT | NOT NULL |
| month | INTEGER | NOT NULL |
| year | INTEGER | NOT NULL |
| category_id | INTEGER | FK → categories.id, NOT NULL |
| user_id | INTEGER | FK → users.id, NOT NULL |

---

## 👤 Author

**Shenith Chanidu**  
Technical Assignment — Personal Finance Tracker

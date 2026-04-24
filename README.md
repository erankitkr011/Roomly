# 🏠 Roomly — Property Management System

> A full-stack MERN application for managing rental properties, tenants, billing, payments, and real-time communication between landlords and renters.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Key Modules](#key-modules)
- [Contributing](#contributing)

---

## 📖 About the Project

**Roomly** is a comprehensive rental property management platform that enables landlords to manage their properties end-to-end — from listing vacant rooms, onboarding renters, generating monthly utility bills, and tracking payments — to communicating directly with tenants via real-time chat. Renters get a self-service portal to view bills, make online/cash payments, request maintenance, and search for available rooms.

---

## ✨ Features

### For Landlords
- 🏘️ **Property Management** — Create and manage multiple houses, floors, and rooms
- 👥 **Renter Management** — Add renters by email, track their details and history
- 🧾 **Billing System** — Generate itemised monthly bills (rent + electricity + water + maintenance)
- 💳 **Payment Tracking** — Accept cash & online (Razorpay) payments; approve cash receipts
- 📢 **Notifications** — Broadcast announcements or send targeted alerts to renters
- 🗺️ **Room Listing** — Post vacant rooms for public discovery by potential renters
- 💬 **Real-Time Chat** — Direct messaging with renters via Socket.IO

### For Renters
- 🔍 **Room Search** — Browse and request available rooms from any landlord
- 📄 **My Bills** — View itemised bills with payment breakdown
- 💸 **Online Payment** — Pay bills directly via Razorpay payment gateway
- 🛠️ **Maintenance Requests** — Raise maintenance requests to the landlord
- 🔔 **Notifications** — Receive room-request status updates and landlord announcements
- 💬 **Real-Time Chat** — Message landlords directly

### General
- 🔐 **OTP-based Registration** — Email OTP verification during signup
- 🔑 **JWT Authentication** — Secure cookie-based session management
- 📸 **Image Uploads** — Cloudinary-powered image hosting for profiles and properties
- 📧 **Email Notifications** — Transactional emails via Nodemailer + Gmail SMTP
- 🛡️ **Security** — Helmet, Mongo-sanitize, HPP, and rate limiting

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Redux Toolkit, React Router v7, TailwindCSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Real-Time** | Socket.IO |
| **Authentication** | JWT (JSON Web Token), bcrypt |
| **Payments** | Razorpay |
| **File Storage** | Cloudinary |
| **Email** | Nodemailer (Gmail SMTP) |
| **PDF Generation** | PDFKit |

---

## 📂 Project Structure

```
Roomly/
│
├── frontend/                   # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Static assets (images, icons)
│   │   ├── components/         # Reusable UI components & layout
│   │   │   └── layout/         # Sidebar, Navbar, ProtectedRoute, DashboardLayout
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Application pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Houses.jsx
│   │   │   ├── HouseDetail.jsx
│   │   │   ├── Renters.jsx
│   │   │   ├── Bills.jsx       # Landlord billing panel
│   │   │   ├── MyBills.jsx     # Renter bills view
│   │   │   ├── Notifications.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── SearchRooms.jsx
│   │   │   ├── RoomDetail.jsx
│   │   │   └── Chat.jsx        # Real-time messaging
│   │   ├── services/           # Axios API call abstractions
│   │   ├── slices/             # Redux state slices
│   │   ├── store/              # Redux store configuration
│   │   ├── utils/
│   │   │   └── axiosInstance.js # Configured Axios client
│   │   ├── App.jsx             # Root component & route definitions
│   │   └── main.jsx            # React entry point
│   ├── .env                    # Frontend environment variables
│   ├── index.html
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/            # Route handler logic
│   │   ├── Auth.js             # Registration, login, password reset
│   │   ├── Landlord.js         # House, room, renter, bill management
│   │   ├── Renter.js           # Renter-specific actions
│   │   ├── Admin.js            # Admin panel operations
│   │   └── Chat.js             # Chat & messaging
│   ├── middlewares/            # Auth guard, role check, upload handler
│   ├── models/                 # Mongoose data models
│   │   ├── User.js
│   │   ├── House.js
│   │   ├── Floor.js
│   │   ├── Room.js
│   │   ├── Bill.js
│   │   ├── Payment.js
│   │   ├── Chat.js
│   │   ├── Notification.js
│   │   ├── MaintenanceRequest.js
│   │   ├── TransactionHistory.js
│   │   ├── RenterInvite.js
│   │   └── Otp.js
│   ├── routes/                 # Express route definitions
│   │   ├── Auth.js
│   │   ├── Landlord.js
│   │   ├── Renter.js
│   │   ├── Admin.js
│   │   ├── Notification.js
│   │   ├── Upload.js
│   │   └── Dashboard.js
│   ├── services/               # Business logic layer
│   │   ├── authService.js
│   │   ├── billService.js
│   │   ├── chatService.js
│   │   ├── houseService.js
│   │   ├── notificationService.js
│   │   ├── paymentService.js
│   │   ├── renterService.js
│   │   └── roomService.js
│   ├── mail/                   # Email templates & mailer utility
│   ├── utils/                  # Helper utilities
│   ├── .env                    # Backend environment variables
│   └── server.js               # Express app + Socket.IO entry point
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your system:

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org/) | v18 or higher |
| [npm](https://www.npmjs.com/) | v9 or higher |
| [MongoDB](https://www.mongodb.com/) | v6+ (local) **or** MongoDB Atlas (cloud) |

You will also need accounts / credentials for:
- **Cloudinary** — for image uploads ([free tier](https://cloudinary.com/))
- **Razorpay** — for payment integration ([test account](https://razorpay.com/))
- **Gmail SMTP** — for sending emails (app password required)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/<your-username>/Roomly.git
cd Roomly
```

**2. Install backend dependencies**

```bash
cd server
npm install
```

**3. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

---

### Environment Variables

You need to create `.env` files for both the backend and frontend.

#### Backend — `server/.env`

Create `server/.env` and fill in the following values:

```env
# ─── Database ──────────────────────────────────────────────────────────────────
# For local MongoDB:
MONGODB_URL=mongodb://localhost:27017/Roomly
# For MongoDB Atlas (cloud), replace with your connection string:
# MONGODB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# ─── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here

# ─── Server ────────────────────────────────────────────────────────────────────
PORT=4000

# ─── Frontend URL (for CORS) ───────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173

# ─── Email (Gmail SMTP) ────────────────────────────────────────────────────────
# Generate an app password at: https://myaccount.google.com/apppasswords
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_gmail_address@gmail.com
MAIL_PASS=your_gmail_app_password

# ─── Cloudinary ────────────────────────────────────────────────────────────────
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=uploads

# ─── Razorpay ──────────────────────────────────────────────────────────────────
RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_SECRET=your_razorpay_secret
WEBHOOK_SECRET=your_razorpay_webhook_secret
```

#### Frontend — `frontend/.env`

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_API_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **Never commit `.env` files to version control.** Both are listed in `.gitignore`.

---

### Running the Application

Open **two separate terminals** — one for the backend and one for the frontend.

#### Terminal 1 — Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on **http://localhost:4000**

You should see:
```
Server is running on port 4000
MongoDB Connected: localhost
```

#### Terminal 2 — Start the Frontend Dev Server

```bash
cd frontend
npm run dev
```

The frontend will start on **http://localhost:5173**

Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

---

## 🌐 API Overview

All API endpoints are prefixed with `/api/v1`.

| Prefix | Description |
|---|---|
| `/api/v1/auth` | Registration, login, OTP, password reset, logout |
| `/api/v1/landlord` | Houses, floors, rooms, renters, bills, payments |
| `/api/v1/renter` | Renter dashboard, room requests, maintenance, payments |
| `/api/v1/notifications` | Fetch, mark-read, dismiss notifications |
| `/api/v1/upload` | File / image upload to Cloudinary |
| `/api/v1/dashboard` | Aggregated stats for the dashboard |
| `/api/v1/admin` | Admin panel: user management, bill approvals |
| `/api/v1/health` | Server health check |

> 📬 A full Postman collection is available at `server/roomly_postman.json` — import it into Postman for complete request/response examples.

---

## 🔑 Key Modules

### Authentication Flow
1. User enters email → OTP sent via Gmail SMTP
2. User verifies OTP → account created
3. JWT issued on login → stored in HTTP-only cookie + localStorage
4. All protected routes validate the JWT via middleware

### Billing Workflow
1. Landlord selects renter and enters meter readings
2. System calculates: `electricity = (currentReading - previousReading) × perUnitRate`
3. Bill total = rent + electricity + water + maintenance + custom charges
4. Bill PDF generated (PDFKit) and notification sent to renter

### Real-Time Chat (Socket.IO)
- Users authenticate via JWT in socket handshake
- Each user joins a private room `user-{id}` for targeted events
- Chat rooms identified by `chat-{chatId}`
- Events: `send-message`, `new-message`, `typing`, `mark-read`, `messages-read`

### Payment Gateway (Razorpay)
- Renter initiates payment → Razorpay order created on backend
- Frontend loads Razorpay checkout → payment captured
- Webhook validates payment signature → bill marked as paid
- Transaction history recorded for both parties

---

## 📜 Scripts Reference

### Backend (`server/`)

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (hot-reload) |
| `npm start` | Start server in production mode |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is developed as part of **COOP-2 (22CS421)** at **Chitkara University Institute of Engineering & Technology**, BE-CSE Batch 2022 (Zeta Cluster).

---

*Built with ❤️ using the MERN Stack*

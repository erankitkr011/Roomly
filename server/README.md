# Roomly Backend API

Backend API for Roomly - A comprehensive multi-house property management system for landlords and renters.

## 🎉 New Multi-House Management System

**Major Update:** Roomly now supports a flexible house → floor → room hierarchy!

### Key Features:

✅ **Multiple Houses per Landlord**
- Manage multiple properties from one account
- Example: "Ankit Bhawan", "Ankush Bhawan"

✅ **Floor-Based Organization**
- Each house can have multiple floors
- Ground Floor, First Floor, Second Floor, etc.
- Each floor contains multiple units (rooms/flats/shops)

✅ **Dynamic User Roles**
- No need to choose role during signup
- Become a **Landlord** when you add your first house
- Become a **Renter** when allocated to a room
- **Same user can be both** landlord and renter simultaneously

✅ **Smart Room Management**
- Delete rooms only if vacant (prevents accidental data loss)
- House-level address storage
- Better property grouping and reporting

## 🚀 Core Features

- **Multi-House Management**: Organize properties by houses and floors
- **Authentication & Authorization**: JWT-based auth with dynamic role assignment
- **Property Management**: Add, update, and manage rooms/flats/shops across multiple properties
- **Billing System**: Automated electricity bill calculation with manual other bills
- **Payment Integration**: Razorpay integration for online payments
- **Chat System**: One-to-one chat between landlord-renter and controlled renter-to-renter chat
- **Notifications**: In-app and email notifications
- **File Upload**: Cloudinary integration for image uploads
- **Unified Dashboard**: View both landlord and renter sections in one place

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the `server` directory with the following variables:
   ```env
   PORT=4000
   NODE_ENV=development
   MONGODB_URL=mongodb://localhost:27017/roomly
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:4000
   MAIL_HOST=smtp.gmail.com
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── Auth.js              # Authentication controllers
│   ├── Landlord.js          # Landlord-specific controllers
│   ├── Renter.js            # Renter-specific controllers
│   ├── Admin.js             # Admin controllers
│   └── Chat.js              # Chat/messaging controllers
├── middlewares/
│   └── auth.js              # Authentication & authorization middlewares
├── models/
│   ├── User.js              # User schema
│   ├── Profile.js           # User profile schema
│   ├── Room.js              # Room/Flat/Shop schema
│   ├── Bill.js               # Bill schema
│   ├── Payment.js            # Payment schema
│   ├── Notification.js       # Notification schema
│   ├── Chat.js               # Chat schema
│   ├── ChatPermission.js     # Chat permission schema
│   ├── RenterInvite.js       # Renter invitation schema
│   ├── MaintenanceRequest.js # Maintenance request schema
│   ├── TransactionHistory.js # Transaction history schema
│   └── Otp.js                # OTP schema
├── routes/
│   ├── Auth.js               # Authentication routes
│   ├── Landlord.js           # Landlord routes
│   ├── Renter.js             # Renter routes
│   ├── Admin.js              # Admin routes
│   ├── Notification.js       # Notification routes
│   ├── Upload.js             # File upload routes
│   └── Dashboard.js          # Dashboard routes
├── mail/
│   └── templates/            # Email templates
├── utils/
│   └── mailSender.js         # Email utility
└── server.js                 # Main server file
```

## 🔌 API Routes

### Authentication Routes (`/api/v1/auth`)
- `POST /send-otp` - Send OTP for signup
- `POST /signup` - Register new user
- `POST /login` - Login user
- `POST /change-password` - Change password (protected)
- `POST /reset-password-token` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /logout` - Logout user (protected)

### Landlord Routes (`/api/v1/landlord`) - Protected
- `POST /add-renter` - Add renter by email
- `PUT /update-renter/:renterId` - Update renter details
- `DELETE /delete-renter/:renterId` - Remove renter
- `GET /all-renters` - Get all renters
- `POST /allocate-room` - Allocate room to renter
- `PUT /update-allocated-room/:roomId` - Update room details
- `POST /post-vacant-room` - Post vacant room
- `PUT /update-vacant-room/:roomId` - Update vacant room
- `POST /send-bill` - Create and send bill
- `PUT /update-bill/:billId` - Update bill
- `POST /request-delete-bill/:billId` - Request bill deletion
- `GET /renter-bills/:renterId` - Get renter's bills
- `POST /pay-cash-bill/:billId` - Mark bill as paid (cash)
- `POST /send-notification` - Send notification to all renters
- `POST /chat/:renterId` - Send message to renter
- `GET /chat/:renterId` - Get chat history
- `POST /enable-renter-chat` - Enable renter-to-renter chat
- `POST /disable-renter-chat` - Disable renter-to-renter chat

### Renter Routes (`/api/v1/renter`) - Protected
- `PUT /update-profile` - Update profile
- `GET /all-bills` - Get all bills
- `GET /bill/:billId` - Get single bill
- `POST /verify-bill/:billId` - Verify bill
- `POST /pay-online/:billId` - Create payment order
- `POST /verify-payment` - Verify and complete payment
- `POST /pay-by-cash/:billId` - Mark as paid by cash
- `GET /download-invoice/:billId` - Download invoice
- `GET /search-vacant-room` - Search vacant rooms
- `POST /chat/:landlordId` - Send message to landlord
- `GET /chat/:landlordId` - Get chat with landlord
- `POST /chat-with-renter/:renterId` - Send message to other renter
- `GET /chat-with-renter/:renterId` - Get chat with other renter

### Admin Routes (`/api/v1/admin`) - Protected
- `GET /all-users` - Get all users
- `GET /user/:userId` - Get user by ID
- `DELETE /delete-user/:userId` - Delete user
- `GET /all-properties` - Get all properties
- `GET /all-payments` - Get all payments
- `GET /bill-delete-requests` - Get bill deletion requests
- `POST /handle-delete-request/:billId` - Handle deletion request

### Utility Routes
- `GET /api/v1/notifications` - Get notifications (protected)
- `PUT /api/v1/notifications/:id/read` - Mark notification as read (protected)
- `POST /api/v1/upload/image` - Upload image (protected)
- `GET /api/v1/dashboard/stats` - Get dashboard stats (protected)

## 🔐 Authentication

All protected routes require a JWT token in one of the following formats:
- Cookie: `token` (set automatically on login)
- Header: `Authorization: Bearer <token>`
- Body: `token: <token>`

## 📝 Notes

- All timestamps are in ISO format
- All amounts are in INR (₹)
- Image uploads are handled via Cloudinary
- Email notifications are sent for important events
- Bills are auto-calculated based on meter readings
- Chat permissions are controlled by landlords for renter-to-renter communication

## 🐛 Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## 📄 License

ISC


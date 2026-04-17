# 🍽️ Smart Canteen System

> A modern, full-stack web application for managing canteen orders with real-time menu management, multi-restaurant support, and seamless payment processing.

![Smart Canteen System](smart.png)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

The **Smart Canteen System** is a comprehensive food ordering platform designed to streamline canteen operations in educational institutions, corporate offices, and food courts. The system enables multiple restaurant administrators to manage their menus independently while providing customers with a unified ordering experience.

### Problem Statement
Traditional canteen systems face challenges such as:
- Long queues and waiting times
- Manual order management leading to errors
- Difficulty in tracking orders and payments
- Limited menu visibility for customers

### Solution
Our Smart Canteen System addresses these issues by providing:
- Digital menu browsing and ordering
- Real-time order tracking
- Multi-restaurant management
- Automated payment processing
- Admin dashboard for menu and order management

---

## ✨ Key Features

### For Customers
- 🔍 **Browse Menus** - View food items from multiple restaurants
- 🏪 **Restaurant Selection** - Filter items by specific restaurants
- 🛒 **Shopping Cart** - Add/remove items with real-time total calculation
- 💳 **Multiple Payment Methods** - Cash, UPI, and Card options
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔎 **Search Functionality** - Quick search for food items

### For Restaurant Admins
- 🔐 **Secure Authentication** - JWT-based login system
- ➕ **Menu Management** - Add, edit, and delete menu items
- 📸 **Image Upload** - Upload food images for better presentation
- 📊 **Order Tracking** - View all orders in real-time
- 💰 **Revenue Statistics** - Track total orders and revenue
- 👤 **Profile Management** - Update restaurant details and credentials
- 🎨 **Modern UI** - Glassmorphism design with dark theme

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with glassmorphism effects
- **JavaScript (ES6+)** - Dynamic functionality and API integration
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Security & Authentication
- **JWT (JSON Web Tokens)** - Secure authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### File Handling
- **Multer** - File upload middleware for images

### Development Tools
- **Nodemon** - Auto-restart during development
- **dotenv** - Environment variable management

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Homepage   │  │ Admin Panel  │  │  Login/Auth  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   API Layer (REST)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Admin API   │  │   Menu API   │  │  Orders API  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth Service │  │ Menu Service │  │Order Service │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Admin     │  │   MenuItem   │  │    Order     │  │
│  │  Collection  │  │  Collection  │  │  Collection  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                    MongoDB Database                     │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Admin Collection
```javascript
{
  restaurantName: String (required),
  email: String (required, unique),
  password: String (hashed),
  phone: String,
  address: String,
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItem Collection
```javascript
{
  name: String (required),
  description: String,
  price: Number (required),
  category: String (enum),
  image: String,
  available: Boolean,
  adminId: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  items: [{
    menuItemId: ObjectId (ref: MenuItem),
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: Number (required),
  customerName: String (required),
  customerPhone: String (required),
  paymentStatus: String (enum: pending/completed/failed/Paid),
  paymentMethod: String (enum: cash/card/upi),
  paymentId: String,
  adminId: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd fsdproject
```

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/food-ordering
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

### Step 4: Start MongoDB
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### Step 5: Run the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Step 6: Access the Application
- **Customer Homepage**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/health

---

## 📖 Usage Guide

### For Customers

1. **Browse Menu**
   - Visit the homepage to see all available food items
   - Use the search bar to find specific items
   - Filter by restaurant using the dropdown

2. **Place Order**
   - Click "Add to Cart" on desired items
   - Review your cart on the right sidebar
   - Click "Checkout" when ready
   - Fill in your details (Name, Phone, Payment Method)
   - Submit the order

3. **Payment**
   - Choose payment method: Cash, UPI, or Card
   - Receive order confirmation with Order ID and Payment ID

### For Restaurant Admins

1. **Registration**
   - Navigate to `/admin`
   - Click "Sign Up"
   - Fill in restaurant details
   - Create account

2. **Login**
   - Enter email and password
   - Access admin dashboard

3. **Manage Menu**
   - Click "Add New Item" card
   - Upload image and fill details
   - Edit or delete existing items
   - Items appear on customer homepage immediately

4. **View Orders**
   - Access account page to see all orders
   - Track revenue and order statistics

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/admin/signup`
Register a new restaurant admin
```json
{
  "restaurantName": "My Restaurant",
  "email": "admin@restaurant.com",
  "password": "securepassword",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

#### POST `/api/admin/login`
Login as admin
```json
{
  "email": "admin@restaurant.com",
  "password": "securepassword"
}
```

### Menu Endpoints

#### GET `/api/menu`
Get all menu items (public)
- Query params: `available=true`, `category=Appetizers`

#### POST `/api/menu`
Create menu item (admin only)
- Requires: JWT token, FormData with image

#### PUT `/api/menu/:id`
Update menu item (admin only)

#### DELETE `/api/menu/:id`
Delete menu item (admin only)

### Order Endpoints

#### POST `/api/orders`
Create new order (public)
```json
{
  "items": [
    {"menuItemId": "...", "quantity": 2}
  ],
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "paymentMethod": "UPI",
  "paymentId": "PAY123456",
  "adminId": "..."
}
```

#### GET `/api/orders/admin/orders`
Get all orders for admin (requires auth)

#### GET `/api/orders/admin/statistics`
Get order statistics (requires auth)

---

## 📁 Project Structure

```
fsdproject/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── Admin.js             # Admin schema
│   │   ├── MenuItem.js          # Menu item schema
│   │   └── Order.js             # Order schema
│   ├── routes/
│   │   ├── admin.js             # Admin routes
│   │   ├── menu.js              # Menu routes
│   │   └── orders.js            # Order routes
│   ├── uploads/                 # Uploaded images
│   ├── .env                     # Environment variables
│   ├── package.json             # Dependencies
│   ├── seed.js                  # Database seeding
│   └── server.js                # Express server
├── frontend/
│   └── js/
│       └── api.js               # API client library
├── homepage.html                # Customer homepage
├── adminhomepage.html           # Admin dashboard
├── login.html                   # Admin login page
├── signup.html                  # Admin signup page
├── account.html                 # Admin account page
├── adminhomepage.css            # Admin styles
└── README.md                    # This file
```

---

## 📸 Screenshots

### Customer Homepage
- Modern glassmorphism design
- Grid layout for food items
- Real-time cart updates
- Restaurant filtering

### Admin Dashboard
- Menu management interface
- Add/Edit/Delete functionality
- Image upload support
- Order tracking

### Login/Signup
- Secure authentication
- Clean, professional design
- Form validation

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time order notifications using WebSockets
- [ ] Order history for customers
- [ ] Rating and review system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] QR code ordering
- [ ] Inventory management
- [ ] Discount and coupon system
- [ ] Multi-language support

### Technical Improvements
- [ ] Unit and integration testing
- [ ] API rate limiting
- [ ] Redis caching
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Progressive Web App (PWA)
- [ ] GraphQL API option

---

## 👥 Team & Contributors

**Project Type**: Full Stack Development (FSD) Project  
**Academic Year**: 2025  
**Institution**: [Your Institution Name]

### Team Members
- **Developer**: Srikanth
- **Role**: Full Stack Developer

---

## 📄 License

This project is created for educational purposes as part of a Full Stack Development course.

---

## 🤝 Support & Contact

For questions, issues, or suggestions:
- Create an issue in the repository
- Contact: [Your Email]

---

## 🙏 Acknowledgments

- MongoDB documentation
- Express.js community
- Node.js ecosystem
- Stack Overflow community

---

**Made with ❤️ for Smart Canteen Management**

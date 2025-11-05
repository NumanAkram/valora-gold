# Valora Gold - Complete E-commerce Website

Complete professional e-commerce website for Valora Gold with frontend (React) and backend (Node.js/Express/MongoDB).

## 🚀 Features

### Frontend Features
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Product catalog with categories
- ✅ Product search functionality
- ✅ Shopping cart management
- ✅ Wishlist functionality
- ✅ User authentication (Sign In/Sign Up)
- ✅ Product detail pages with reviews
- ✅ Customer reviews section
- ✅ Contact form
- ✅ Newsletter subscription
- ✅ Order management
- ✅ Recently viewed products
- ✅ WhatsApp integration
- ✅ Social media links
- ✅ SEO optimized

### Backend Features
- ✅ RESTful API with Express.js
- ✅ MongoDB database
- ✅ User authentication with JWT
- ✅ Product management (CRUD)
- ✅ Cart & Wishlist APIs
- ✅ Order processing
- ✅ Review system
- ✅ Newsletter & Contact management
- ✅ Search functionality
- ✅ Category filtering
- ✅ Stock management

## 📁 Project Structure

```
valoragold/
├── server/                 # Backend API
│   ├── config/            # Database configuration
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── scripts/            # Seed scripts
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
│
├── src/                    # Frontend React App
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── context/            # React Context (State management)
│   ├── utils/              # Utility functions & API
│   └── index.js            # Entry point
│
└── public/                 # Static assets
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or MongoDB Atlas)
- npm or yarn

### Step 1: Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/valoragold
JWT_SECRET=your_super_secret_jwt_key_change_this
FRONTEND_URL=http://localhost:3000
```

5. Start MongoDB (if using local):
- Make sure MongoDB is running on your system
- Or use MongoDB Atlas (cloud) and update MONGODB_URI

6. Seed initial data (optional):
```bash
node scripts/seed.js
```

7. Start the backend server:
```bash
npm run dev    # Development mode (with nodemon)
# or
npm start      # Production mode
```

Backend will run on `http://localhost:5000`

### Step 2: Frontend Setup

1. Navigate to project root:
```bash
cd ..   # If you were in server directory
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in root (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/bestsellers` - Get best sellers
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get by category
- `GET /api/products/:id/related` - Get related products

### Cart (Protected)
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:productId` - Update quantity
- `DELETE /api/cart/:productId` - Remove item
- `DELETE /api/cart` - Clear cart

### Wishlist (Protected)
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

### Orders (Protected)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/track/:orderNumber` - Track order

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review (Protected)

### Newsletter
- `POST /api/newsletter` - Subscribe

### Contact
- `POST /api/contact` - Submit contact form

## 🔐 Authentication

Protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

Token is automatically stored in localStorage on login/register.

## 📊 Database Models

### User
- Authentication (email, password)
- Profile (name, phone, addresses)
- Cart & Wishlist
- Recently viewed products

### Product
- Basic info (name, description, price)
- Images, categories
- Stock management
- Ratings & reviews

### Order
- User association
- Items with quantities
- Shipping address
- Payment & status tracking
- Order number for tracking

### Review
- Product association
- User association
- Rating (1-5 stars)
- Review text
- Verification status

### Newsletter
- Email subscription management

### Contact
- Contact form submissions

## 🎨 Company Information

**Valora Gold**
- Phone: 0339-0005256
- Email: info@valoragold.store
- Website: valoragold.store
- Location: 15-B Gulberg II, Lahore, Pakistan
- Social Media: https://linktr.ee/valoragold

## 🚦 Testing the Application

### 1. Start Backend
```bash
cd server
npm run dev
```

### 2. Start Frontend (in new terminal)
```bash
npm start
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### 4. Test Features
1. Register a new account
2. Browse products
3. Add products to cart
4. Add to wishlist
5. View product details
6. Submit contact form
7. Subscribe to newsletter

## 🔧 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- For MongoDB Atlas, ensure IP whitelist includes your IP

### CORS Error
- Check FRONTEND_URL in server/.env
- Make sure frontend URL matches exactly

### Port Already in Use
- Change PORT in server/.env
- Kill process using the port:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -ti:5000 | xargs kill`

## 📝 Environment Variables

### Backend (.env in server/)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/valoragold
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env in root/)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Backend Deployment
1. Set production NODE_ENV
2. Update MONGODB_URI to production database
3. Set secure JWT_SECRET
4. Update FRONTEND_URL to production domain
5. Deploy to Heroku, Railway, or similar

### Frontend Deployment
1. Update REACT_APP_API_URL to production API URL
2. Build: `npm run build`
3. Deploy build folder to Netlify, Vercel, or similar

## 📦 Dependencies

### Backend
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- express-validator

### Frontend
- react
- react-router-dom
- tailwindcss
- lucide-react

## 👨‍💻 Development

- Backend runs on port 5000
- Frontend runs on port 3000
- MongoDB runs on default port 27017
- Hot reload enabled in development mode

## 📄 License

All rights reserved by Valora Gold.

## 📞 Support

For issues or questions:
- Email: info@valoragold.store
- Phone: 0339-0005256

---

**Made with ❤️ for Valora Gold**

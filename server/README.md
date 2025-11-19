# Valora Gold Backend API

Complete backend API for Valora Gold e-commerce website.

## Setup Instructions

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `server/.env` (copy from the snippet below or your deployment secrets):
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/valoragold
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000

# Email notifications (required for order emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@valoragold.store
SMTP_PASS=your_app_password_here
SMTP_FROM=info@valoragold.store
ADMIN_NOTIFICATION_EMAILS=info@valoragold.store,valoragold.pk@gmail.com

# SMS and WhatsApp notifications (using Twilio)
# Get these from https://console.twilio.com/
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

> 💡 Generate an **App Password** for `SMTP_PASS` by enabling 2-Step Verification on the Gmail/Workspace account and creating an app-specific password (Security → App passwords). Paste the 16-character code without spaces.

> 📱 For **SMS and WhatsApp notifications**, sign up at [Twilio](https://www.twilio.com/) and get your credentials:
> - Create a free account at https://console.twilio.com/
> - Get your `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` from the dashboard
> - For SMS: Get a phone number from Twilio and set it as `TWILIO_PHONE_NUMBER`
> - For WhatsApp: Use Twilio's sandbox number `whatsapp:+14155238886` (for testing) or get your own WhatsApp Business number
> - Note: Twilio free tier includes limited SMS/WhatsApp messages for testing

3. Start MongoDB (if using local):
- Make sure MongoDB is installed and running
- Or use MongoDB Atlas (cloud database)

4. Run the server:
```bash
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

## API Endpoints

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
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id/related` - Get related products

### Cart
- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart` - Add to cart (Protected)
- `PUT /api/cart/:productId` - Update quantity (Protected)
- `DELETE /api/cart/:productId` - Remove from cart (Protected)
- `DELETE /api/cart` - Clear cart (Protected)

### Wishlist
- `GET /api/wishlist` - Get wishlist (Protected)
- `POST /api/wishlist` - Add to wishlist (Protected)
- `DELETE /api/wishlist/:productId` - Remove from wishlist (Protected)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get single order (Protected)
- `GET /api/orders/track/:orderNumber` - Track order (Public)

### Reviews
- `GET /api/reviews` - Get all verified reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review (Protected)

### Newsletter
- `POST /api/newsletter` - Subscribe to newsletter

### Contact
- `POST /api/contact` - Submit contact form

## Database Models

- **User**: Authentication, cart, wishlist, addresses
- **Product**: Products with categories, pricing, images
- **Review**: Customer reviews and ratings
- **Order**: Order management and tracking
- **Newsletter**: Email subscriptions
- **Contact**: Contact form submissions

## Authentication

Protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

Token is returned on login/register and is valid for 30 days.

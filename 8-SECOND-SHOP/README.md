# 8 Seconds — Full-Stack Project

## Main technologies
- HTML, CSS, Vanilla JavaScript modules
- Hash SPA routing
- One Web Component: `<cart-badge>`
- React: Admin statistics (`useState`, `useEffect`, props)
- Node.js + Express
- MongoDB + Mongoose
- Session + cookie login

## Main features
- Product list loaded from MongoDB; search, filter, sort and pagination handled in the frontend
- Account-based wishlist and simple `productId + color + quantity` cart stored in MongoDB
- 3-step checkout and orders
- Register, login, logout
- Product rating/comment
- Admin product add/edit/delete
- Admin product image upload and preset color selection
- Admin order status management
- Responsive desktop/mobile design

## Run
1. Make sure MongoDB is running.
2. Run `npm install --no-package-lock`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

Admin account for local testing:
- Email: `admin@8seconds.local`
- Password: `Admin123!`

`.env.example` is only needed if you want to change the database connection or local admin values.

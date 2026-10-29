# ShopEZ: One-Stop Shop for Online Purchases

**Author:** Falin  
**Team ID:** Individual-Falin  
**Program:** MongoDB LM2 (Skill Wallet) capstone project  
**Demo video:** https://youtu.be/nltRuxYxPWM

ShopEZ is a small online shop built with the **MERN** stack (MongoDB, Express, React, Node.js).
Customers can browse products, add them to a cart, check out with Cash on Delivery and track their orders.
An admin can manage products and update the status of every order.

---

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (or local MongoDB) with Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs for password hashing |
| Security | helmet, CORS allow-list, input validation |

---

## Features

**Customer**
- Sign up and log in (JWT token, passwords hashed with bcryptjs)
- Product list with search, category filter and sort (newest, price, name)
- Product detail page with stock status
- Cart: add items, change quantity, remove items
- Checkout with shipping address and **Cash on Delivery**
- Order history and order detail page
- Cancel an order while it is still "Placed" (stock goes back)

**Admin**
- Dashboard: revenue, order count, customers, products, orders by status, low-stock items, latest orders
- Add, edit and delete products
- View all orders and update their status: **Placed → Shipped → Delivered**, or **Cancelled**

---

## Demo accounts

Created by `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopez.com | Admin@123 |
| Customer | customer@shopez.com | Customer@123 |

> `npm run seed` **deletes** all users, products and orders, then adds 12 sample products and the two accounts above.

---

## Setup

**You need:** Node.js 18 or newer, and a MongoDB connection string (a free MongoDB Atlas cluster works).

### 1. Create the server `.env` file

Copy `server/.env.example` to `server/.env`:

```bash
cp server/.env.example server/.env
```

On Windows use `copy server\.env.example server\.env`.

Then open `server/.env` and fill in:
- `MONGO_URI`: your MongoDB connection string (put the database name `shopez` before the `?`)
- `JWT_SECRET`: any long random text

### 2. Start the backend (terminal 1)

```bash
cd server
npm install
npm run seed
npm start
```

The API runs on http://localhost:5000. Check it at http://localhost:5000/api/health.

### 3. Start the frontend (terminal 2)

```bash
cd client
npm install
npm start
```

Open **http://localhost:5173**. Vite forwards every `/api` request to the backend, so nothing else needs to be set up.

### Optional: API tests

With the backend running and the database seeded:

```bash
cd server
npm test
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **macOS: port 5000 already in use** | macOS uses port 5000 for *AirPlay Receiver*. Set `PORT=5050` in `server/.env`, then change the proxy `target` in `client/vite.config.js` to `http://localhost:5050`. |
| `MongoDB connection error` | Check `MONGO_URI`, your Atlas username and password, and that your IP is allowed in Atlas *Network Access*. |
| `MONGO_URI is missing` or `JWT_SECRET is missing` | `server/.env` does not exist yet. Do setup step 1. |
| Shop says "Cannot reach the server" | The backend is not running. Start it with `npm start` in `server/`. |
| Logged out suddenly | The login token expired (7 days by default). Log in again. |

---

## Project structure

```
.
├── client/                 React app (Vite)
│   ├── public/images/      product images used by the sample data
│   ├── src/
│   │   ├── api/            Axios client and API calls
│   │   ├── components/     reusable UI (Navbar, ProductCard, ...)
│   │   ├── context/        AuthContext (login) and CartContext (cart)
│   │   ├── pages/          one file per screen
│   │   │   └── admin/      admin dashboard, products and orders
│   │   └── utils/          formatting and price helpers
│   ├── vite.config.js      dev server + /api proxy
│   └── .env.example
├── server/                 Express API
│   ├── config/             database connection and constants
│   ├── controllers/        logic for each endpoint
│   ├── middleware/         auth (protect, adminOnly) and error handling
│   ├── models/             Mongoose models: User, Product, Order
│   ├── routes/             URL → controller mapping
│   ├── seed/               sample data and seed script
│   ├── tests/              API tests
│   ├── utils/              small helpers
│   ├── app.js / server.js  Express app and entry point
│   └── .env.example
├── .gitignore
└── README.md
```

---

## API endpoints

Base URL: `http://localhost:5000/api`  
Protected routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| GET | /health | Public | Check the API is running |
| POST | /auth/register | Public | Create a customer account |
| POST | /auth/login | Public | Log in, returns token and user |
| GET | /auth/me | Logged in | Get the current user |
| GET | /products | Public | List products (query: `search`, `category`, `sort`) |
| GET | /products/categories | Public | List categories |
| GET | /products/:id | Public | Get one product |
| POST | /products | Admin | Add a product |
| PUT | /products/:id | Admin | Edit a product |
| DELETE | /products/:id | Admin | Delete a product |
| POST | /orders | Logged in | Place an order |
| GET | /orders/my | Logged in | My order history |
| GET | /orders/:id | Owner or Admin | Get one order |
| PUT | /orders/:id/cancel | Owner | Cancel a "Placed" order |
| GET | /orders | Admin | All orders (query: `status`) |
| PUT | /orders/:id/status | Admin | Set status: Placed, Shipped, Delivered, Cancelled |
| GET | /admin/stats | Admin | Dashboard numbers |

`sort` values: `newest` (default), `price_asc`, `price_desc`, `name`.  
Errors come back as `{ "message": "..." }` with a matching HTTP status (400, 401, 403, 404, 500).

---

## License

MIT. Built for learning.

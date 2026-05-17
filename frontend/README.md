# Stylish — Frontend

React 18 + Vite frontend for the Stylish clothing store, connected to the existing Node.js/Express backend.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

The backend must be running at http://localhost:3000

## Tech Stack
- React 18 + Vite
- React Router DOM v6
- Axios (with Bearer token interceptor)
- Tailwind CSS (navy + gold theme, Playfair Display + DM Sans fonts)
- react-hot-toast for notifications
- Context API: AuthContext + CartContext

## Pages
| Route | Access | Description |
|---|---|---|
| `/` | Public | Home — product grid with category/price/sort filters |
| `/products/:id` | Public | Product detail with size/color/qty selector |
| `/login` | Public | Login form |
| `/register` | Public | Register with role selector |
| `/cart` | Auth | Cart with shipping form + place order |
| `/order-confirmation` | Auth | Success page after order |
| `/orders` | Auth | My orders list with expandable details |
| `/admin` | Admin | Dashboard — manage products (CRUD) + orders (status) |

## Auth Flow
- Login saves `token` and `user` to localStorage
- Axios interceptor attaches `Authorization: Bearer <token>` automatically
- 401 responses auto-logout and redirect to /login
- ProtectedRoute → redirects to /login if not authenticated
- AdminRoute → redirects to / if role !== admin

## Folder Structure
```
src/
├── api/axios.js          — Axios instance + interceptors
├── context/
│   ├── AuthContext.jsx   — user, token, login(), logout()
│   └── CartContext.jsx   — cart state, add/remove/update/clear
├── components/
│   ├── Navbar.jsx        — sticky nav with cart badge
│   ├── ProductCard.jsx   — product card with hover add-to-cart
│   ├── LoadingSpinner.jsx
│   └── ErrorMessage.jsx
├── routes/
│   └── ProtectedRoute.jsx — ProtectedRoute + AdminRoute
└── pages/
    ├── HomePage.jsx
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── ProductDetailsPage.jsx
    ├── CartPage.jsx
    ├── OrderConfirmationPage.jsx
    ├── MyOrdersPage.jsx
    └── AdminDashboard.jsx
```

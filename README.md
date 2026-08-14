# VendorStore — Frontend

> A modern, responsive e-commerce storefront and management dashboard built with **Next.js, TypeScript, Tailwind CSS, and Zustand**.

VendorStore is a full-featured e-commerce frontend designed for a modern online store. It includes a customer-facing shopping experience alongside a dedicated admin dashboard for managing products, categories, orders, customers, inventory, reviews, analytics, and store operations.

The frontend is built with a focus on **performance, responsive design, reusable components, smooth interactions, and maintainable architecture**.

---

## ✨ Features

### 🛍️ Customer Store

* Modern responsive storefront
* Product browsing and discovery
* Product detail pages
* Product variants
* Shopping cart
* Cart drawer
* Wishlist system
* Checkout flow
* Customer authentication
* User registration and login
* Google authentication support
* Customer profile
* Order history
* Order details
* Product reviews
* Responsive navigation
* Mobile-friendly UI
* Loading and error states
* Custom 1–100 loading experience on the main storefront

### 🧑‍💼 Admin Dashboard

A dedicated admin panel for managing the entire store.

* Dashboard overview
* Sales analytics
* Revenue overview
* Order management
* Order status tracking
* Customer management
* Customer details
* Product management
* Create products
* Edit products
* Product details
* Category management
* Inventory management
* Low-stock monitoring
* Review management
* Store activity overview
* Quick management actions

### 🛒 Cart & Wishlist

* Add products to cart
* Variant-aware cart items
* Quantity management
* Remove items
* Cart subtotal calculation
* Persistent cart state
* Wishlist synchronization
* Wishlist toggle
* Wishlist loading states

### 🎨 UI & UX

* Responsive layout
* Clean modern interface
* Orange `#f85606` brand accent
* Smooth animations
* Framer Motion interactions
* Lucide icons
* Accessible UI patterns
* Reusable components
* Mobile-first responsive design
* Custom loading screens
* Empty states
* Error states
* Loading states

---

## 🧱 Tech Stack

### Core

| Technology         | Purpose                                 |
| ------------------ | --------------------------------------- |
| **Next.js 16.3**   | React framework and application routing |
| **React 19**       | UI library                              |
| **TypeScript 5**   | Type-safe development                   |
| **Tailwind CSS 4** | Styling and responsive UI               |
| **Zustand 5**      | Client-side state management            |
| **Axios**          | API communication                       |

### UI & Animation

| Package                      | Purpose                    |
| ---------------------------- | -------------------------- |
| **Framer Motion**            | Animations and transitions |
| **Lucide React**             | Icons                      |
| **shadcn**                   | UI component ecosystem     |
| **Base UI**                  | UI primitives              |
| **class-variance-authority** | Component variants         |
| **clsx**                     | Conditional class names    |
| **tailwind-merge**           | Tailwind class merging     |
| **tw-animate-css**           | Tailwind animations        |
| **OGL**                      | WebGL-based visual effects |

### Development

* ESLint 9
* Next.js ESLint configuration
* TypeScript
* PostCSS
* Tailwind CSS

---

## 📁 Project Structure

```text
frontend/
│
├── app/
│   ├── (shop)/
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── ...
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx
│   │   │
│   │   ├── wishlist/
│   │   │   └── page.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── admin/
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   │
│   │   ├── categories/
│   │   │   ├── new/
│   │   │   └── page.tsx
│   │   │
│   │   ├── customers/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   │
│   │   ├── inventory/
│   │   │   └── page.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── [id]/
│   │   │   ├── new/
│   │   │   └── page.tsx
│   │   │
│   │   ├── reviews/
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── page.tsx
│
├── components/
│   ├── CartDrawer.tsx
│   ├── Footer.tsx
│   ├── HomePageLoader.tsx
│   ├── Navbar.tsx
│   └── ProductCard.tsx
│
├── hooks/
│   └── useWishlist.ts
│
├── lib/
│   ├── axios.ts
│   ├── store.ts
│   └── utils.ts
│
├── public/
│   ├── logo.png
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── types/
│   └── index.ts
│
├── .env
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

> Generated folders such as `node_modules`, `.next`, and `dist` are intentionally excluded from the repository structure.

---

## 🗂️ Architecture

The application is organized around the Next.js App Router.

### Shop Routes

The `(shop)` route group contains the customer-facing application.

```text
app/(shop)/
```

This keeps storefront routes organized without adding the route group name to the URL.

Examples:

```text
/products
/products/[id]
/checkout
/login
/register
/orders
/profile
/wishlist
```

### Admin Routes

The admin application lives under:

```text
app/admin/
```

It contains dedicated interfaces for:

* Products
* Categories
* Orders
* Customers
* Inventory
* Reviews
* Analytics
* Revenue

---

## 🧩 Reusable Components

The `components` directory contains shared UI components used throughout the application.

### `Navbar.tsx`

Main storefront navigation including:

* Brand logo
* Navigation links
* Authentication state
* Wishlist access
* Cart access
* Responsive navigation

### `CartDrawer.tsx`

Provides a quick cart experience without requiring users to leave the current page.

### `ProductCard.tsx`

Reusable product presentation component used for product listings and storefront sections.

### `Footer.tsx`

Global storefront footer.

### `HomePageLoader.tsx`

Custom loading experience for the main storefront homepage.

---

## 🧠 State Management

Client-side state is handled using **Zustand**.

The main store is located at:

```text
lib/store.ts
```

It manages:

* Authentication user state
* Cart state
* Cart drawer state
* Wishlist state
* Wishlist loading state
* Wishlist synchronization
* Cart persistence

The cart is persisted using Zustand's `persist` middleware.

```text
cart → localStorage
```

Authentication tokens are handled separately and are not stored through the Zustand persistence layer.

---

## 🌐 API Integration

API communication is centralized through Axios.

```text
lib/axios.ts
```

This keeps API requests consistent across the application and allows the frontend to communicate with the VendorStore backend.

Typical application areas using the API include:

* Authentication
* Products
* Wishlist
* Orders
* Customers
* Reviews
* Admin analytics
* Inventory
* Product uploads

---

## 🔐 Authentication

The frontend supports authenticated user flows including:

* Register
* Login
* Google authentication
* Current-user retrieval
* Protected customer functionality
* Admin functionality

Authentication tokens are used when communicating with protected backend endpoints.

---

## 🛒 Cart Persistence

The cart uses Zustand persistence so products added to the cart remain available across page refreshes.

Persisted state:

```text
cart
```

Not persisted through Zustand:

```text
user
wishlist
authentication token
```

---

## ❤️ Wishlist

Wishlist functionality is available across the storefront.

The implementation supports:

* Add to wishlist
* Remove from wishlist
* Wishlist state synchronization
* Wishlist loading state
* Server-side wishlist retrieval
* Optimistic-style UI updates when a product object is available

The main reusable wishlist hook is:

```text
hooks/useWishlist.ts
```

---

## 🎨 Brand Identity

VendorStore uses a simple modern visual identity.

### Primary Brand Color

```text
#f85606
```

The orange accent is used across:

* Buttons
* Links
* Icons
* Active states
* Highlights
* Loading indicators
* Admin interface elements

The overall interface combines white surfaces, neutral gray typography, subtle borders, and orange accents.

---

## ⚙️ Environment Variables

Create a `.env` file in the frontend root.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Use the environment variable expected by your API configuration in `lib/axios.ts`.

> Never commit private API keys, secrets, or production credentials to GitHub.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Enter the frontend directory

```bash
cd frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create:

```text
.env
```

and configure the backend API URL.

### 5. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 📦 Available Scripts

### Development

```bash
npm run dev
```

Starts the Next.js development server.

### Production Build

```bash
npm run build
```

Creates an optimized production build and performs TypeScript validation.

### Production Server

```bash
npm run start
```

Starts the application using the production build.

### Lint

```bash
npm run lint
```

Runs ESLint against the project.

---

## 🏗️ Production Build

Before deployment, verify the project with:

```bash
npm run build
```

A successful build should complete:

```text
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

Then start the production server with:

```bash
npm run start
```

---

## 📱 Responsive Design

VendorStore is designed to work across:

* 📱 Mobile
* 📲 Tablet
* 💻 Laptop
* 🖥️ Desktop

The UI uses Tailwind CSS responsive utilities to adapt layouts, navigation, product grids, dashboards, and forms across different screen sizes.

---

## ⚡ Performance

The project takes advantage of Next.js features including:

* App Router
* Static rendering where possible
* Dynamic routes
* Optimized production builds
* Code splitting
* Component-based architecture
* Client-side state management
* Optimized image handling

---

## 🛠️ Development Philosophy

The frontend follows several development principles:

* Reusable React components
* Strong TypeScript typing
* Centralized API configuration
* Centralized client state
* Responsive-first UI
* Clear route organization
* Consistent design system
* Minimal unnecessary dependencies
* Production-focused error handling

---

## 🔮 Future Improvements

Potential future improvements include:

* Advanced product filtering
* Product search optimization
* Pagination improvements
* Advanced analytics charts
* Notification system
* More detailed customer management
* Role-based admin permissions
* Dark mode
* Improved accessibility
* PWA support
* Advanced caching strategies
* Automated frontend testing

---

## 📄 License

This project is currently private and intended for the VendorStore application.

All rights reserved unless otherwise specified.

---

## 👨‍💻 Author

**Mashhudur Rahman (Mahir)**

Full-stack developer focused on building modern, scalable, and interactive web applications.

---

## ⭐ VendorStore

A modern e-commerce experience built for both **customers and store administrators**.

**Fast. Responsive. Modern. Built to scale.**

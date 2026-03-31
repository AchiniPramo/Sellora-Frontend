<div align="center">

# 🌟 Sellora Webapp

### A Modern E-Commerce Web Application

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**A full-featured e-commerce platform built with modern technologies for seamless user experience**

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [📦 Available Scripts](#-available-scripts)
- [🎨 Components & Modules](#-components--modules)
- [🔌 API Integration](#-api-integration)
- [📚 Documentation](#-documentation)
- [👥 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- ✅ **Modern UI/UX** - Beautiful, responsive interface powered by shadcn/ui
- 🔐 **Secure Authentication** - User login, registration, and profile management
- 🛍️ **E-Commerce** - Complete shopping experience with items and orders
- 📱 **Mobile-Responsive** - Works flawlessly on all devices
- ⚡ **High Performance** - Optimized with Next.js 16 for speed
- 🎨 **Dark Mode Support** - Built-in theme switching with next-themes
- 📊 **Data Management** - Form handling with React Hook Form & Zod validation
- 🔔 **Toast Notifications** - Beautiful notifications with Sonner
- 📅 **Date Handling** - Professional date formatting with date-fns

---

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe development

### Styling & UI Components
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icon library
- **Radix UI** - Primitive UI components
- **Class Variance Authority** - Utility for managing component variants

### Forms & Validation
- **React Hook Form 7.71.2** - Efficient form management
- **Zod 4.3.6** - TypeScript-first schema validation
- **@hookform/resolvers** - Connect Zod with React Hook Form

### Additional Libraries
- **Axios 1.13.6** - HTTP client for API requests
- **next-themes 0.4.6** - Theme management
- **Sonner 2.0.7** - Toast notifications
- **date-fns 4.1.0** - Date utilities
- **clsx 2.1.1** - Utility for conditional classnames
- **tailwind-merge 3.5.0** - Merge Tailwind classes smartly

### Development Tools
- **ESLint 9** - Code linting
- **Node 20+** - Runtime environment

---

## 📁 Project Structure

```
webapp/
│
├── 📂 app/                          # Next.js App Router
│   ├── (auth)/                      # Authentication routes (login, register)
│   ├── dashboard/                   # Main dashboard page
│   ├── items/                       # Items/Products listing page
│   ├── orders/                      # Orders management page
│   ├── my-orders/                   # User's personal orders
│   ├── profile/                     # User profile page
│   ├── shop/[id]/                   # Shop detail page (dynamic)
│   ├── students/                    # Students management
│   ├── users/                       # Users management
│   ├── layout.tsx                   # Root layout
│   ├── layout-shell.tsx             # Shell layout variant
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Global styles
│
├── 📂 components/                   # Reusable React Components
│   ├── auth/                        # Authentication components
│   ├── items/                       # Items/Products components
│   ├── layout/                      # Layout components (header, sidebar, etc)
│   ├── orders/                      # Orders components
│   ├── students/                    # Students components
│   └── ui/                          # Base UI components (shadcn/ui)
│
├── 📂 lib/                          # Utility Functions & Helpers
│   ├── api.ts                       # API client setup (Axios)
│   ├── auth.ts                      # Authentication utilities
│   └── utils.ts                     # General utilities
│
├── 📂 types/                        # TypeScript Type Definitions
│   └── index.ts                     # Global type definitions
│
├── 📂 public/                       # Static Assets
│   └── (SVGs, images, favicon)
│
├── 📄 next.config.ts                # Next.js configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 postcss.config.mjs            # PostCSS configuration
├── 📄 eslint.config.mjs             # ESLint configuration
├── 📄 components.json               # shadcn/ui components registry
├── 📄 package.json                  # Dependencies & scripts
└── 📄 .env.local                    # Environment variables

```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ or higher
- **npm** or **yarn** package manager
- **Git** (optional)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file and add your configuration
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build optimized production bundle
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint to check code quality
```

---

## 🎨 Components & Modules

### 🔑 Authentication Module (`components/auth/`)
- Login form with validation
- Registration form with password strength
- Profile management

### 🛍️ Items Module (`components/items/`)
- Item listing and filtering
- Item detail views
- Shopping cart management

### 📦 Orders Module (`components/orders/`)
- Order creation and checkout
- Order history and tracking
- Order details view

### 👥 User Management (`components/students/`, `users/`)
- User profiles
- Student management
- User listings and search

### 🎭 Layout Components (`components/layout/`)
- Responsive navigation bar
- Sidebar navigation
- Footer
- Theme switcher

### 🧩 UI Components (`components/ui/`)
- Buttons, inputs, forms
- Cards and containers
- Modals and dialogs
- All shadcn/ui components

---

## 🔌 API Integration

### API Client Setup
The project uses **Axios** for HTTP requests with base configuration in `lib/api.ts`:

```typescript
// Remote image patterns supported:
- http://localhost:7000/api/v1/students/**  (Local backend)
- https://images.unsplash.com                 (Unsplash CDN)
```

### Making API Calls
```typescript
import { apiClient } from '@/lib/api';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', { data });
```

---

## 🎯 Key Features by Page

| Page | Purpose | Features |
|------|---------|----------|
| **Home** | Landing page | Overview, featured items |
| **Auth** | User authentication | Login, register, password reset |
| **Dashboard** | User hub | Quick access to features |
| **Shop** | Browse products | Filtering, search, product details |
| **Items** | Manage items | Add, edit, delete items |
| **Orders** | Order management | View, create, track orders |
| **My Orders** | User orders | Personal order history |
| **Profile** | User settings | Edit profile, preferences |
| **Students** | Student management | View, manage student records |
| **Users** | Admin tools | User management interface |

---

## 📚 Documentation

For comprehensive documentation, API guides, and deployment instructions:

### 📖 [Complete Project Documentation](https://drive.google.com/file/d/1RuOpxkEKuJweRB5LFFy0laZoS_pCULow/view?usp=drive_link)

This includes:
- Detailed API endpoints
- Database schema
- Deployment guide
- Troubleshooting
- Best practices

---

## 🔧 Configuration

### Theme Configuration
Customize themes in `components/layout/` using next-themes.

### Tailwind Customization
Modify `tailwind.config.ts` for custom colors, fonts, and spacing.

### TypeScript Paths
Path aliases are configured in `tsconfig.json`:
```json
"@/*": ["./*"]  // Import files using @/path syntax
```

---

## 📊 Performance Optimizations

- ⚡ **Next.js Image Optimization** - Automatic image optimization
- 🎯 **Code Splitting** - Automatic route-based code splitting
- 🔄 **Incremental Static Regeneration** - Cache management
- 📦 **Bundle Analysis** - Optimized dependencies

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

### Dependencies issue?
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors?
```bash
npm run lint
npm run build
```

---

## 📄 License

This project is part of the Sellora platform and is proprietary.

---
</div>


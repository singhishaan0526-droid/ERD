# ER Diagram Maker (Academic Chen Notation)

[![Live Demo](https://img.shields.io/badge/Live_Demo-erd--beige.vercel.app-2E7D32?style=for-the-badge&logo=vercel)](https://erd-beige.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Theme](https://img.shields.io/badge/Theme-Emerald_Grass_Green-4CAF50?style=for-the-badge)](#features)
[![Mobile Ready](https://img.shields.io/badge/Mobile-Optimized-0284c7?style=for-the-badge)](#mobile-first--touch-optimized)

A modern, lightning-fast Entity-Relationship (ER) diagram designer built for computer science students, database instructors, software engineers, and system architects. Model relational database schemas using canonical **Peter Chen (1976) notation**, auto-generate diagrams from plain English descriptions, reverse engineer SQL DDL into visual schemas, and export printable A4 PDF assignments in 1 click.

**Website:** [https://erd-beige.vercel.app/](https://erd-beige.vercel.app/)

---

## Key Features

### 1. Full Academic Chen Notation
- **Regular Entity**: Solid single rectangle.
- **Weak Entity**: Concentric double rectangle.
- **Primary Key (PK)**: Solid underline attribute.
- **Partial Key (Discriminator)**: Dashed underline attribute.
- **Normal Attribute**: Single oval / ellipse.
- **Multivalued Attribute**: Concentric double oval.
- **Derived Attribute**: Dashed oval.
- **Relationship**: Diamond with explicit cardinality labels (`1:1`, `1:N`, `M:N`).
- **Identifying Relationship**: Concentric double diamond connecting weak entities to owner entities.

### 2. Bidirectional SQL Engine
- **SQL DDL to ERD**: Paste `CREATE TABLE` scripts for PostgreSQL, MySQL, SQLite, or Oracle. Automatically reverse-engineers tables to entities, primary keys, and foreign-key constraints into relationship diamonds.
- **ERD to SQL DDL**: 1-click generation of normalized SQL DDL scripts with primary keys, foreign keys, and referential actions.

### 3. Multi-Format High-Resolution Export
- **Printable A4 PDF**: 1-click vector-sharp PDF export (A4 Landscape) complete with diagram title, generation timestamp, and attribution—ready for college lab submissions.
- **PNG**: Crisp 2x Retina PNG with transparent or solid background.
- **SVG**: Infinite-resolution scalable vector graphic.

### 4. Natural Language ERD Generator
- Describe database requirements in plain English (e.g., *"Design an airline flight reservation system with passengers, flights, tickets, aircraft, airports, and pilots"*).
- Generates entities, attributes, relationships, and cardinalities automatically.

### 5. Pre-Built DBMS Exam & Industry Templates
Explore 6 comprehensive database models aligned with ABET, GATE, and university computer science curricula:
1. **Banking & ATM System** (Customer, Account, Transaction, ATM Card, Branch, ATM Terminal).
2. **Airline Flight Reservation** (Passenger, Flight, Ticket, Aircraft, Airport, Pilot).
3. **E-Commerce Store** (Customer, Order, OrderItem, Product, Category, Payment).
4. **University System** (Department, Course, Section, Student, Instructor, Enrollment).
5. **Hospital Management** (Doctor, Patient, Appointment, Prescription, Room).
6. **Library Management** (Book, Author, Member, Loan, Publisher, Fine).

### 6. Cloud Sync with Neon PostgreSQL & Clerk Auth
- Zero-friction guest mode: Use immediately with zero sign-up or credit card.
- Optional Google / Clerk authentication to persist diagrams to Neon serverless PostgreSQL.

### 7. Mobile-First & Touch-Optimized
- 60 FPS hardware-accelerated pan and drag loop via `requestAnimationFrame`.
- Multi-touch pinch-to-zoom and floating zoom controls (`+`, `-`, `Reset 100%`, `Fit to View`).
- Touch-friendly 44x44px hitboxes on mobile devices.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Pure CSS variables, Lucide React |
| **Backend API** | Vercel Serverless Functions, Express, Rate Limiting |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) |
| **Authentication** | Clerk Authentication & Google OAuth (HttpOnly secure session cookies) |
| **Graphics** | SVG / Canvas with native single-page PDF generator |

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/singhishaan0526-droid/ERD.git
cd ERD

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Optional: Neon Serverless PostgreSQL
DATABASE_URL=postgresql://user:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require

# Optional: Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Running Locally

```bash
# Start Vite development server
npm run dev

# Or build for production
npm run build
npm start
```

Open `http://localhost:5173` or `http://localhost:3000` in your browser.

---

## SEO & Accessibility

- **Standard HTML5**: Semantic landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`).
- **Schema.org Structured Data**: Validated `@graph` with `WebApplication`, `BreadcrumbList`, `Organization`, `WebSite`, and `FAQPage`.
- **Crawlers**: 3-tier `robots.txt` explicitly welcoming search engines and LLM answer engines (`OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, `ChatGPT-User`).
- **LLM Context**: Public [`/llms.txt`](https://erd-beige.vercel.app/llms.txt) and [`/llms-full.txt`](https://erd-beige.vercel.app/llms-full.txt) documentation endpoints.

---

## License

This project is licensed under the [MIT License](LICENSE).

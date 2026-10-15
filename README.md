# ER Diagram Maker (Chen Notation)

A fast, interactive Entity-Relationship (ER) diagram builder designed mobile-first for DBMS students, teachers, and software developers. Auto-generate complete database models from plain-English descriptions using Anthropic Claude or build them by hand on a high-performance SVG canvas.

![Color Theme](https://img.shields.io/badge/Theme-Grass_Green_%26_White-4CAF50)
![Notation](https://img.shields.io/badge/Notation-Chen_DBMS-2E7D32)
![Mobile](https://img.shields.io/badge/Mobile-First-blue)

---

## Features

- **Full Academic DBMS Chen Notation**:
  - **Regular Entity**: Rectangle
  - **Weak Entity**: Double Rectangle (concentric)
  - **Primary Key**: Solid Underline
  - **Partial Key (Discriminator)**: Dashed Underline
  - **Multivalued Attribute**: Double Oval (concentric)
  - **Derived Attribute**: Dashed Oval
  - **Regular Relationship**: Diamond with Cardinality (`1:1`, `1:N`, `M:N`)
  - **Identifying Relationship**: Double Diamond (concentric)
- **Auto-Generate with Claude & Built-in DBMS Engine**:
  - Describe your database in plain English (e.g. *"A hospital with patients, doctors, appointments, and prescriptions"*).
  - Powered by Anthropic Claude API (`ANTHROPIC_API_KEY`) with an offline DBMS NLP rule fallback.
- **Mobile-First & Touch-Optimized**:
  - Full-screen canvas on phones with zero horizontal scroll from 320px up.
  - Sticky bottom toolbar and slide-up bottom edit sheet.
  - One-finger shape drag & canvas pan at 60 FPS (`requestAnimationFrame`).
  - Two-finger pinch-to-zoom and floating zoom controls.
  - Tap / double-tap to edit directly on canvas.
  - Long-press haptic quick-action menu (Duplicate / Delete / Edit).
  - All touch targets $\ge 44 \times 44\text{px}$.
  - Base font size 16px on inputs to prevent iOS browser auto-zoom.
- **1-Click High-Res Export**:
  - **PNG** (crisp high-DPI retina with pure `#FFFFFF` background).
  - **SVG** (scalable vector graphics).
  - Mobile fallback modal with "Long-press to save to Photos" and native Web Share integration.
- **No Login / No Account**:
  - Starts completely empty on first load (no fake or demo data).
  - 100% private: diagrams live in the browser session.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Pure Vanilla CSS
- **Backend**: Express, Anthropic Claude Messages API, Rate Limiting
- **Graphics**: Interactive SVG with requestAnimationFrame 60fps drag loop

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/singhishaan0526-droid/ERD.git
cd ERD
```

### 2. Install dependencies
```bash
npm install
```

### 3. (Optional) Configure API Key
Create a `.env` file in the root directory:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3000
```
*(Note: If no API key is provided, the app seamlessly runs using its built-in enterprise DBMS knowledge engine).*

### 4. Run the application
```bash
# Start production server (API + Web on port 3000)
npm run build
npm start

# Or start Vite development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser or phone.

---

## License
MIT License.

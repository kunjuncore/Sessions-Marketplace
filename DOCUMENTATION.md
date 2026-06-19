# Sessions Marketplace — Full Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Requirements Checklist](#2-requirements-checklist)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Project Structure](#5-project-structure)
6. [Setup & Installation](#6-setup--installation)
7. [Environment Variables](#7-environment-variables)
8. [Google OAuth Setup](#8-google-oauth-setup)
9. [Running the Application](#9-running-the-application)
10. [API Reference](#10-api-reference)
11. [Frontend Routes](#11-frontend-routes)
12. [Demo Flow](#12-demo-flow)
13. [Testing](#13-testing)
14. [CI/CD Pipeline](#14-cicd-pipeline)
15. [Design Decisions](#15-design-decisions)
16. [Troubleshooting](#16-troubleshooting)
17. [Deliverables Summary](#17-deliverables-summary)

---

## 1. Project Overview

Sessions Marketplace is a full-stack web application where users can:

- Sign in via **Google OAuth**
- **Browse** a public catalog of expert-led sessions
- **Book** sessions with creators
- **Manage** their bookings from a personal dashboard
- **Create and manage** sessions (if they upgrade to the Creator role)
- **Track statistics** and booking activity from a Creator dashboard

Built for the **Ocean Across Full-Stack Developer Assignment**.

---

## 2. Requirements Checklist

### Mandatory Requirements

| # | Requirement | Status | Implementation |
|---|---|---|---|
| 1 | Frontend: React or Next.js | ✅ | Next.js 15 (App Router) |
| 2 | Backend: Django + DRF | ✅ | Django 5 + Django REST Framework |
| 3 | Database: PostgreSQL | ✅ | PostgreSQL 16 |
| 4 | Docker multi-container | ✅ | frontend, backend, db, nginx |
| 5 | OAuth login (Google) | ✅ | Google OAuth with ID token verification |
| 6 | JWT tokens issued by backend | ✅ | SimpleJWT access + refresh tokens |
| 7 | Two roles: User + Creator | ✅ | Role-based permissions on all endpoints |
| 8 | Profile: view/update details | ✅ | `GET/PATCH /api/auth/me/` |
| 9 | Public session catalog | ✅ | Paginated, searchable, filterable, sortable |
| 10 | Session detail + Book Now | ✅ | Detail page with booking panel |
| 11 | Booking flow | ✅ | Duplicate + self-booking protection |
| 12 | User views bookings | ✅ | Dashboard with upcoming + recent |
| 13 | Creator manages sessions | ✅ | CRUD via UI + API |
| 14 | User Dashboard | ✅ | Stats, upcoming/recent bookings |
| 15 | Creator Dashboard | ✅ | Sessions, bookings, revenue stats |
| 16 | Pages: Home / Catalog | ✅ | Landing page + `/catalog` |
| 17 | Pages: Session Detail | ✅ | `/session/[id]` |
| 18 | Pages: Auth Flow | ✅ | `/login` with Google OAuth |
| 19 | Pages: User Dashboard | ✅ | `/dashboard` |
| 20 | Pages: Creator Dashboard | ✅ | `/creator` |
| 21 | Docker: one command start | ✅ | `docker compose up --build` |
| 22 | `.env.example` with all vars | ✅ | Documented with descriptions |
| 23 | Nginx reverse proxy | ✅ | Routes on 80 (HTTP) + 443 (HTTPS) |
| 24 | README with setup steps | ✅ | Complete setup, OAuth, demo flow |

### Bonus Features (Not Implemented)

| Feature | Reason |
|---|---|
| Payment Gateway (Stripe/Razorpay) | Not required for core assignment |
| MinIO / S3 Uploads | Local media storage via Django + Nginx |
| Rate Limiting | Not configured; add via `django-ratelimit` if needed |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v3.4 |
| **State** | React Context (auth) + custom hooks |
| **Forms** | React Hook Form + Zod validation |
| **HTTP** | Axios with JWT interceptor |
| **Backend** | Django 5, Django REST Framework, SimpleJWT |
| **Filters** | django-filter (search, filter, ordering) |
| **Auth** | Google OAuth ID token verification via `google-auth` |
| **Database** | PostgreSQL 16 |
| **Runtime** | Gunicorn (backend), Next.js standalone (frontend) |
| **Proxy** | Nginx 1.25 (HTTP/HTTPS, reverse proxy, static/media serving) |
| **Container** | Docker Compose (4 services, 3 named volumes) |
| **Testing** | Django TestCase (backend), Jest + Testing Library (frontend) |
| **CI/CD** | GitHub Actions (3 job pipeline) |

---

## 4. Architecture

```
                          ┌─────────────┐
                          │   Browser   │
                          └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │   Nginx     │  :80 (HTTP → HTTPS redirect)
                          │   :443      │  :443 (HTTPS)
                          └──┬───────┬──┘
                             │       │
                    ┌────────▼─┐  ┌──▼──────────┐
                    │ Frontend │  │   Backend    │
                    │ Next.js  │  │ Django/Gunic │
                    │ :3000    │  │ :8000        │
                    └──────────┘  └──┬──────┬────┘
                                     │      │
                            ┌────────▼─┐ ┌──▼──────────┐
                            │PostgreSQL│ │Static/Media │
                            │ :5432    │ │ Volumes     │
                            └──────────┘ └─────────────┘

  Auth flow:
  Browser → Google OAuth → ID token → POST /api/auth/google/ → JWT pair
  Frontend stores JWT → Axios sends Authorization: Bearer <token>
  Backend validates JWT → returns protected resources
```

### Container Networking

All services share a single bridge network `app_network`:

| Service | Internal Address | Exposed Port |
|---|---|---|
| Nginx | `nginx` | `:80` → `:80`, `:443` → `:443` |
| Frontend | `frontend:3000` | Not exposed |
| Backend | `backend:8000` | Not exposed |
| Database | `db:5432` | Not exposed |

### Named Volumes

| Volume | Mount | Purpose |
|---|---|---|
| `postgres_data` | `/var/lib/postgresql/data` | Persist database across restarts |
| `media_volume` | `/app/media` | User-uploaded session images |
| `static_volume` | `/app/static` | Collected Django static files |

---

## 5. Project Structure

```
sessions-marketplace/
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline
├── backend/
│   ├── apps/
│   │   ├── bookings/               # Booking model + endpoints
│   │   ├── dashboard/              # User + Creator dashboards
│   │   ├── sessions_app/           # Session CRUD + catalog
│   │   └── users/                  # User model, auth, roles
│   ├── config/                     # Django settings
│   ├── Dockerfile                  # Multi-stage Python build
│   ├── entrypoint.sh               # migrate, collectstatic, gunicorn
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── __tests__/              # Jest tests
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── catalog/            # Browse sessions
│   │   │   ├── creator/            # Creator dashboard
│   │   │   ├── dashboard/          # User dashboard
│   │   │   ├── login/              # Google OAuth login
│   │   │   └── session/[id]/       # Session detail
│   │   ├── components/
│   │   │   ├── auth/               # ProtectedRoute
│   │   │   ├── bookings/           # BookingCard
│   │   │   ├── layout/             # Navbar, Sidebar
│   │   │   ├── sessions/           # SessionCard, Filters, Form
│   │   │   └── ui/                 # Button, Badge, Modal, etc.
│   │   ├── context/AuthContext.tsx  # Auth state management
│   │   ├── hooks/                  # Data fetching hooks
│   │   ├── lib/                    # Axios, errors, toast
│   │   ├── services/               # API service layer
│   │   └── types/                  # TypeScript interfaces
│   ├── Dockerfile
│   ├── jest.config.ts
│   ├── next.config.ts
│   ├── package.json
│   └── tailwind.config.ts
├── nginx/
│   ├── nginx.conf                  # HTTP→HTTPS redirect + reverse proxy
│   └── ssl/                        # Self-signed certs (gitignored)
├── docker-compose.yml
├── .env.example
├── .env                            # Local config (gitignored)
├── .gitignore
├── README.md
└── DOCUMENTATION.md                # This file
```

---

## 6. Setup & Installation

### Prerequisites

- **Docker Desktop** (Windows) or **Docker Engine** + **Docker Compose** (Linux/macOS)
- **Git**
- A **Google Cloud Console** account (for OAuth Client ID)

### Quick Start

```powershell
# 1. Clone the repository
git clone https://github.com/kunjuncore/Sessions-Marketplace.git
cd Sessions-Marketplace

# 2. Create environment file from template
Copy-Item .env.example .env

# 3. Edit .env with your values (see §7)
#    At minimum: SECRET_KEY, POSTGRES_PASSWORD, GOOGLE_CLIENT_ID

# 4. Build and start all services
docker compose up --build

# 5. Open the application
#    https://localhost
#    (accept self-signed certificate warning)
```

### Manual Local Development (Without Docker)

#### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Ensure PostgreSQL is running and .env is configured
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

#### Frontend

```powershell
cd frontend
# Create .env.local with:
#   NEXT_PUBLIC_API_URL=http://localhost:8000/api
#   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
npm install
npm run dev
```

---

## 7. Environment Variables

Create `.env` from `.env.example` and fill all values:

| Variable | Service | Required | Default | Description |
|---|---|---|---|---|
| `SECRET_KEY` | Backend | **Yes** | — | Django secret key. Generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | Backend | Yes | `False` | Set `True` for development only |
| `ALLOWED_HOSTS` | Backend | Yes | `localhost,127.0.0.1` | Comma-separated hostnames Django serves |
| `CORS_ALLOWED_ORIGINS` | Backend | Yes | `https://localhost,http://localhost,http://127.0.0.1` | Browser origins allowed by CORS |
| `GUNICORN_WORKERS` | Backend | No | `3` | Gunicorn worker processes |
| `POSTGRES_DB` | Database | Yes | `sessions_db` | PostgreSQL database name |
| `POSTGRES_USER` | Database | Yes | `sessions_user` | PostgreSQL username |
| `POSTGRES_PASSWORD` | Database | **Yes** | — | PostgreSQL password (generate a strong one) |
| `POSTGRES_HOST` | Backend | Yes | `db` | Database hostname (Docker service name) |
| `POSTGRES_PORT` | Backend | Yes | `5432` | Database port |
| `GOOGLE_CLIENT_ID` | Backend | **Yes** | — | Google OAuth web client ID for token verification |
| `NEXT_PUBLIC_API_URL` | Frontend | **Yes** | `https://localhost/api` | Public API base URL (baked at build time) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Frontend | **Yes** | — | Google OAuth web client ID for frontend login |
| `NGINX_PORT` | Nginx | No | `80` | Host port mapped to Nginx HTTP |
| `NGINX_HTTPS_PORT` | Nginx | No | `443` | Host port mapped to Nginx HTTPS |

> **Important:** `NEXT_PUBLIC_*` values are embedded in the frontend JavaScript bundle at build time. After changing them, rebuild the image: `docker compose build frontend && docker compose up -d`

---

## 8. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth Client ID**
5. Application type: **Web application**
6. Add **Authorized JavaScript origins**:
   ```
   https://localhost
   http://localhost
   http://localhost:3000     (for local dev without Docker)
   ```
7. Add **Authorized redirect URIs** (if your config requires them):
   ```
   https://localhost
   http://localhost
   ```
8. Copy the **Client ID** and paste into both `.env` variables:
   - `GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com`
9. (Optional) Configure OAuth consent screen with your app name and logo

---

## 9. Running the Application

### Start Everything

```powershell
docker compose up --build    # First time or after code changes
docker compose up -d         # Subsequent runs (detached mode)
```

### Check Status

```powershell
docker compose ps
```

Expected output — all 4 services **healthy**:

```
NAME                      SERVICE    STATUS
sessions-marketplace-db-1         db         Up (healthy)
sessions-marketplace-backend-1    backend    Up (healthy)
sessions-marketplace-frontend-1   frontend   Up (healthy)
sessions-marketplace-nginx-1      nginx      Up (healthy)
```

### View Logs

```powershell
docker compose logs -f backend     # Django logs
docker compose logs -f frontend    # Next.js logs
docker compose logs -f nginx       # Nginx access/error logs
```

### Stop Everything

```powershell
docker compose down                # Stop and remove containers
docker compose down -v             # Stop and remove volumes (WARNING: destroys data)
```

### Useful Commands

```powershell
# Run backend management commands
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test

# Access database shell
docker compose exec db psql -U sessions_user -d sessions_db

# Access frontend container shell
docker compose exec frontend sh
```

---

## 10. API Reference

Authentication header for protected endpoints:

```
Authorization: Bearer <access_token>
```

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/google/` | Public | Exchange Google ID token for JWT tokens |
| `POST` | `/api/auth/token/refresh/` | Public | Refresh an expired access token |
| `POST` | `/api/auth/logout/` | User | Blacklist a refresh token |
| `GET` | `/api/auth/me/` | User | Get current user profile |
| `PATCH` | `/api/auth/me/` | User | Update name / avatar |
| `PATCH` | `/api/auth/role/` | User | Upgrade own role to `CREATOR` |

**Google Login Request:**
```json
{ "token": "google-id-token" }
```

**Google Login Response:**
```json
{
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "https://...",
    "role": "USER",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

### Session Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/sessions/` | Public | List sessions (paginated) |
| `GET` | `/api/sessions/{id}/` | Public | Session detail (includes `is_booked` for auth users) |
| `POST` | `/api/sessions/` | Creator | Create a session |
| `PUT` | `/api/sessions/{id}/` | Owner | Replace a session |
| `PATCH` | `/api/sessions/{id}/` | Owner | Update a session |
| `DELETE` | `/api/sessions/{id}/` | Owner | Delete a session |
| `GET` | `/api/sessions/my/` | Creator | List own sessions |
| `GET` | `/api/sessions/stats/` | Creator | Session / booking statistics |
| `DELETE` | `/api/sessions/{id}/image/` | Owner | Remove session image |

**Query Parameters (list endpoint):**

| Param | Type | Example |
|---|---|---|
| `search` | string | `search=django` |
| `ordering` | string | `price`, `-created_at`, `duration` |
| `min_price` | decimal | `min_price=10` |
| `max_price` | decimal | `max_price=100` |
| `min_duration` | int | `min_duration=30` |
| `max_duration` | int | `max_duration=120` |
| `creator` | uuid | `creator=<creator_uuid>` |
| `page` | int | `page=1` |
| `page_size` | int | `page_size=12` |

### Booking Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bookings/` | User | Book a session (`{"session": "uuid"}`) |
| `GET` | `/api/bookings/my/` | User | List own bookings |
| `GET` | `/api/bookings/{id}/` | Owner/Creator | Booking detail |
| `PATCH` | `/api/bookings/{id}/cancel/` | Owner | Cancel a pending booking |
| `GET` | `/api/bookings/creator/` | Creator | List bookings for own sessions |
| `GET` | `/api/bookings/creator/stats/` | Creator | Booking counts by status |
| `PATCH` | `/api/bookings/{id}/status/` | Session creator | Confirm or cancel a booking |

### Dashboard Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/user/` | User | Profile, stats, upcoming + recent bookings |
| `GET` | `/api/dashboard/creator/` | Creator | Profile, stats, sessions, recent bookings, top sessions |

---

## 11. Frontend Routes

| Route | Page | Description | Auth |
|---|---|---|---|
| `/` | Landing | Marketing hero, features, stats, CTA | Public |
| `/catalog` | Browse | Filterable, searchable session grid | Public |
| `/session/[id]` | Detail | Session info, booking panel | Public (auth for book) |
| `/login` | Login | Google OAuth sign-in button | Public |
| `/dashboard` | User Dashboard | Stats, upcoming/recent bookings, upgrade to Creator | User |
| `/creator` | Creator Dashboard | Tabs: overview, sessions CRUD, bookings management | Creator |

---

## 12. Demo Flow

A complete walkthrough of the application:

### 1. Browse the Catalog (No Login Required)

1. Open `https://localhost`
2. Click **Browse Sessions** or navigate to `/catalog`
3. Use the sidebar filters: search by title/creator, filter by price/duration
4. Sort results by newest, oldest, price, or duration
5. Click **Apply** to filter, **Clear** to reset

### 2. View Session Details

1. Click any session card to view detail (`/session/[id]`)
2. See session description, creator info, duration, price
3. See booking count and status
4. See **"Sign In to Book"** prompt (if not logged in)

### 3. Sign In with Google

1. Click **Sign In** in the navbar or **"Sign In to Book"**
2. Navigate to `/login`
3. Click the **Google Sign-In** button
4. Authorize with your Google account
5. You are redirected to your dashboard (User dashboard by default)

### 4. User Dashboard

1. See welcome message with your name and email
2. View stats cards: Total Bookings, Pending, Confirmed, Cancelled
3. **Upcoming Sessions** section (empty initially)
4. **Recent Bookings** section (empty initially)
5. Click **"Become a Creator"** button to upgrade your role

### 5. Upgrade to Creator

1. Click **"Become a Creator"** on the User Dashboard
2. Confirm the upgrade
3. You are redirected to `/creator`
4. The navbar now shows **"Creator Studio"**

### 6. Creator Dashboard

1. **Overview tab:** Stats (total sessions, bookings, revenue, pending/confirmed/cancelled)
2. **Top Sessions:** Your most-booked sessions
3. **Recent Bookings:** Latest bookings on your sessions
4. **Sessions tab:** List of your sessions with Edit/Delete actions
5. **Bookings tab:** All bookings with Confirm/Cancel actions

### 7. Create a Session

1. In Creator Dashboard, click **"+ New Session"** button
2. Fill in: Title, Description, Price, Duration, (optional) Image
3. Click submit
4. The session appears in your sessions list and the public catalog

### 8. Book a Session (with a second Google account)

1. Sign out and sign in with a different Google account
2. Browse the catalog and find the session you created
3. Open the session detail page
4. Click **"Book Now — $XX.XX"**
5. View the booking in your dashboard (`/dashboard`)
6. The booking starts as **Pending**

### 9. Complete the Booking (as Creator)

1. Sign back into the Creator account
2. Go to Creator Dashboard → **Bookings** tab
3. Find the pending booking
4. Click **Confirm** to accept or **Cancel** to reject
5. The status changes immediately

### 10. User Dashboard (After Booking)

1. Sign back into the User account
2. Dashboard shows updated stats
3. **Upcoming Sessions** shows confirmed bookings
4. **Recent Bookings** shows all bookings with status badges
5. Pending bookings can be cancelled with the **Cancel** button

---

## 13. Testing

### Backend Tests (116 tests)

```powershell
# Run all tests
docker compose exec backend python manage.py test

# Run specific test suites
docker compose exec backend python manage.py test apps.users
docker compose exec backend python manage.py test apps.sessions_app
docker compose exec backend python manage.py test apps.bookings
docker compose exec backend python manage.py test apps.dashboard

# Run with verbose output
docker compose exec backend python manage.py test --verbosity=2
```

**Test Coverage:**

| App | Tests | Focus |
|---|---|---|
| `users` | 14 | Auth, OAuth, roles, token refresh, profile |
| `sessions_app` | 69 | CRUD, permissions, filters, ordering, pagination, images, stats |
| `bookings` | 19 | Booking creation, duplicates, self-booking, cancellation, status updates |
| `dashboard` | 14 | User dashboard, Creator dashboard, stats |

### Frontend Tests (3 tests)

```powershell
cd frontend
npm test -- --watchAll=false
```

Covers the `StatCard` UI component (rendering, subtitles, accent colors).

### Lint & Build Check

```powershell
cd frontend
npm run build        # TypeScript + Next.js build
npm run lint         # ESLint
```

---

## 14. CI/CD Pipeline

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) with 3 jobs:

### Job 1: Backend Tests

- Runs on `ubuntu-latest`
- Sets up PostgreSQL service container
- Installs Python dependencies
- Runs `python manage.py test` (all 116 tests)

### Job 2: Frontend Lint & Test

- Runs on `ubuntu-latest`
- Sets up Node.js
- Installs npm dependencies
- Runs `npm run lint` and `npm test`

### Job 3: Docker Build

- Runs on `ubuntu-latest`
- Builds both `backend` and `frontend` Docker images
- Verifies the Dockerfiles compile without errors

The pipeline triggers on every push to `main` and on pull requests.

---

## 15. Design Decisions

### Why Next.js App Router?

- Server components for landing page (no JavaScript needed)
- Client components for interactive pages (dashboard, catalog)
- Built-in image optimization, font loading, and bundling

### Why Nginx Instead of Exposing Services Directly?

- Single entry point (`:80` / `:443`) for the browser
- HTTP → HTTPS redirect handled at the proxy level
- Static/media file serving offloaded from Django
- Clean separation of concerns

### Why Google OAuth Only?

- The assignment requires OAuth; Google provides the simplest integration
- GitHub OAuth can be added by implementing a similar `GitHubAuthView`
- The auth system is extensible — add providers in `apps/users/views.py`

### Why Self-Signed Certs for Local Development?

- HTTPS is required for OAuth redirects in some browsers
- Self-signed certs are generated locally and gitignored
- In production, replace with Let's Encrypt (Certbot) certificates

### Design Philosophy (Frontend Redesign)

The UI was redesigned for a **minimal, clean, modern** look:

| Before | After |
|---|---|
| Heavy blue/indigo gradients | Clean white background with blue accent |
| Glassmorphism (`backdrop-blur`) | Flat, subtle borders |
| Colorful gradient thumbnails | Gray placeholder with SVG icon |
| Emoji icons (⚠️, 📊, 🔍) | Simple SVG icons |
| Blue buttons | Dark (`bg-gray-900`) buttons |
| Heavy shadows (`shadow-xl`) | No shadows, clean borders |
| Busy gradient feature cards | Minimal numbered feature cards |
| Emoji in nav/sidebar | Text-only navigation |

---

## 16. Troubleshooting

### Docker Desktop fails to start

```powershell
# Free disk space
Remove-Item -Recurse -Force "$env:TEMP\*"
docker system prune -f

# Restart Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
# Wait 60+ seconds for it to initialize
```

### Frontend calls wrong API URL

`NEXT_PUBLIC_API_URL` is baked at build time:

```powershell
docker compose build frontend
docker compose up -d
```

### Google login fails

Check:
- `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` match exactly
- `https://localhost` is in the OAuth client's Authorized JavaScript origins
- The backend container can reach `https://oauth2.googleapis.com` (outbound internet)

### CORS errors in browser console

Ensure `CORS_ALLOWED_ORIGINS` in `.env` includes your browser origin:

```
CORS_ALLOWED_ORIGINS=https://localhost,http://localhost,http://127.0.0.1
```

Then restart the backend:

```powershell
docker compose restart backend
```

### Django returns DisallowedHost

Add your hostname to `ALLOWED_HOSTS`:

```
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
```

### Nginx health check fails

The health check uses HTTPS on `127.0.0.1`. If it fails, check:

```powershell
docker compose exec nginx wget -qO- --no-check-certificate https://127.0.0.1/healthz
```

Should return `ok`.

### Port conflicts

If `:80` or `:443` are already in use, change the ports in `.env`:

```
NGINX_PORT=8080
NGINX_HTTPS_PORT=8443
```

Then access the app at `https://localhost:8443`.

---

## 17. Deliverables Summary

| Deliverable | Location | Description |
|---|---|---|
| **GitHub Repository** | `https://github.com/kunjuncore/Sessions-Marketplace` | Full source code with commit history |
| **Docker Setup** | `docker-compose.yml` | One-command startup with 4 containers |
| **.env.example** | Root directory | All required env vars documented |
| **README** | `README.md` | Setup, OAuth, API, demo flow |
| **Documentation** | `DOCUMENTATION.md` | This file — complete reference |
| **Backend Tests** | Run `python manage.py test` | 116 tests, all passing |
| **Frontend Tests** | Run `npm test` | 3 tests, all passing |
| **CI/CD** | `.github/workflows/ci.yml` | 3-job pipeline (backend, frontend, docker) |
| **HTTPS Support** | `nginx/nginx.conf` + self-signed certs | HTTP → HTTPS redirect |
| **Design** | All frontend components | Minimal, clean, modern UI |

---

*Document generated for the Ocean Across Full-Stack Developer Assignment.*
*June 2026*

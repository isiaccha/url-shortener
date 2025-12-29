# URL Shortener with Analytics

A full-stack URL shortener application with comprehensive analytics, built with FastAPI (Python) and React (TypeScript). Features OAuth authentication, detailed click tracking, geographic analytics, and a modern dashboard interface.

## 🚀 Features

### Core Functionality
- **URL Shortening**: Create short, memorable links from long URLs
- **Link Management**: Activate/deactivate links, view all your links in one place
- **OAuth Authentication**: Secure login with Google OAuth 2.0
- **Session Management**: Secure session-based authentication with configurable expiration

### Analytics & Tracking
- **Click Tracking**: Record every click with detailed metadata
- **Geographic Analytics**: Track clicks by country with interactive world map visualization
- **Device Analytics**: Track device type (mobile, tablet, desktop, bot), browser, OS, and rendering engine
- **Referrer Tracking**: See where your traffic is coming from
- **Unique Visitors**: Track unique visitors using hashed IP + user agent
- **Time-Series Data**: Sparkline charts showing click trends over time
- **Period Comparison**: Compare current period metrics with previous period

### Dashboard Features
- **KPI Cards**: Total clicks, total links, unique visitors with trend indicators
- **Interactive World Map**: Visualize geographic distribution of clicks
- **Links Table**: Manage all your links with status, click counts, and visitor metrics
- **Date Range Selection**: Filter analytics by custom date ranges (1 day, 7 days, 30 days, custom)
- **Link Statistics**: Detailed per-link analytics with recent click events

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations
- **PostgreSQL/SQLite**: Database (PostgreSQL for production, SQLite for local dev)
- **Authlib**: OAuth 2.0 client library
- **user-agents**: User agent parsing library
- **httpx**: HTTP client for GeoIP lookups
- **Pydantic**: Data validation and settings management

### Frontend
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **react-simple-maps**: World map visualization
- **date-fns**: Date manipulation
- **react-hook-form + Zod**: Form handling and validation

## 📁 Project Structure

```
url-shortener/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication routes and dependencies
│   │   │   ├── router.py      # OAuth login, callback, logout, /me
│   │   │   └── dependencies.py # get_current_user dependency
│   │   ├── core/              # Core configuration
│   │   │   ├── config.py      # Settings management (Pydantic)
│   │   │   └── oauth.py       # OAuth client setup
│   │   ├── db/                # Database configuration
│   │   │   └── session.py     # SQLAlchemy session and Base
│   │   ├── links/             # Link management and analytics
│   │   │   ├── router.py      # Link CRUD endpoints, dashboard, stats
│   │   │   ├── redirect_router.py # Short URL redirect handler
│   │   │   ├── service.py     # Business logic for links and analytics
│   │   │   ├── schemas.py     # Pydantic models for API
│   │   │   ├── slug.py        # Base62 encoding with shuffling
│   │   │   ├── utils.py       # IP extraction, UA parsing, GeoIP lookup
│   │   │   └── country_names.py # Country code to name mapping
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── user.py        # User model
│   │   │   ├── oauth_account.py # OAuth account linking
│   │   │   ├── link.py        # Link model
│   │   │   └── click_event.py # Click event analytics model
│   │   └── main.py            # FastAPI app initialization
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Test suite
│   │   ├── api/               # API endpoint tests
│   │   ├── integration/       # Integration tests
│   │   └── unit/              # Unit tests
│   ├── requirements.txt       # Python dependencies
│   ├── alembic.ini            # Alembic configuration
│   └── railway.json          # Railway deployment config
│
└── frontend/
    ├── src/
    │   ├── api/               # API client functions
    │   │   ├── auth.ts        # Authentication API calls
    │   │   ├── links.ts       # Links API calls
    │   │   └── client.ts      # Axios instance with interceptors
    │   ├── components/        # React components
    │   │   ├── dashboard/     # Dashboard-specific components
    │   │   │   ├── KPICard.tsx
    │   │   │   ├── KPICardsRow.tsx
    │   │   │   ├── CountryMapCard.tsx
    │   │   │   ├── LinksTable.tsx
    │   │   │   └── DateRangeSelector.tsx
    │   │   ├── charts/        # Chart components
    │   │   │   ├── Sparkline.tsx
    │   │   │   └── WorldMap.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── UrlInput.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   └── Toast.tsx
    │   ├── contexts/          # React contexts
    │   │   ├── AuthContext.tsx # Authentication state
    │   │   ├── ThemeContext.tsx # Dark/light theme
    │   │   └── ToastContext.tsx # Toast notifications
    │   ├── pages/             # Page components
    │   │   ├── Home.tsx
    │   │   ├── Login.tsx
    │   │   ├── AuthCallback.tsx
    │   │   ├── Dashboard.tsx
    │   │   └── LinkStats.tsx
    │   ├── types/             # TypeScript type definitions
    │   ├── utils/             # Utility functions
    │   └── App.tsx            # Main app component
    ├── package.json
    └── vite.config.ts
```

## 🚦 Getting Started

### Prerequisites
- Python 3.11+ (check `backend/runtime.txt`)
- Node.js 18+ and npm
- PostgreSQL (for production) or SQLite (for local development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   # App Configuration
   APP_ENV=local
   DEBUG=true

   # Database (SQLite for local dev)
   DATABASE_URL=sqlite:///./app.db

   # OAuth (Google)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

   # Frontend URL
   FRONTEND_URL=http://localhost:5173

   # Session Secret (generate a random string)
   SESSION_SECRET_KEY=your_random_secret_key_here
   SESSION_EXPIRE_MINUTES=30
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the development server:**
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and will proxy API requests to the backend.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8000/auth/google/callback` (for local dev)
   - For production, add your production callback URL
6. Copy the Client ID and Client Secret to your `.env` file

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_ENV` | Environment (local/production) | `local` |
| `DEBUG` | Enable debug mode | `true` |
| `DATABASE_URL` | Database connection string | `sqlite:///./app.db` or `postgresql://user:pass@host/db` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:8000/auth/google/callback` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |
| `SESSION_SECRET_KEY` | Secret key for session encryption | Random string |
| `SESSION_EXPIRE_MINUTES` | Session expiration time | `30` |

### Database

The application supports both SQLite (for local development) and PostgreSQL (for production). The database URL format:
- SQLite: `sqlite:///./app.db`
- PostgreSQL: `postgresql://user:password@host:port/database`

## 📊 API Endpoints

### Authentication

- `GET /auth/google/login` - Initiate Google OAuth login
- `GET /auth/google/callback` - OAuth callback handler
- `GET /auth/me` - Get current user info (requires authentication)
- `POST /auth/logout` - Logout and clear session

### Links

- `POST /api/links` - Create a new short link
  ```json
  {
    "target_url": "https://example.com"
  }
  ```

- `GET /api/links` - List all links for authenticated user
  - Query params: `limit` (default: 10), `offset` (default: 0)

- `GET /api/links/{link_id}/stats` - Get detailed statistics for a link

- `GET /api/links/dashboard` - Get dashboard analytics data
  - Query params: `start_date` (ISO datetime), `end_date` (ISO datetime)

- `PATCH /api/links/{link_id}/status` - Update link active status
  - Query params: `is_active` (boolean)

### Redirect

- `GET /{slug}` - Redirect to target URL (public, no auth required)

## 🔐 Security Features

- **Session-based Authentication**: Secure session cookies with configurable expiration
- **CORS Protection**: Configured CORS middleware for cross-origin requests
- **IP Privacy**: IP addresses are hashed and never stored in plain text
- **Visitor Hashing**: Unique visitors tracked via SHA-256 hash of IP + User Agent
- **HTTPS-only Cookies**: In production, session cookies are HTTPS-only
- **SameSite Cookies**: Configured for cross-site cookie handling

## 🧪 Testing

Run tests from the `backend` directory:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/api/test_link_routes.py
```

## 🚢 Deployment

### Railway Deployment

The project includes a `railway.json` configuration file for Railway deployment. The deployment process:

1. Database migrations run automatically on deploy (`alembic upgrade head`)
2. Server starts with `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables for Production

Set these in your deployment platform:

- `APP_ENV=production`
- `DEBUG=false`
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Production OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Production OAuth client secret
- `GOOGLE_REDIRECT_URI` - Production callback URL
- `FRONTEND_URL` - Production frontend URL
- `SESSION_SECRET_KEY` - Strong random secret key
- `SESSION_EXPIRE_MINUTES` - Session timeout (e.g., 30)

### Frontend Deployment

Build the frontend for production:

```bash
cd frontend
npm run build
```

The `dist` folder contains the production build. Deploy this to your static hosting service (Vercel, Netlify, etc.).

## 🎨 Features in Detail

### Slug Generation

Links use a base62-encoded slug generated from the link ID with a shuffle function to make slugs non-sequential and harder to guess. The algorithm:
- Uses base62 encoding (0-9, a-z, A-Z)
- Applies a hash-based shuffle to prevent sequential slugs
- Results in short, URL-friendly slugs

### Analytics Collection

When a short link is clicked, the system collects:
- **Timestamp**: When the click occurred
- **IP Address**: Hashed for privacy (never stored in plain text)
- **User Agent**: Full user agent string and parsed components
- **Referrer**: The hostname of the referring page
- **Country**: Determined via GeoIP lookup (using ip-api.com)
- **Device Info**: Device category, browser, OS, rendering engine
- **Visitor Hash**: SHA-256 hash of IP + User Agent for unique visitor tracking

### Dashboard Analytics

The dashboard provides:
- **KPIs**: Total clicks, total links, unique visitors with period-over-period comparison
- **Sparklines**: Time-series visualization of clicks (hourly, daily, or monthly granularity)
- **Geographic Map**: Interactive world map showing click distribution by country
- **Links Table**: All links with status, click counts, unique visitors, and last clicked time
- **Date Range Filtering**: Filter analytics by custom date ranges


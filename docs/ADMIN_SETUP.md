# ListnRent Admin Panel

The admin panel is a separate application for managing the ListnRent platform. It features role-based authentication for admins and delivery partners.

## Features

- **Role-Based Authentication**: Separate login system for admins and delivery partners
- **Magic Link Authentication**: Secure email-based login without passwords
- **Protected Routes**: Admin dashboard requires authentication
- **Database Separation**: Admin users stored separately from regular users

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the admin folder using `.env.example` as a template:

```bash
cp .env.example .env.local
```

Fill in your Firebase configuration values from your Firebase project settings.

### 3. Running the Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:5174`

### 4. Build for Production

```bash
npm run build
```

## Admin Users

### Default Admin User

- **Email**: `listnrentclient@gmail.com`
- **Role**: Admin
- **Status**: Active

This user is automatically seeded in the database. Log in using the magic link sent to this email.

### Seeding Admin Users

To seed additional admin or delivery partner users, run the seed script on the backend:

```bash
cd server
node seed-admin.js
```

This creates:
1. **Admin User**: `listnrentclient@gmail.com` (if not already exists)
2. **Delivery Partner**: `delivery@listnrent.com` (if not already exists)

## Authentication Flow

1. User enters email on login page
2. Magic link is sent to the email
3. User clicks the magic link in their email
4. User is authenticated and redirected to dashboard
5. System verifies user is registered as admin/delivery partner
6. If verification fails, user is logged out

## Role-Based Access

- **Admin**: Full access to all features (coming soon)
  - User management
  - Listing management
  - Booking management
  - Revenue reports
  - Analytics

- **Delivery Partner**: Limited access (coming soon)
  - View assigned deliveries
  - Update delivery status

## File Structure

```
src/
├── components/
│   └── ProtectedRoute.jsx       # Route protection wrapper
├── context/
│   └── AdminAuthContext.jsx     # Auth context and provider
├── hooks/
│   └── useAdminAuth.js          # Auth hook
├── pages/
│   ├── AdminLogin.jsx           # Login page
│   └── Dashboard.jsx            # Dashboard page
├── services/
│   ├── api.js                   # Admin API calls
│   └── firebase.js              # Firebase auth setup
├── App.jsx                      # Main app with routes
└── main.jsx                     # Entry point
```

## API Integration

The admin app communicates with the backend API at `http://localhost:5000/api/admin/`

### Endpoints

- `POST /api/admin/init` - Initialize/verify admin user
- `GET /api/admin/profile` - Get admin profile

## Notes

- The admin panel runs on port 5174 to avoid conflicts with the client app (5173)
- CORS is configured on the backend to allow requests from the admin panel
- All routes except `/login` require authentication
- Unauthenticated users are automatically redirected to the login page

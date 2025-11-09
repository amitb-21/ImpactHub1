# ImpactHub Backend

A robust Node.js + Express backend for community impact management and volunteer coordination platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 5.0+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests (if configured)
npm test
```

The development server runs at `http://localhost:5050` by default.

## 📋 Technology Stack

### Core Framework
- **Express.js 5.1.0** - Web framework
- **Node.js** - JavaScript runtime

### Database
- **MongoDB** - NoSQL database
- **Mongoose 8.19.1** - MongoDB ODM

### Authentication & Security
- **Passport.js 0.7.0** - Authentication middleware
- **Passport Google OAuth 2.0.0** - Google OAuth strategy
- **Passport Local 1.0.0** - Local auth strategy
- **JWT (jsonwebtoken 9.0.2)** - Token-based authentication
- **Bcrypt 6.0.0** - Password hashing
- **Bcryptjs 3.0.2** - Additional crypto utilities
- **Helmet 8.1.0** - Security headers
- **Express Session 1.18.2** - Session management

### HTTP & Communication
- **Socket.IO 4.8.1** - Real-time WebSocket communication
- **Axios 1.12.2** - HTTP client
- **CORS 2.8.5** - Cross-Origin Resource Sharing

### File Upload & Storage
- **Cloudinary 2.7.0** - Cloud storage for images
- **Multer 2.0.2** - File upload middleware

### Rate Limiting & Validation
- **Express Rate Limit 8.1.0** - API rate limiting
- **Dotenv 17.2.3** - Environment variables

### Development Tools
- **Nodemon 3.1.10** - Auto-restart during development

## 📁 Project Structure

```
backend/src/
├── config/                      # Configuration files
│   ├── db.js                   # MongoDB connection
│   ├── env.js                  # Environment variables
│   ├── passport.js             # Passport authentication strategies
│   └── socket.js               # Socket.IO configuration
├── controllers/                 # Request handlers
│   ├── activityController.js
│   ├── adminController.js
│   ├── authController.js
│   ├── communityController.js
│   ├── communityManagerApplicationController.js
│   ├── eventController.js
│   ├── eventPhotoController.js
│   ├── impactController.js
│   ├── participationController.js
│   ├── ratingController.js
│   ├── resourceController.js
│   ├── userController.js
│   └── verificationController.js
├── middleware/                  # Custom middleware
│   ├── auth.js                 # Authentication & authorization
│   ├── errorHandler.js         # Error handling
│   ├── locationValidator.js    # Location validation
│   ├── rateLimiter.js          # Rate limiting
│   ├── resourceValidator.js    # Resource validation
│   ├── roleValidation.js       # Role-based access control
│   ├── uploadMiddleware.js     # File upload configuration
│   └── validator.js            # Input validation
├── models/                      # Mongoose schemas
│   ├── Activity.js
│   ├── Community.js
│   ├── CommunityManagerApplication.js
│   ├── CommunityRewards.js
│   ├── CommunityVerification.js
│   ├── Event.js
│   ├── EventPhoto.js
│   ├── ImpactMetric.js
│   ├── Participation.js
│   ├── Rating.js
│   ├── Resource.js
│   ├── User.js
│   └── VolunteerPoints.js
├── routes/                      # API routes
│   ├── activityRoutes.js
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── communityManagerRoutes.js
│   ├── communityRoutes.js
│   ├── eventPhotoRoutes.js
│   ├── eventRoutes.js
│   ├── impactRoutes.js
│   ├── locationCalendarRoutes.js
│   ├── participationRoutes.js
│   ├── pointsRoutes.js
│   ├── ratingRoutes.js
│   ├── realtimeRoutes.js
│   ├── resourceRoutes.js
│   ├── userRoutes.js
│   └── verificationRoutes.js
├── services/                    # Business logic
│   ├── calendarService.js      # Event reminders & calendar
│   ├── eventReminderService.js # Event notification service
│   ├── geocodingService.js     # Location/coordinates handling
│   ├── impactService.js        # Points & impact calculations
│   ├── locationService.js      # Location-based queries
│   ├── pointsService.js        # Points & rewards system
│   ├── socketService.js        # Real-time notifications
│   └── uploadService.js        # Cloudinary integration
├── utils/                       # Utility functions
│   ├── asyncHandler.js         # Async error wrapper
│   ├── constants.js            # App constants
│   ├── helpers.js              # Helper functions
│   ├── logger.js               # Logging utility
│   └── verificationUtils.js    # Verification helpers
├── app.js                       # Express app setup
└── server.js                    # Server entry point
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```properties
# Server Configuration
PORT=5050
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production
SESSION_SECRET=your_session_secret_key_change_in_production

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:5050

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Production Environment Variables

```properties
# Server Configuration
PORT=5050
NODE_ENV=production

# Database
MONGO_URI=your_production_mongodb_uri

# Authentication (Generate new secure keys!)
JWT_SECRET=generate_a_strong_random_string
SESSION_SECRET=generate_another_strong_random_string

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
CLIENT_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.onrender.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🎯 Key Features

### Authentication & Authorization
- Email/Password authentication with Passport Local
- Google OAuth 2.0 integration
- JWT token-based authentication
- Role-based access control (User, Moderator, Admin)
- Session management with secure cookies

### User Management
- User registration and profile management
- User activity tracking
- Points and level system
- Leaderboard functionality
- User statistics and impact metrics

### Community Management
- Create and manage communities
- Community verification system (pending → verified/rejected)
- Community member management
- Community rewards and points
- Community tier system (Bronze → Diamond)

### Events Management
- Create, read, update, delete events
- Event capacity management
- Event registration and participation
- Event location tracking with geospatial queries
- Event photo gallery with Cloudinary storage
- Event reminders (24h, 1h, now)
- Attendance verification

### Participation & Verification
- Event participation tracking
- Attendance verification by organizers
- Hours contributed tracking
- Points earning system
- Wishlist/saved events
- Rejection handling with reasons

### Points & Impact System
- Volunteer points for participation and creation
- Community rewards for growth and events
- Impact metrics calculation
- Level-up system
- Leaderboards (volunteer and community)
- Rank calculation

### Community Manager Application
- Application system for community managers
- Admin approval/rejection workflow
- Auto-creation of communities on approval
- 30-day reapplication cooldown after rejection
- Automatic community verification

### Ratings & Reviews
- Rate events and communities (1-5 stars)
- Review text for ratings
- Verified participant indicator
- Rating distribution analysis
- Helpful/unhelpful marking

### Resources
- Educational content library
- Resource creation and publishing
- Admin approval workflow
- Resource search and filtering
- Like/bookmark functionality
- View tracking

### Real-time Features
- Socket.IO WebSocket integration
- Real-time notifications
- Live event capacity updates
- Live leaderboard updates
- Activity feed broadcasts
- Attendance verification notifications
- Points earned notifications
- Level-up notifications

### Location Features
- Geospatial indexing for events and communities
- Nearby events/communities search
- Location-based event discovery
- Bounding box queries
- Calendar integration with event reminders

### Admin Dashboard
- User management (view, role update, deactivate)
- Community management and analytics
- Event monitoring
- Verification approvals
- System analytics and reporting
- Dashboard statistics

## 📊 Database Models

### User
- Profile information
- Authentication (email, password, googleId)
- Points and level
- Communities joined
- Events participated
- Role management

### Community
- Basic info (name, description, location)
- Verification status
- Member management
- Event counting
- Ratings and reviews
- Geospatial coordinates

### Event
- Event details (title, description, time)
- Location with coordinates
- Participants management
- Capacity control
- Status tracking
- Photo gallery

### Participation
- Event registration tracking
- Attendance verification
- Hours contributed
- Points earned
- Wishlist functionality
- Feedback and ratings

### Activity
- User activity tracking
- Activity types (joined, created, attended, etc.)
- Related entity references
- Metadata storage

### Points & Rewards
- VolunteerPoints - Individual volunteer points tracking
- CommunityRewards - Community rewards and tier system
- Points history with detailed breakdown

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Google OAuth initiation
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `GET /users/:id/stats` - Get user statistics
- `GET /users/:id/activity` - Get user activity feed
- `GET /users` - Search users

### Communities
- `GET /communities` - List communities (verified only)
- `GET /communities/:id` - Get community details
- `POST /communities/:id/join` - Join community
- `POST /communities/:id/leave` - Leave community
- `PUT /communities/:id` - Update community (manager/admin)
- `GET /communities/:id/members` - Get community members
- `GET /communities/:id/verification-status` - Check verification status

### Events
- `GET /events` - List events with filters
- `POST /events` - Create event (moderator/admin)
- `GET /events/:id` - Get event details
- `GET /events/my-events` - Get user's created events
- `POST /events/:id/join` - Register for event
- `POST /events/:id/leave` - Unregister from event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/:id/participants` - Get event participants

### Participation
- `POST /participation/:eventId/wishlist/save` - Save to wishlist
- `DELETE /participation/:eventId/wishlist/remove` - Remove from wishlist
- `GET /participation/user/:userId/wishlist` - Get user's wishlist
- `POST /participation/:participationId/mark-attended` - Mark attendance
- `POST /participation/:participationId/reject` - Reject participant
- `GET /participation/event/:eventId/pending` - Get pending participants
- `GET /participation/event/:eventId/verified` - Get verified participants

### Ratings
- `POST /ratings` - Create rating/review
- `GET /ratings` - Get ratings for an entity
- `PUT /ratings/:id` - Update rating
- `DELETE /ratings/:id` - Delete rating
- `POST /ratings/:id/helpful` - Mark as helpful

### Community Manager
- `POST /community-manager/apply` - Apply as community manager
- `GET /community-manager/my-application` - Get application status
- `GET /community-manager/my-history` - Get application history
- `GET /community-manager/admin/pending` - Get pending applications (admin)
- `POST /community-manager/admin/:applicationId/approve` - Approve (admin)
- `POST /community-manager/admin/:applicationId/reject` - Reject (admin)

### Points & Leaderboards
- `GET /points/volunteer/leaderboard` - Volunteer leaderboard
- `GET /points/volunteer/:userId` - User points summary
- `GET /points/community/leaderboard` - Community leaderboard
- `GET /points/community/:communityId` - Community rewards summary

### Impact & Analytics
- `GET /impact/metrics/:userId` - User impact metrics
- `GET /impact/progress/:userId` - User progress to next level
- `GET /impact/leaderboard` - Global leaderboard
- `GET /impact/rank/:userId` - User rank
- `GET /impact/summary` - Platform impact summary

### Resources
- `GET /resources` - List resources (published only)
- `GET /resources/featured` - Featured resources
- `GET /resources/:id` - Get resource details
- `POST /resources` - Create resource (unpublished)
- `PUT /resources/:id` - Update resource
- `DELETE /resources/:id` - Delete resource
- `POST /resources/:id/like` - Like resource
- `POST /resources/:id/unlike` - Unlike resource
- `GET /resources/admin/pending` - Pending resources (admin)
- `POST /resources/:id/approve` - Approve resource (admin)
- `POST /resources/:id/reject` - Reject resource (admin)

### Admin
- `GET /admin/users` - List all users
- `GET /admin/users/:userId` - Get user details
- `PUT /admin/users/:userId/role` - Update user role
- `POST /admin/users/:userId/deactivate` - Deactivate user
- `GET /admin/communities` - List communities
- `GET /admin/communities/:communityId/analytics` - Community analytics
- `GET /admin/events/:eventId/participants` - Event participants
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/analytics` - System analytics

### Location & Calendar
- `GET /location/nearby-events` - Nearby events
- `GET /location/nearby-communities` - Nearby communities
- `GET /location/bbox` - Events in bounding box
- `GET /location/city/:city` - Events by city
- `GET /location/today` - Events today
- `PUT /location/events/:eventId/location` - Update event location
- `GET /location/calendar/:eventId/download.ics` - Download event as .ics
- `GET /location/calendar/:eventId/urls` - Get calendar URLs

## 🔐 Authentication

### Local Authentication
- Email/password registration
- Password hashing with bcrypt
- Login validation
- JWT token generation

### Google OAuth
- Google OAuth 2.0 flow
- Auto user creation/update
- Token-based session

### Protected Routes
- Middleware: `verifyToken` - Validates JWT
- Middleware: `isAdmin` - Checks admin role
- Middleware: `isModeratorOrAdmin` - Checks moderator/admin role

## ⚡ Real-time Features (Socket.IO)

### Events Emitted
- `notification:system` - System notifications
- `event:capacity_update` - Event capacity changes
- `community:member_joined` - New member joins community
- `points:earned` - User earns points
- `user:levelup` - User levels up
- `leaderboard:volunteer_update` - Leaderboard change
- `leaderboard:community_update` - Community leaderboard change
- `participation:verified` - Attendance verified
- `participation:rejected` - Participation rejected
- `community:verification_update` - Community verification status
- `event:photo_uploaded` - New event photo
- `community_manager:approved` - Application approved
- `community_manager:rejected` - Application rejected

### Socket Authentication
- JWT token in handshake auth
- User-specific rooms (`user:{userId}`)
- Community rooms (`community:{communityId}`)
- Event rooms (`event:{eventId}`)
- Admin room (`admin`)
- Leaderboard room (`leaderboard`)

## 📧 Email & Notifications

### Event Reminders
- 24 hours before event
- 1 hour before event
- Event starting now
- Calendar invitations (.ics files)

### Notification Types
- Points earned
- Level up
- Community joined
- Event updates
- Attendance verification
- Application status changes

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin configuration
- **Rate Limiting** - API rate limiting (20 requests/minute on `/auth`)
- **Password Hashing** - Bcrypt with salt rounds
- **JWT Secrets** - Secure token signing
- **Session Security** - Secure, HTTPOnly cookies
- **Input Validation** - Schema validation on all inputs
- **Role-Based Access** - Permission checking on protected routes

## 🚀 Deployment

### On Render

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy automatic on push
5. Monitor logs in Render dashboard

### Environment Variables in Production
All `.env` variables must be set in Render's environment settings.

## 📊 Monitoring & Logging

### Logger Utility
- Info, warn, error, success, debug levels
- Development mode logging
- Conditional debugging

### Activity Tracking
- All major actions logged in Activity collection
- User action history
- Audit trail for admin actions

## 🐛 Error Handling

### Error Middleware
- Centralized error handler
- Validation error formatting
- Database error handling
- Async error wrapper (`asyncHandler`)

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## 📚 Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Mongoose](https://mongoosejs.com)
- [Passport.js](https://www.passportjs.org)
- [Socket.IO](https://socket.io)
- [JWT Introduction](https://jwt.io)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 📝 License

This project is part of ImpactHub platform.

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Write clear commit messages
4. Submit pull request

## 🤝 Support

For issues or questions, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2025

# ImpactHub Frontend

A modern React + Vite frontend application for community impact management and volunteer coordination.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm lint
```

The development server runs at `http://localhost:5173` by default.

## 📋 Technology Stack

### Core Framework
- **React 19.1.1** - UI library
- **React Router DOM 7.9.4** - Routing and navigation
- **Vite 7.1.7** - Fast build tool and dev server

### State Management
- **Redux Toolkit 2.9.2** - State management
- **React Redux 9.2.0** - React bindings for Redux

### Maps & Location
- **Leaflet 1.9.4** - Open-source mapping library
- **React Leaflet 5.0.0** - React components for Leaflet

### Forms & Validation
- **React Hook Form 7.65.0** - Performant form management
- **Zod 4.1.12** - TypeScript-first schema validation
- **@hookform/resolvers 5.2.2** - Resolvers for form validation

### HTTP & Real-time
- **Axios 1.12.2** - HTTP client
- **Socket.IO Client 4.8.1** - Real-time communication

### Data & Utilities
- **Lodash 4.17.21** - Utility library
- **Lodash.debounce 4.0.8** - Debounce utility
- **Chart.js 4.5.1** - Data visualization
- **React Chart.js 2 5.3.0** - React wrapper for Chart.js

### UI & Icons
- **React Icons 5.5.0** - Icon library
- **React Toastify 11.0.5** - Toast notifications
- **Prop Types 15.8.1** - Runtime type checking

### Development
- **ESLint 9.36.0** - Code quality
- **Vite Plugin React 5.0.4** - React plugin for Vite

## 📁 Project Structure

```
frontend/src/
├── api/                    # API integration modules
├── assets/                 # Images, fonts, and static files
├── components/             # Reusable React components
│   ├── activity/          # Activity-related components
│   ├── admin/             # Admin dashboard components
│   ├── auth/              # Authentication components
│   ├── common/            # Common/shared components
│   ├── community/         # Community-related components
│   ├── communityManager/  # Community manager components
│   ├── event/             # Event-related components
│   ├── impact/            # Impact/leaderboard components
│   ├── notifications/     # Notification components
│   ├── participation/     # Participation/registration components
│   ├── photo/             # Photo gallery components
│   ├── rating/            # Rating/review components
│   ├── resource/          # Resource library components
│   └── user/              # User profile components
├── config/                # Configuration files
├── hooks/                 # Custom React hooks
├── pages/                 # Page components (routes)
├── store/                 # Redux store configuration
├── App.css               # Global styles
├── App.jsx               # Main app component
├── index.css             # Global index styles
└── main.jsx              # Entry point

Key Directories:
- api/                    # Axios instances, API calls
- config/                 # Environment, constants
- store/                  # Redux slices, actions, reducers
- hooks/                  # useAuth, useFetch, useNotification, etc.
- pages/                  # Home, Dashboard, Login, etc.
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```properties
# Backend API Configuration
VITE_API_URL=http://localhost:5050
VITE_SOCKET_URL=http://localhost:5050
VITE_CLIENT_URL=http://localhost:5173

# External APIs
VITE_GEODB_API_KEY=your_geodb_api_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### For Production

```properties
# Backend API Configuration
VITE_API_URL=https://impacthub1.onrender.com
VITE_SOCKET_URL=https://impacthub1.onrender.com
VITE_CLIENT_URL=https://your-frontend-url.vercel.app

# External APIs
VITE_GEODB_API_KEY=your_geodb_api_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🎯 Features

### User Management
- User authentication (Email/Password & Google OAuth)
- Profile management
- User activity tracking
- Points and leaderboard system
- Volunteer hours tracking

### Communities
- Create and manage communities
- Join/leave communities
- Community verification system
- Community member management
- Community rewards and points

### Events
- Create and manage events
- Register for events
- Event location mapping (Leaflet)
- Real-time capacity updates
- Event ratings and reviews
- Event photo gallery

### Participation
- Event participation tracking
- Attendance verification
- Wishlist management
- Hour contribution tracking
- Points earning system

### Real-time Features
- WebSocket integration via Socket.IO
- Live notifications
- Real-time event updates
- Live leaderboards
- Activity feed updates

### Location Features
- Interactive maps with Leaflet
- Nearby events/communities
- Location-based search
- Geolocation support
- Bounding box queries

### Resources
- Educational content library
- Resource categories and filters
- Like/bookmark resources
- Search functionality
- Admin approval workflow

### Admin Dashboard
- User management
- Community management
- Event monitoring
- Analytics and reporting
- Verification approvals

## 🔌 API Integration

### Axios Setup
Located in `src/api/`, the frontend uses Axios for HTTP requests:
- Base URL configuration from environment variables
- Authentication token injection in headers
- Response error handling
- Request/response transformations
- Centralized error management

### Socket.IO Integration
Real-time communication for:
- Notifications
- Event updates
- Leaderboard changes
- Live activity feeds
- Member join/leave events
- Points earned notifications

## 📊 State Management (Redux)

Redux slices organized in `src/store/`:
- **authSlice** - Authentication state
- **userSlice** - User profile and stats
- **eventsSlice** - Events management
- **communitiesSlice** - Communities management
- **participationSlice** - Event participation
- **notificationsSlice** - Toast and notifications
- **impactSlice** - Impact metrics and leaderboards

Each slice includes actions, reducers, and selectors for managing component state.

## 🎨 Styling

- **Custom CSS** - Component-specific styling (`*.css` files)
- **CSS Organization** - Modular and component-focused
- **Global Styles** - `index.css` and `App.css` for global styling
- **Responsive Design** - Mobile-first CSS approach
- **Inline Styles** - Used for dynamic styling where needed

## 🗺️ Routing

Main routes managed in `pages/`:
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard
- `/communities` - Communities listing
- `/communities/:id` - Community details
- `/events` - Events listing
- `/events/:id` - Event details
- `/profile/:id` - User profile
- `/admin` - Admin dashboard
- `/resources` - Resources library

## 📝 Form Handling

Using React Hook Form + Zod for validation:

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define schema with Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Use in component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

Form components are organized in `src/components/` by feature (auth, community, event, etc.).

## 🗺️ Maps Integration

Using Leaflet + React Leaflet in `src/components/`:
- Interactive maps for displaying events and communities
- Location-based search
- Nearby events/communities discovery
- User location tracking

```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Maps for displaying events and communities
// Location-based search
// Nearby events/communities
```

## 📊 Data Visualization

Using Chart.js for analytics and statistics:
- Leaderboards visualization
- Impact statistics charts
- Activity trends
- Community analytics

```javascript
import { Line, Bar, Pie } from 'react-chartjs-2';

// Leaderboards
// Impact statistics
// Activity charts
// Community analytics
```

## 🔐 Authentication

- JWT token storage (localStorage)
- Automatic token refresh via interceptors
- Protected routes with auth guards
- Google OAuth integration
- Session management
- Login state persistence

## 🚨 Error Handling

- Centralized error interceptors in API config
- User-friendly error messages via React Toastify
- Toast notifications for errors
- Form validation errors
- API error response handling
- Network error management

## 📡 Real-time Updates

Socket.IO events handled in components:
- `notification:system` - System notifications
- `event:capacity_update` - Event capacity changes
- `community:member_joined` - New member joins
- `points:earned` - Points earned
- `user:levelup` - User level up
- `leaderboard:*_update` - Leaderboard changes
- `participation:verified` - Attendance verified
- `event:new_participant` - New event registration

## 🧩 Component Organization

Components are organized by feature for better scalability:

```
components/
├── activity/           # Activity feed, history
├── admin/             # Admin panels, dashboards
├── auth/              # Login, register forms
├── common/            # Navbar, footer, sidebar
├── community/         # Community cards, lists, details
├── communityManager/  # Community manager features
├── event/             # Event cards, details, forms
├── impact/            # Leaderboards, achievements
├── notifications/     # Alert, toast, banners
├── participation/     # Registration, attendance
├── photo/             # Photo gallery, uploads
├── rating/            # Rating forms, displays
├── resource/          # Resource cards, library
└── user/              # Profile, settings, stats
```

Each feature folder contains related components with their own styles.

## 🎯 Custom Hooks

Located in `src/hooks/`:
- `useAuth()` - Authentication state and methods
- `useFetch()` - Data fetching with loading/error states
- `useNotification()` - Toast notifications
- `useSocket()` - Socket.IO connection and events
- `useLocation()` - Geolocation handling

## 🚀 Performance Optimization

- **Code Splitting** - Lazy load routes with React.lazy()
- **Image Optimization** - Use efficient image formats
- **Debouncing** - Form inputs and searches with lodash.debounce
- **Memoization** - useMemo, useCallback for expensive operations
- **Redux Selectors** - Memoized selectors to prevent re-renders

## 🧪 Development Workflow

```bash
# Start dev server with HMR (Hot Module Replacement)
npm run dev

# Build and preview production bundle
npm run build && npm run preview

# Lint code
npm run lint

# Check for code issues
npm run lint -- --fix
```

## 📦 Building for Production

```bash
# Build optimized bundle
npm run build

# Output directory: dist/
# Ready to deploy on Vercel, Netlify, or any static host
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Environment Variables for Production
Set these in your hosting platform's settings:
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL
- `VITE_CLIENT_URL` - Frontend URL
- `VITE_GEODB_API_KEY` - GeoDB API key
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend CORS is configured for your frontend URL
- Check `VITE_API_URL` matches backend URL in environment variables
- Verify backend is running and accessible

### Socket Connection Failed
- Verify `VITE_SOCKET_URL` is correct
- Check backend Socket.IO server is running
- Ensure WebSocket protocol is supported
- Check browser console for connection errors

### Token Expired
- Implement token refresh logic in API interceptors
- Store refresh tokens securely in localStorage
- Auto-logout on token expiration
- Redirect to login on 401 responses

### Maps Not Loading
- Check Leaflet CSS is properly imported
- Verify map container has defined height
- Check coordinates are valid (lat between -90 to 90, lng between -180 to 180)
- Check browser console for tile layer errors

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite && npm run build`
- Check Node.js version compatibility

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React Router](https://reactrouter.com)
- [React Hook Form](https://react-hook-form.com)
- [Leaflet](https://leafletjs.com)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Axios](https://axios-http.com)
- [Chart.js](https://www.chartjs.org)
- [React Icons](https://react-icons.github.io/react-icons/)
- [React Toastify](https://fkhadra.github.io/react-toastify/introduction)

## 📝 License

This project is part of ImpactHub platform.

## 👥 Contributing

1. Create a feature branch from main
2. Make your changes following the component organization structure
3. Run linter: `npm run lint`
4. Test your changes in development
5. Commit with clear messages
6. Submit pull request

## 🤝 Support

For issues or questions, refer to the main ImpactHub documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2025

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

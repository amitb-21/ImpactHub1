import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css"; // <-- ADD THIS IMPORT FOR LEAFLET

import store from "./store/store";
import { useAuth } from "./hooks/useAuth";
import { API_URL } from "./config/constants";

// Auth Components
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages - Auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";

// Pages - Communities
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import CommunityActivity from "./pages/CommunityActivity";

// Pages - Community Manager
import BecomeCommunityManager from "./pages/BecomeCommunityManager";

// Pages - Events
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";

// Pages - Location
import NearbyEvents from "./pages/NearbyEvents";
import NearbyCommunities from "./pages/NearbyCommunities";
import EventsByCity from "./pages/EventsByCity";
import TodayEvents from "./pages/TodayEvents";

// Pages - Impact
import Impact from "./pages/Impact";
import Leaderboard from "./pages/Leaderboard";
import ImpactSummary from "./pages/ImpactSummary";

// Pages - Activity
import GlobalActivityFeed from "./pages/ActivityFeed";

// --- (1) IMPORT NEW RESOURCE PAGES ---
import Resources from "./pages/Resources";
import CreateResource from "./pages/CreateResource";
import ResourceDetail from "./pages/ResourceDetail";
// --- (End 1) ---

// Error Pages
const NotFound = () => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
  </div>
);

const Unauthorized = () => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <h1>403 - Access Denied</h1>
    <p>You don't have permission to access this page.</p>
  </div>
);

// App Component
const AppContent = () => {
  const { isAuthenticated, loadUser } = useAuth();

  // Load user on app initialization
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      {/* Dev-time check: alert if VITE_API_URL is not provided (helps diagnose OAuth failures) */}
      {!import.meta.env.VITE_API_URL && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "8px 12px",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          Warning: VITE_API_URL is not set. OAuth and API requests may fail. See{" "}
          <code
            style={{ background: "#fff", padding: "2px 6px", borderRadius: 4 }}
          >
            frontend/.env.example
          </code>{" "}
          for required vars.
        </div>
      )}

      <Routes>
        {/* =====================
          PUBLIC ROUTES
          ===================== */}

        {/* Home/Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =====================
          PROTECTED ROUTES
          ===================== */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* User Profile */}
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* =====================
          COMMUNITIES (Day 16)
          ===================== */}

        {/* Communities List Page */}
        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <Communities />
            </ProtectedRoute>
          }
        />

        {/* Community Detail Page */}
        <Route
          path="/communities/:communityId"
          element={
            <ProtectedRoute>
              <CommunityDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/communities/:communityId/activity"
          element={
            <ProtectedRoute>
              <CommunityActivity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nearby-communities"
          element={
            <ProtectedRoute>
              <NearbyCommunities />
            </ProtectedRoute>
          }
        />

        {/* =====================
          COMMUNITY MANAGER (Day 7/8)
          ===================== */}

        <Route
          path="/apply-community-manager"
          element={
            <ProtectedRoute>
              <BecomeCommunityManager />
            </ProtectedRoute>
          }
        />

        {/* =====================
          EVENTS
          ===================== */}

        {/* Events List Page */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        {/* Event Detail Page */}
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nearby-events"
          element={
            <ProtectedRoute>
              <NearbyEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/city/:cityName"
          element={
            <ProtectedRoute>
              <EventsByCity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/today"
          element={
            <ProtectedRoute>
              <TodayEvents />
            </ProtectedRoute>
          }
        />

        {/* =====================
          IMPACT & GAMIFICATION
          ===================== */}

        {/* User Impact Dashboard */}
        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <Impact />
            </ProtectedRoute>
          }
        />

        {/* Impact Summary */}
        <Route
          path="/impact/summary"
          element={
            <ProtectedRoute>
              <ImpactSummary />
            </ProtectedRoute>
          }
        />

        {/* Leaderboard */}
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        {/* =====================
          ACTIVITY & FEED
          ===================== */}

        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <GlobalActivityFeed />
            </ProtectedRoute>
          }
        />

        {/* =====================
          RESOURCES (PHASE 12)
          ===================== */}

        {/* Resources Browse Page */}
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />

        {/* Create Resource Page */}
        <Route
          path="/create-resource"
          element={
            <ProtectedRoute>
              <CreateResource />
            </ProtectedRoute>
          }
        />

        {/* Resource Detail Page */}
        <Route
          path="/resources/:resourceId"
          element={
            <ProtectedRoute>
              <ResourceDetail />
            </ProtectedRoute>
          }
        />

        {/* =====================
          ADMIN ROUTES
          ===================== */}

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              {/* <Admin /> - To be created on Day 33 */}
              <div>Admin Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* =====================
          NOTIFICATIONS
          ===================== */}

        {/* Notifications Center */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              {/* <NotificationCenter /> - To be created on Day 34 */}
              <div>Notifications (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* =====================
          ERROR ROUTES
          ===================== */}

        {/* Unauthorized Access */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

// Main App Component with Router
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </Provider>
  );
}

export default App;

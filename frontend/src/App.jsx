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
import store from "./store/store";
import { useAuth } from "./hooks/useAuth";
import { API_URL } from "./config/constants";

// Auth Components
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages - Auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

// Error Pages (to be created)
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
              {/* <Dashboard /> - To be created on Day 14 */}
              <div>Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* User Profile */}
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              {/* <UserProfile /> - To be created on Day 14 */}
              <div>User Profile (Coming Soon)</div>
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
              {/* <Events /> - To be created on Day 19 */}
              <div>Events List (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Event Detail Page */}
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute>
              {/* <EventDetail /> - To be created on Day 19 */}
              <div>Event Detail (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Nearby Events */}
        <Route
          path="/nearby-events"
          element={
            <ProtectedRoute>
              {/* <NearbyEvents /> - To be created on Day 23 */}
              <div>Nearby Events (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Events by City */}
        <Route
          path="/events/city/:cityName"
          element={
            <ProtectedRoute>
              {/* <EventsByCity /> - To be created on Day 23 */}
              <div>Events by City (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Today's Events */}
        <Route
          path="/events/today"
          element={
            <ProtectedRoute>
              {/* <TodayEvents /> - To be created on Day 23 */}
              <div>Today's Events (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* =====================
          COMMUNITIES
          ===================== */}

        {/* Communities List Page */}
        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              {/* <Communities /> - To be created on Day 16 */}
              <div>Communities List (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Community Detail Page */}
        <Route
          path="/communities/:communityId"
          element={
            <ProtectedRoute>
              {/* <CommunityDetail /> - To be created on Day 16 */}
              <div>Community Detail (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Community Activity Feed */}
        <Route
          path="/communities/:communityId/activity"
          element={
            <ProtectedRoute>
              {/* <CommunityActivityFeed /> - To be created on Day 29 */}
              <div>Community Activity (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Nearby Communities */}
        <Route
          path="/nearby-communities"
          element={
            <ProtectedRoute>
              {/* <NearbyCommunities /> - To be created on Day 23 */}
              <div>Nearby Communities (Coming Soon)</div>
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
              {/* <Impact /> - To be created on Day 27 */}
              <div>Impact Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Impact Summary */}
        <Route
          path="/impact/summary"
          element={
            <ProtectedRoute>
              {/* <ImpactSummary /> - To be created on Day 27 */}
              <div>Impact Summary (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Leaderboard */}
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              {/* <Leaderboard /> - To be created on Day 27 */}
              <div>Leaderboard (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* =====================
          ACTIVITY & FEED
          ===================== */}

        {/* Global Activity Feed */}
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              {/* <ActivityFeed /> - To be created on Day 29 */}
              <div>Activity Feed (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* =====================
          RESOURCES
          ===================== */}

        {/* Resources Browse Page */}
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              {/* <Resources /> - To be created on Day 31 */}
              <div>Resources (Coming Soon)</div>
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

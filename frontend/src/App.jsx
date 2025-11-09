/* frontend/src/App.jsx */
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
import "leaflet/dist/leaflet.css";

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
import MyCommunityEvents from "./pages/MyCommunityEvents";

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

// Pages - Resources
import Resources from "./pages/Resources";
import CreateResource from "./pages/CreateResource";
import ResourceDetail from "./pages/ResourceDetail";

// Pages - Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CommunityManagement from "./pages/admin/CommunityManagement";
import VerificationQueue from "./pages/admin/VerificationQueue";
import AdminCMApplicationReview from "./pages/admin/AdminCMApplicationReview";
import AdminResourceList from "./pages/admin/AdminResourceList";
import AdminResourceReview from "./pages/admin/AdminResourceReview";
import AdminFeaturedResources from "./pages/admin/AdminFeaturedResources";
import AdminEventManagement from "./pages/admin/AdminEventManagement";
import AdminEventDetail from "./pages/admin/AdminEventDetail";
import AdminAuditLog from "./pages/admin/AdminAuditLog";

// Pages - Error & Notifications
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// App Component
const AppContent = () => {
  const { isAuthenticated, loadUser } = useAuth();

  // Load user on app initialization
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      {/* Dev-time check */}
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =====================
          PROTECTED ROUTES
          ===================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* My Community Events (Community Manager Only) */}
        <Route
          path="/my-events"
          element={
            <ProtectedRoute requiredRole="moderator">
              <MyCommunityEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Communities */}
        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <Communities />
            </ProtectedRoute>
          }
        />
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

        {/* Community Manager */}
        <Route
          path="/apply-community-manager"
          element={
            <ProtectedRoute>
              <BecomeCommunityManager />
            </ProtectedRoute>
          }
        />

        {/* Events - ✅ IMPORTANT: Put specific routes BEFORE dynamic :eventId route */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        {/* Nearby Events */}
        <Route
          path="/events/nearby"
          element={
            <ProtectedRoute>
              <NearbyEvents />
            </ProtectedRoute>
          }
        />

        {/* City-based Events */}
        <Route
          path="/events/city/:cityName"
          element={
            <ProtectedRoute>
              <EventsByCity />
            </ProtectedRoute>
          }
        />

        {/* Today Events */}
        <Route
          path="/events/today"
          element={
            <ProtectedRoute>
              <TodayEvents />
            </ProtectedRoute>
          }
        />

        {/* Dynamic Event Detail - ✅ MUST BE LAST in events routes */}
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />

        {/* Old paths for backward compatibility - redirect to new structure */}
        <Route
          path="/nearby-events"
          element={
            <ProtectedRoute>
              <NearbyEvents />
            </ProtectedRoute>
          }
        />

        {/* Impact */}
        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <Impact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/impact/summary"
          element={
            <ProtectedRoute>
              <ImpactSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        {/* Activity */}
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <GlobalActivityFeed />
            </ProtectedRoute>
          }
        />

        {/* Resources */}
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-resource"
          element={
            <ProtectedRoute>
              <CreateResource />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:resourceId"
          element={
            <ProtectedRoute>
              <ResourceDetail />
            </ProtectedRoute>
          }
        />

        {/* =====================
          ADMIN ROUTES - ✅ VERIFIED COMPLETE
          ===================== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />

          {/* User Management */}
          <Route path="users" element={<UserManagement />} />

          {/* Community Management */}
          <Route path="communities" element={<CommunityManagement />} />

          {/* Verification Queue (CM Applications + Resources) */}
          <Route path="verification" element={<VerificationQueue />} />
          <Route
            path="cm-applications/:appId"
            element={<AdminCMApplicationReview />}
          />

          {/* Resource Management - ✅ COMPLETE */}
          <Route path="resources" element={<AdminResourceList />} />
          <Route
            path="resources/featured"
            element={<AdminFeaturedResources />}
          />
          <Route
            path="resources/:resourceId"
            element={<AdminResourceReview />}
          />

          {/* Event Management */}
          <Route path="events" element={<AdminEventManagement />} />
          <Route path="events/:eventId" element={<AdminEventDetail />} />

          {/* Audit Log */}
          <Route path="audit-log" element={<AdminAuditLog />} />
        </Route>

        {/* =====================
          ERROR & NOTIFICATION ROUTES
          ===================== */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

// Main App Component
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

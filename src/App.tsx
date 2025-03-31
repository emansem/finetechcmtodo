import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import AuthGuard from "./components/auth/AuthGuard";
import { Suspense } from "react";
import Dashboard from "./pages/Dashboard";
import BackendFeatures from "./pages/BackendFeatures";
import FrontendFeatures from "./pages/FrontendFeatures";
import UserFlow from "./pages/UserFlow";
import UserStories from "./pages/UserStories";

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />

        <Route
          path="/features/frontend"
          element={
            <AuthGuard>
              <FrontendFeatures />
            </AuthGuard>
          }
        />

        <Route
          path="/features/backend"
          element={
            <AuthGuard>
              <BackendFeatures />
            </AuthGuard>
          }
        />

        <Route
          path="/user-stories"
          element={
            <AuthGuard>
              <UserStories />
            </AuthGuard>
          }
        />

        <Route
          path="/user-flow"
          element={
            <AuthGuard>
              <UserFlow />
            </AuthGuard>
          }
        />

        {/* Redirect root to dashboard if authenticated, otherwise to auth */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

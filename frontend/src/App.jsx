import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthInit from "./components/AuthInit";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import { Toaster } from "react-hot-toast";
import VerifyOtp from "./pages/Verifyotp";

function App() {
  return (
    <BrowserRouter>
      <AuthInit>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/signup"
            element={
              <AuthLayout>
                <Signup />
              </AuthLayout>
            }
          />
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <AuthLayout>
                <VerifyOtp />
              </AuthLayout>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthInit>
    </BrowserRouter>
  );
}

export default App;
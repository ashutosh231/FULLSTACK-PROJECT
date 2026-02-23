import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthInit from "./components/AuthInit";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";
import VerifyOtp from "./pages/Verifyotp";

function App() {
  return (
    <BrowserRouter>
      <AuthInit>
        <Toaster position="top-right" />
        <Routes>

          <Route path="/" element={<Navigate to="/login" replace />} />
        
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

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
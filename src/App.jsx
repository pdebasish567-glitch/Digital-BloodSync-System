import React, { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Toast from "./components/common/Toast";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import BloodAvailability from "./pages/public/BloodAvailability";
import BecomeDonor from "./pages/public/BecomeDonor";
import Contact from "./pages/public/Contact";
import HospitalLogin from "./pages/auth/HospitalLogin";
import DonorLogin from "./pages/auth/DonorLogin";
import DonorRegistration from "./pages/auth/DonorRegistration";
import HospitalRegistration from "./pages/auth/HospitalRegistration";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DonorDashboard from "./pages/donor/DonorDashboard";
import Profile from "./pages/public/Profile";
import ResetPassword from "./pages/auth/ResetPassword";

export default function App() {
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const dashboard = location.pathname.startsWith("/admin") || location.pathname.startsWith("/donor-dashboard");

  const notify = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  return (
    <AuthProvider>
      <>
        {!dashboard && <Navbar />}
        <main className={dashboard ? "app-main dashboard-main" : "app-main"}>
          <Routes>
            <Route path="/" element={<Home notify={notify} />} />
            <Route path="/about" element={<About />} />
            <Route path="/blood-availability" element={<BloodAvailability notify={notify} />} />
            <Route path="/become-donor" element={<BecomeDonor notify={notify} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/hospital-login" element={<HospitalLogin notify={notify} />} />
            <Route path="/donor-login" element={<DonorLogin notify={notify} />} />
            <Route path="/donor-registration" element={<DonorRegistration notify={notify} />} />
            <Route path="/hospital-registration" element={<HospitalRegistration notify={notify} />} />
            <Route path="/profile" element={<Profile notify={notify} />} />
            <Route path="/reset-password" element={<ResetPassword notify={notify} />} />

            {/* Protected routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute role="ADMIN" redirectTo="/hospital-login">
                  <AdminDashboard notify={notify} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor-dashboard/*"
              element={
                <ProtectedRoute role="DONOR" redirectTo="/donor-login">
                  <DonorDashboard notify={notify} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!dashboard && <Footer />}
        {toast && <Toast key={toast.id} {...toast} onClose={() => setToast(null)} />}
      </>
    </AuthProvider>
  );
}
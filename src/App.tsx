import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { queryClient } from "./lib/api/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

import { Home } from "./pages/Home";
import { VehicleListing } from "./pages/VehicleListing";
import { VehicleDetail } from "./pages/VehicleDetail";
import { RequestVehicle } from "./pages/RequestVehicle";
import { Calculator } from "./pages/Calculator";
import { HowItWorks } from "./pages/HowItWorks";
import { Onboarding } from "./pages/Onboarding";
import { Verify } from "./pages/Verify";
import { CompleteProfile } from "./pages/Register";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ResetPassword } from "./pages/ResetPassword";
import { ForgotPassword } from "./pages/ForgotPassword";
import { RequestDetail } from "./pages/RequestDetails";

import { useTokenRefresh } from "./hooks/useAuth";
import { VerifyPaymentCallback } from "./pages/VerifyPayment";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  useTokenRefresh(); // safe globally

  return (
    <Routes>
      {/* 🔓 Public auth routes */}
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 🌍 Public site pages WITH layout */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/vehicles"
        element={
          <Layout>
            <VehicleListing />
          </Layout>
        }
      />
      <Route
        path="/vehicles/:id"
        element={
          <Layout>
            <VehicleDetail />
          </Layout>
        }
      />
      <Route
        path="/request/:id"
        element={
          <Layout>
            <RequestVehicle />
          </Layout>
        }
      />
      <Route
        path="/calculator"
        element={
          <Layout>
            <Calculator />
          </Layout>
        }
      />
      <Route
        path="/how-it-works"
        element={
          <Layout>
            <HowItWorks />
          </Layout>
        }
      />

      <Route
        path="/payment/verify"
        element={
          <ProtectedRoute>
            <VerifyPaymentCallback />
          </ProtectedRoute>
        }
      />
      {/* 🔒 Protected routes */}
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
      <Route
        path="/request-details/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <RequestDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

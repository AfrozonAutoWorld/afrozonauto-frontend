import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { VehicleListing } from './pages/VehicleListing';
import { VehicleDetail } from './pages/VehicleDetail';
import { RequestVehicle } from './pages/RequestVehicle';
import { Calculator } from './pages/Calculator';
import { HowItWorks } from './pages/HowItWorks';
import { Onboarding } from './pages/Onboarding';
import { Verify } from './pages/Verify';
import { CompleteProfile } from './pages/Register';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/api/queryClient';
import { Toaster } from 'sonner';
import { ResetPassword } from './pages/ResetPassword';
import { ForgotPassword } from './pages/ForgotPassword';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useAuthStore } from './lib/authStore';
import { RequestDetail } from './pages/RequestDetails';

function App() {

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  // Show loading spinner while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />


            {/* Main app routes with layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/vehicles" element={<VehicleListing />} />
                    <Route path="/vehicles/:id" element={<VehicleDetail />} />
                    <Route path="/request/:id" element={<RequestVehicle />} />
                    <Route path="/calculator" element={<Calculator />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Routes>
                </Layout>
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

        </AuthProvider>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
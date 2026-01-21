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

function App() {
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
          </Routes>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
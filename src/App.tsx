import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { VehicleListing } from './pages/VehicleListing';
import { VehicleDetail } from './pages/VehicleDetail';
import { RequestVehicle } from './pages/RequestVehicle';
import { Calculator } from './pages/Calculator';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import StatsPage from "./pages/StatsPage";
import PharmaciesPage from "./pages/PharmaciesPage";
import UsersPage from "./pages/UsersPage";
import MedicinesPage from "./pages/MedicinesPage";

function LoginRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<StatsPage />} />
            <Route path="pharmacies" element={<PharmaciesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="medicines" element={<MedicinesPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
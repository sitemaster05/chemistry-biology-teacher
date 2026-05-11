import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SiteDesignProvider from "./components/SiteDesignProvider";

function App() {
  return (
    <BrowserRouter>
      <SiteDesignProvider />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
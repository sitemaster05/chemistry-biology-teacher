import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import SiteDesignProvider from "./components/SiteDesignProvider";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function RouteLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 text-slate-300 backdrop-blur-xl">
        Загружаем раздел...
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SiteDesignProvider />

      <Suspense fallback={<RouteLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

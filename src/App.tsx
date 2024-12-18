import React from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import MainLayout from "./components/layout/MainLayout";
import { TooltipProvider } from "./components/ui/tooltip";
import HomePage from "./pages/home/HomePage";
import UsersPage from "./pages/users/users-page";
import NotFoundPage from "./pages/NotFoundPage";
import AdminPage from "./pages/admin/AdminPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requiredAuthorities={["F_SYSTEM_SETTING"]}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute
                      requiredAuthorities={["M_dhis-web-dashboard"]}
                    >
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

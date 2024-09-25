import React from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import MainLayout from "./components/layout/MainLayout";
import {
  NotFoundPage,
  AdminPage,
  UnauthorizedPage,
  UserPage,
  HomePage,
  VisualizersPage,
  AlertsPage,
  SettingsPage,
  DashboardsPage,
  DataSourcePage
} from './pages';

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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="dashboards" element={<DashboardsPage />} />
              <Route path="visualizers" element={<VisualizersPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="data-sources" element={<DataSourcePage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="admin" element={
                <ProtectedRoute requiredAuthorities={["F_SYSTEM_SETTING"]}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="user" element={
                <ProtectedRoute requiredAuthorities={["M_dhis-web-dashboard"]}>
                  <UserPage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
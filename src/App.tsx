// file location: src/App.tsx

import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/home/HomePage";
import UserEngagementPage from "./pages/user-engagement/UserEngagementPage";
import DistrictEngagementPage from "./pages/district-engagement/DistrictEngagementPage";
import InactivityTrackingPage from "./pages/inactivity-tracking/InactivityTrackingPage";
import NotFoundPage from "./pages/NotFoundPage";
import { AppProviders } from "./context/AppProviders";

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
      <AppProviders>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="user-engagement" element={<UserEngagementPage />} />
              <Route path="district-engagement" element={<DistrictEngagementPage />} />
              <Route path="inactivity-tracking" element={<InactivityTrackingPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </AppProviders>
    </QueryClientProvider>
  );
};

export default App;

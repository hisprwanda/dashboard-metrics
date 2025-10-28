// file location: src/App.tsx

import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import MainLayout from "./components/layout/MainLayout";
import { AppProviders } from "./context/AppProviders";
import DistrictEngagementPage from "./pages/district-engagement/DistrictEngagementPage";
import HomePage from "./pages/home/HomePage";
import InactivityTrackingPage from "./pages/inactivity-tracking/InactivityTrackingPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserEngagementPage from "./pages/user-engagement/UserEngagementPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 60 * 1000, // 5 hours
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppProviders>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="district-engagement" element={<DistrictEngagementPage />} />
            <Route path="user-engagement" element={<UserEngagementPage />} />
            <Route path="inactivity-tracking" element={<InactivityTrackingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProviders>
  </QueryClientProvider>
);

export default App;

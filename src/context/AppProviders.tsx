import type { ReactNode } from "react";

import { AuthProvider } from "./AuthContext";
import { DashboardProvider } from "./DashboardContext";
import { SystemProvider } from "./SystemContext";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <AuthProvider>
    <SystemProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </SystemProvider>
  </AuthProvider>
);

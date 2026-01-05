import type { ReactNode } from "react";

import { DashboardProvider } from "./DashboardContext";
import { SystemProvider } from "./SystemContext";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <SystemProvider>
    <DashboardProvider>{children}</DashboardProvider>
  </SystemProvider>
);

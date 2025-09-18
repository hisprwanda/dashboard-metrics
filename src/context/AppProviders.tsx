import type { ReactNode } from "react";

import { TooltipProvider } from "../components/ui/tooltip";

import { AuthProvider } from "./AuthContext";
import { DashboardProvider } from "./DashboardContext";
import { SystemProvider } from "./SystemContext";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <AuthProvider>
    <SystemProvider>
      <TooltipProvider>
        <DashboardProvider>{children}</DashboardProvider>
      </TooltipProvider>
    </SystemProvider>
  </AuthProvider>
);

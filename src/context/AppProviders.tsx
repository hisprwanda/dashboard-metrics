import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { SystemProvider } from "./SystemContext";
import { TooltipProvider } from "../components/ui/tooltip";
import { DashboardProvider } from "./DashboardContext";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <SystemProvider>
        <TooltipProvider>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </TooltipProvider>
      </SystemProvider>
    </AuthProvider>
  );
}


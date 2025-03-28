import React, { createContext, useContext } from "react";
import { CircularLoader } from "@dhis2/ui";
import { useInitializeSystem } from "../services/systemIdentification";

interface SystemContextProps {
  sqlViewUid: string | null;
  initialized: boolean;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const { sqlViewUid, initialized, loading, error } = useInitializeSystem();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularLoader />
        <p>Initializing system. Please wait...</p>
      </div>
    );
  }

  if (error) {
    return <div>Error during system initialization: {error.message}</div>;
  }

  return (
    <SystemContext.Provider value={{ sqlViewUid, initialized }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = (): SystemContextProps => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error("useSystem must be used within a SystemProvider");
  }
  return context;
};

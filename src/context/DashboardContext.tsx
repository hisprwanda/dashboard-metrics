// file location: src/context/DashboardContext.tsx
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { DashboardConverted } from '@/types/dashboardsType';
import { DateValueType } from "@/types/dashboard-reportType";

// Enhanced state interface with more descriptive naming
interface DashboardState {
  row: DashboardConverted | null;
  value: DateValueType;
  orgUnitPaths: string[];
  orgUnitNames: string[];
  selectedOrgUnitLevel: string; // Added property for the selected org unit level
}

type DashboardAction =
  | { type: 'SET_DASHBOARD'; payload: DashboardConverted; }
  | { type: 'SET_DATE_RANGE'; payload: DateValueType; }
  | { type: 'SET_ORG_UNITS'; payload: { paths: string[]; names: string[]; }; }
  | { type: 'SET_ORG_UNIT_LEVEL'; payload: string; } // Added action for setting org unit level
  | { type: 'RESET'; };

interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Set default date range to last 7 days
const getDefaultDateRange = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  return {
    startDate: sevenDaysAgo,
    endDate: today,
  };
};

const initialState: DashboardState = {
  row: null,
  value: getDefaultDateRange(),
  orgUnitPaths: [],
  orgUnitNames: [],
  selectedOrgUnitLevel: '', // Initialize as empty string
};

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_DASHBOARD':
      return {
        ...state,
        row: action.payload,
      };
    case 'SET_DATE_RANGE':
      return {
        ...state,
        value: action.payload,
      };
    case 'SET_ORG_UNITS':
      return {
        ...state,
        orgUnitPaths: action.payload.paths,
        orgUnitNames: action.payload.names,
      };
    case 'SET_ORG_UNIT_LEVEL':
      return {
        ...state,
        selectedOrgUnitLevel: action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

interface DashboardProviderProps {
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
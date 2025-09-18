// Types for User Engagement feature

export interface UserEngagementData {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  loginPastMonth: number;
  loginTrend: number[];
  lastLogin: Date | null;
  daysSinceLastLogin: number | null;
  accessRecency: "lastWeek" | "lastMonth" | "overMonth" | "never";
  userGroups: { id: string; displayName: string }[];
  organisationUnits: { id: string; displayName: string }[];
}

export interface LoginFrequencyChartData {
  username: string;
  count: number;
}

export interface LoginTrendChartData {
  username: string;
  month1: number;
  month2: number;
  month3: number;
}

export interface AccessRecencySummary {
  lastWeek: number;
  lastMonth: number;
  overMonth: number;
  never: number;
  total: number;
}

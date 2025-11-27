import { Card, Tag } from "@dhis2/ui";

import i18n from "../../../locales";
import type { AccessRecencySummary, UserEngagementData } from "../types/user-engagement";

// Summary cards component for displaying metrics
export function SummaryCards({ data }: { data: UserEngagementData[] }) {
  // Calculate access recency summary
  const accessSummary: AccessRecencySummary = {
    lastWeek: 0,
    lastMonth: 0,
    overMonth: 0,
    never: 0,
    total: data.length,
  };

  // Count users by access recency
  data.forEach((user) => {
    accessSummary[user.accessRecency]++;
  });

  // Calculate percentages
  const lastWeekPercent =
    data.length > 0 ? Math.round((accessSummary.lastWeek / data.length) * 100) : 0;
  const lastMonthPercent =
    data.length > 0 ? Math.round((accessSummary.lastMonth / data.length) * 100) : 0;
  const overMonthPercent =
    data.length > 0 ? Math.round((accessSummary.overMonth / data.length) * 100) : 0;
  const neverPercent = data.length > 0 ? Math.round((accessSummary.never / data.length) * 100) : 0;

  // Calculate total logins in the past month
  const totalLogins = data.reduce((sum, user) => sum + user.loginPastMonth, 0);

  // Calculate average logins per user
  const avgLogins = data.length > 0 ? (totalLogins / data.length).toFixed(1) : "0";

  // Find most active and least active users
  let mostActiveUser = { name: i18n.t("None"), logins: 0 };
  let leastActiveUser = { name: i18n.t("None"), logins: Number.MAX_SAFE_INTEGER };

  data.forEach((user) => {
    if (user.loginPastMonth > mostActiveUser.logins) {
      mostActiveUser = { name: user.fullName, logins: user.loginPastMonth };
    }

    if (user.loginPastMonth < leastActiveUser.logins && user.loginPastMonth > 0) {
      leastActiveUser = { name: user.fullName, logins: user.loginPastMonth };
    }
  });

  // If we didn't find a least active user, set it to none
  if (leastActiveUser.logins === Number.MAX_SAFE_INTEGER) {
    leastActiveUser = { name: i18n.t("None"), logins: 0 };
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <div className="flex justify-between items-start mb-2 p-4">
          <h3 className="text-lg font-medium">{i18n.t("Access Recency")}</h3>
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="space-y-2 p-4 pt-0">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{i18n.t("Last 7 days")}:</span>
              <span className="font-semibold">{lastWeekPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${lastWeekPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{i18n.t("Last 30 days")}:</span>
              <span className="font-semibold">{lastMonthPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${lastMonthPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{i18n.t("Over 30 days")}:</span>
              <span className="font-semibold">{overMonthPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${overMonthPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{i18n.t("Never logged in")}:</span>
              <span className="font-semibold">{neverPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: `${neverPercent}%` }} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-start mb-2 p-4">
          <h3 className="text-lg font-medium">{i18n.t("Login Frequency")}</h3>
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>

        <div className="space-y-3 p-4 pt-0">
          <div>
            <p className="text-sm font-medium">{i18n.t("Total Logins (Past Month)")}</p>
            <p className="text-2xl font-bold text-blue-600">{totalLogins}</p>
          </div>

          <div>
            <p className="text-sm font-medium">{i18n.t("Average Logins Per User")}</p>
            <p className="text-2xl font-bold text-indigo-600">{avgLogins}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-start mb-2 p-4">
          <h3 className="text-lg font-medium">{i18n.t("User Highlights")}</h3>
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>

        <div className="space-y-3 p-4 pt-0">
          <div>
            <p className="text-sm font-medium">{i18n.t("Most Active User")}</p>
            <div className="flex justify-between items-center">
              <p className="text-md truncate">{mostActiveUser.name}</p>
              <Tag positive>
                {mostActiveUser.logins} {i18n.t("logins")}
              </Tag>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">{i18n.t("Least Active User")}</p>
            <div className="flex justify-between items-center">
              <p className="text-md truncate">{leastActiveUser.name}</p>
              <Tag>
                {leastActiveUser.logins} {i18n.t("logins")}
              </Tag>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

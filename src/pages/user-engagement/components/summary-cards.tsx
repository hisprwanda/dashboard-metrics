import { Badge, Card, Progress, Text, Tooltip } from "@mantine/core";
import { IconCalendar, IconChartLine, IconUsers } from "@tabler/icons-react";

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
  let mostActiveUser = { name: "None", logins: 0 };
  let leastActiveUser = { name: "None", logins: Number.MAX_SAFE_INTEGER };

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
    leastActiveUser = { name: "None", logins: 0 };
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card withBorder shadow="sm" radius="md" p="md">
        <div className="flex justify-between items-start mb-2">
          <Text size="lg" weight={500}>
            Access Recency
          </Text>
          <IconCalendar size={20} color="#3b82f6" />
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm">
              <span>Last 7 days:</span>
              <span className="font-semibold">{lastWeekPercent}%</span>
            </div>
            <Progress value={lastWeekPercent} color="green" size="sm" />
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Last 30 days:</span>
              <span className="font-semibold">{lastMonthPercent}%</span>
            </div>
            <Progress value={lastMonthPercent} color="blue" size="sm" />
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Over 30 days:</span>
              <span className="font-semibold">{overMonthPercent}%</span>
            </div>
            <Progress value={overMonthPercent} color="orange" size="sm" />
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Never logged in:</span>
              <span className="font-semibold">{neverPercent}%</span>
            </div>
            <Progress value={neverPercent} color="red" size="sm" />
          </div>
        </div>
      </Card>

      <Card withBorder shadow="sm" radius="md" p="md">
        <div className="flex justify-between items-start mb-2">
          <Text size="lg" weight={500}>
            Login Frequency
          </Text>
          <IconChartLine size={20} color="#3b82f6" />
        </div>

        <div className="space-y-3">
          <div>
            <Text size="sm" weight={500}>
              Total Logins (Past Month)
            </Text>
            <Text size="xl" weight={700} color="blue">
              {totalLogins}
            </Text>
          </div>

          <div>
            <Text size="sm" weight={500}>
              Average Logins Per User
            </Text>
            <Text size="xl" weight={700} color="indigo">
              {avgLogins}
            </Text>
          </div>
        </div>
      </Card>

      <Card withBorder shadow="sm" radius="md" p="md">
        <div className="flex justify-between items-start mb-2">
          <Text size="lg" weight={500}>
            User Highlights
          </Text>
          <IconUsers size={20} color="#3b82f6" />
        </div>

        <div className="space-y-3">
          <div>
            <Text size="sm" weight={500}>
              Most Active User
            </Text>
            <div className="flex justify-between">
              <Text size="md" className="text-ellipsis overflow-hidden">
                {mostActiveUser.name}
              </Text>
              <Badge color="green">{mostActiveUser.logins} logins</Badge>
            </div>
          </div>

          <div>
            <Text size="sm" weight={500}>
              Least Active User
            </Text>
            <div className="flex justify-between">
              <Text size="md" className="text-ellipsis overflow-hidden">
                {leastActiveUser.name}
              </Text>
              <Badge color="yellow">{leastActiveUser.logins} logins</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// file location: src/pages/district-engagement/DistrictEngagementPage.tsx

import DataTable from "./components/data-table";
import TabInfoModal from "../../components/ui/TabInfoModal";

export default function DistrictEngagementPage() {
  const infoContent = (
    <div>
      <p className="mb-4">
        <strong>What This Tab Shows</strong>
      </p>
      <p className="mb-4">
        The District Engagement tab helps you monitor how different districts
        are engaging with dashboards in the system. This view allows you to
        compare engagement levels across all districts and identify areas that
        may need additional support or training.
      </p>

      <p className="mb-4">
        <strong>Understanding Each Column</strong>
      </p>

      <p className="mb-3">
        <strong>Org Unit Name:</strong> The name of the district or
        organizational unit being analyzed.
      </p>

      <p className="mb-3">
        <strong>Total Users:</strong> The total number of registered users
        assigned to this district in the system.
      </p>

      <p className="mb-3">
        <strong>Active Users (30d):</strong> How many users from this district
        have logged in at least once in the last 30 days.
      </p>

      <p className="mb-3">
        <strong>Never Logged In:</strong> The count of users who have been
        assigned to the system but have never accessed it. This helps identify
        users who may need account activation support or training.
      </p>

      <p className="mb-3">
        <strong>Last Activity:</strong> The most recent date when any user from
        this district accessed a dashboard.
      </p>

      <p className="mb-3">
        <strong>Access % (Percentage):</strong> This is calculated as: (Active
        Users ÷ Total Users) × 100. For example, if a district has 50 total
        users and 35 active users, the Access % is 70%. This shows what
        proportion of your users are actually engaging with the system.
      </p>

      <p className="mb-3">
        <strong>Consistently Active:</strong> Shows "Yes" (green) if the
        district has maintained regular activity over time, or "No" (red) if
        activity is sporadic or declining. This helps identify districts with
        sustained engagement.
      </p>

      <p className="mb-3">
        <strong>Dashboard Views:</strong> The total number of times users from
        this district have opened dashboards during the selected period.
      </p>

      <p className="mb-4">
        <strong>Dashboard Access Rate:</strong> Shows the average number of
        dashboard views per active user. Calculated as: Dashboard Views ÷ Active
        Users. A higher rate means users are viewing dashboards more frequently.
      </p>

      <p className="mb-4">
        <strong>How to Use This Data</strong>
      </p>
      <p className="mb-3">
        Look for districts with low <strong>Access %</strong> - these need
        immediate attention. For example, if a district shows only 30% access
        rate, it means 70% of registered users aren't using the system.
      </p>
      <p className="mb-3">
        Check the <strong>Never Logged In</strong> column to identify onboarding
        issues. High numbers here suggest users need account setup help or
        initial training.
      </p>
      <p>
        Compare <strong>Dashboard Views</strong> and{" "}
        <strong>Dashboard Access Rate</strong> across districts to see which
        areas are getting the most value from the system and which might benefit
        from additional training or support.
      </p>
    </div>
  );

  return (
    <div className="mt-4 mx-6">
      <div className="flex justify-end mb-4">
        <TabInfoModal title="District Engagement Guide" content={infoContent} />
      </div>
      <DataTable />
    </div>
  );
}

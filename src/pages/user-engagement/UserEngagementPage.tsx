// file location: src/pages/user-engagement/UserEngagementPage.tsx

import React from "react";

import DataTable from "./components/data-table";
import TabInfoModal from "../../components/ui/TabInfoModal";

export default function UserEngagementPage() {
  const infoContent = (
    <div>
      <p className="mb-4">
        <strong>What This Tab Shows</strong>
      </p>
      <p className="mb-4">
        The User Engagement tab tracks individual user activity within the
        system. This allows you to see who is actively using dashboards and how
        frequently they engage with the platform.
      </p>

      <p className="mb-4">
        <strong>Understanding Each Column</strong>
      </p>

      <p className="mb-3">
        <strong>Username:</strong> The user's login name in the system.
      </p>

      <p className="mb-3">
        <strong>Full Name:</strong> The user's complete name as registered in
        the system.
      </p>

      <p className="mb-3">
        <strong>Role:</strong> The user's assigned role or permission level
        (e.g., Admin, Data Entry, Viewer).
      </p>

      <p className="mb-3">
        <strong>Logins (30d):</strong> The number of times this user has logged
        into the system in the last 30 days. Higher numbers indicate frequent
        system usage.
      </p>

      <p className="mb-3">
        <strong>Login Trend:</strong> A visual bar chart showing login activity
        over the past 3 months. Each bar represents one month, with taller bars
        indicating more logins. This helps you spot increasing or declining
        engagement patterns at a glance.
      </p>

      <p className="mb-3">
        <strong>Last Login:</strong> The most recent date when this user
        accessed the system.
      </p>

      <p className="mb-3">
        <strong>Days Since Login:</strong> How many days have passed since the
        user's last login. Lower numbers mean the user was active recently.
      </p>

      <p className="mb-4">
        <strong>Access Recency:</strong> A quick status indicator showing:
        <br />• <strong style={{ color: "green" }}>Last 7 days</strong> (Green
        badge) - User is very active
        <br />• <strong>Last 30 days</strong> (Gray badge) - User is moderately
        active
        <br />• <strong>Over 30 days</strong> (Gray badge) - User hasn't logged
        in recently
        <br />• <strong style={{ color: "red" }}>Never</strong> (Red badge) -
        User has never logged in
      </p>

      <p className="mb-4">
        <strong>How to Use This Data</strong>
      </p>
      <p className="mb-3">
        Look at <strong>Logins (30d)</strong> and <strong>Login Trend</strong>{" "}
        together to identify your power users - those with high login counts and
        consistent upward trends make excellent system champions.
      </p>
      <p className="mb-3">
        Use <strong>Access Recency</strong> badges to quickly spot inactive
        users. Red "Never" badges indicate users who may need account setup
        help, while "Over 30 days" badges suggest users falling away from the
        system.
      </p>
      <p>
        Monitor the <strong>Login Trend</strong> charts to catch declining
        engagement early. If you see a user's bars getting shorter over the
        three months, reach out to understand if they're facing challenges using
        the system.
      </p>
    </div>
  );

  return (
    <div className="mt-4 mx-6">
      <div className="flex justify-end mb-4">
        <TabInfoModal title="User Engagement Guide" content={infoContent} />
      </div>
      <DataTable />
    </div>
  );
}

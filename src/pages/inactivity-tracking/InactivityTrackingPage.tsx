// file location: src/pages/inactivity-tracking/InactivityTrackingPage.tsx

import React from "react";

import DataTable from "./components/data-table";
import TabInfoModal from "../../components/ui/TabInfoModal";

export default function InactivityTrackingPage() {
  const infoContent = (
    <div>
      <p className="mb-4">
        <strong>What This Tab Shows</strong>
      </p>
      <p className="mb-4">
        The Inactivity Tracking tab identifies users who haven't logged into the
        system recently. This helps you monitor system adoption and reach out to
        users who may need support or re-engagement.
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
        <strong>Role:</strong> The user's assigned role or permission level in
        the system.
      </p>

      <p className="mb-3">
        <strong>Last Login:</strong> The date when this user last accessed the
        system. Shows "Never" if the user has never logged in since account
        creation.
      </p>

      <p className="mb-3">
        <strong>Days Inactive:</strong> The number of days that have passed
        since the user's last login. Higher numbers indicate longer periods of
        inactivity. Shows "N/A" for users who have never logged in.
      </p>

      <p className="mb-4">
        <strong>Status:</strong> A color-coded indicator showing the urgency
        level:
        <br />• <strong style={{ color: "green" }}>Active</strong> - Logged in
        within the last 30 days
        <br />• <strong style={{ color: "orange" }}>Warning</strong> - Inactive
        for 30-60 days, may need a reminder
        <br />• <strong style={{ color: "red" }}>Inactive</strong> - Inactive
        for 60-90 days, needs follow-up
        <br />• <strong style={{ color: "darkred" }}>Critical</strong> -
        Inactive for 90+ days or never logged in, requires immediate attention
      </p>

      <p className="mb-3">
        <strong>Dashboards:</strong> The number of dashboards assigned or
        available to this user. This helps you understand if inactive users have
        sufficient content to engage with.
      </p>

      <p className="mb-4">
        <strong>How to Use This Data</strong>
      </p>

      <p className="mb-3">
        <strong>Priority Action:</strong> Focus first on users with "Critical"
        status (shown in dark red). These users have either never logged in or
        have been inactive for over 90 days and need immediate attention.
      </p>

      <p className="mb-3">
        <strong>For "Never" logged in users:</strong> Check if they received
        their account credentials, verify their email/contact information, and
        consider sending a welcome message with setup instructions.
      </p>

      <p className="mb-3">
        <strong>For users inactive 30-90 days:</strong> Send a reminder email,
        offer refresher training, or check if they're facing technical
        difficulties. Use the <strong>Days Inactive</strong> number to
        personalize your outreach.
      </p>

      <p>
        <strong>For users inactive 90+ days:</strong> Consider scheduling a call
        to understand barriers, verify if they still need access, and offer
        comprehensive re-training. If they no longer need access, work with your
        security team to deactivate the account.
      </p>
    </div>
  );

  return (
    <div className="mt-4 mx-6">
      <div className="flex justify-end mb-4">
        <TabInfoModal title="Inactivity Tracking Guide" content={infoContent} />
      </div>
      <DataTable />
    </div>
  );
}

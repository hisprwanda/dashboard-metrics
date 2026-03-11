// file location: src/pages/home/HomePage.tsx

import DataTable from "./components/data-table";
import TabInfoModal from "../../components/ui/TabInfoModal";

export default function HomePage() {
  const infoContent = (
    <div>
      <p className="mb-4">
        <strong>What This Tab Shows</strong>
      </p>
      <p className="mb-4">
        The Dashboard Usage tab provides an overview of how dashboards are being
        used across your organization. You can see which dashboards are most
        popular and track usage patterns over time.
      </p>

      <p className="mb-4">
        <strong>Understanding Each Column</strong>
      </p>

      <p className="mb-3">
        <strong>Name:</strong> The internal name or identifier of the dashboard
        in the system.
      </p>

      <p className="mb-3">
        <strong>Is Favorite:</strong> Shows "True" if this dashboard has been
        marked as a favorite by users, or "False" if not. Favorite dashboards
        appear at the top of users' dashboard lists for quick access.
      </p>

      <p className="mb-3">
        <strong>Created:</strong> The date when this dashboard was first created
        in the system. This helps you identify newer dashboards versus
        established ones.
      </p>

      <p className="mb-4">
        <strong>Created By:</strong> The name of the user who originally created
        this dashboard. This is helpful for knowing who to contact if you have
        questions about the dashboard's purpose or need modifications.
      </p>

      <p className="mb-4">
        <strong>How to Use This Data</strong>
      </p>

      <p className="mb-3">
        Look at the <strong>Is Favorite</strong> column to identify which
        dashboards users find most valuable. Dashboards marked "True" are ones
        users want quick access to, indicating they're frequently needed.
      </p>

      <p className="mb-3">
        Use the <strong>Created</strong> date to track dashboard lifecycle. Very
        old dashboards might need refreshing or archiving, while new dashboards
        may need more promotion to increase adoption.
      </p>

      <p className="mb-3">
        The <strong>Created By</strong> field helps with governance - you can
        reach out to dashboard owners to ensure their dashboards are still
        relevant and up-to-date.
      </p>

      <p>
        <strong>Tip:</strong> Click the action menu on each row to view more
        details about specific dashboards, see their visualizations, or access
        additional dashboard information.
      </p>
    </div>
  );

  return (
    <div className="mt-10">
      <div className="flex justify-end mb-4 px-4">
        <TabInfoModal title="Dashboard Usage Guide" content={infoContent} />
      </div>
      <DataTable />
    </div>
  );
}

// file location: src/pages/district-engagement/components/table-actions.tsx

import { Button, Menu, Group } from "@mantine/core";
import { IconDots, IconChartBar, IconBuildingCommunity, IconMapPin } from "@tabler/icons-react";

interface DistrictEngagement {
  id: string;
  districtName: string;
  region: string;
  activeUsers: number;
  lastActivity: Date;
  dashboardViews: number;
  reportCompletionRate: number;
  favoriteDashboards: string[];
}

interface TableActionsProps {
  row: DistrictEngagement;
}

export default function TableActions({ row }: TableActionsProps) {
  return (
    <Group spacing="xs" noWrap>
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <Button variant="subtle" p={0}>
            <IconDots />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            icon={<IconChartBar size={14} />}
            onClick={() => console.log("View analytics", row)}
          >
            View Analytics
          </Menu.Item>
          <Menu.Item
            icon={<IconBuildingCommunity size={14} />}
            onClick={() => console.log("View facilities", row)}
          >
            View Facilities
          </Menu.Item>
          <Menu.Item
            icon={<IconMapPin size={14} />}
            onClick={() => console.log("View on map", row)}
          >
            View on Map
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
// file location: src/pages/user-engagement/components/table-actions.tsx

import { Button, Menu, Group } from "@mantine/core";
import { IconDots, IconEye, IconHistory, IconUserCheck } from "@tabler/icons-react";

interface UserEngagement {
  id: string;
  username: string;
  email: string;
  lastLogin: Date;
  sessionCount: number;
  averageSessionDuration: number;
  favoriteViews: string[];
  role: string;
}

interface TableActionsProps {
  row: UserEngagement;
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
          <Menu.Item icon={<IconEye size={14} />} onClick={() => console.log("View details", row)}>
            View Details
          </Menu.Item>
          <Menu.Item icon={<IconHistory size={14} />} onClick={() => console.log("View history", row)}>
            View History
          </Menu.Item>
          <Menu.Item icon={<IconUserCheck size={14} />} onClick={() => console.log("View permissions", row)}>
            View Permissions
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
import { Link, useLocation } from "react-router-dom";

import { Tooltip } from "@dhis2/ui";

export default function HeaderNav() {
  const location = useLocation();
  const { pathname } = location;

  const navLinks = [
    { name: "Dashboard Usage", path: "/", description: "Metrics on dashboard usage patterns" },
    {
      name: "User Engagement",
      path: "/user-engagement",
      description: "Track user activity and engagement metrics",
    },
    {
      name: "District Engagement",
      path: "/district-engagement",
      description: "Monitor engagement across districts",
    },
    {
      name: "Inactivity Tracking",
      path: "/inactivity-tracking",
      description: "Identify and analyze user inactivity",
    },
  ];

  return (
    <header className="w-full bg-[#F3F5F7] shadow-sm">
      <nav className="container mx-auto">
        <ul className="flex w-full flex-wrap md:flex-nowrap">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;

            return (
              <li key={link.path} className="flex-1">
                <Tooltip content={link.description} placement="bottom">
                  <Link
                    to={link.path}
                    className={`
                      flex h-full items-center justify-center border-b-2 px-4 py-4 text-center font-medium transition-colors
                      ${
                        isActive
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    {link.name}
                  </Link>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

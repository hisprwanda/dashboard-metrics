import { Outlet } from "react-router-dom";

import HeaderNav from "./HeaderNav";

export default function MainLayout() {
  return (
    <div>
      <div>
        <HeaderNav />
        <Outlet />
      </div>
    </div>
  );
}

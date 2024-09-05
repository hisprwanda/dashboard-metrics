import React from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function AdminPage() {
  return (
    <div>
      <Link to="/">Go to home Page</Link> <br />
      <h1>
        Admin Page - Only accessible by users with 'ALL' authority <br />
        <Button>Click me ooo</Button>
      </h1>
    </div>
  );
}

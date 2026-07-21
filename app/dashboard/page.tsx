"use client";

import { Suspense } from "react";
import DashboardLayout from "./components/DashboardLayout";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardLayout />
    </Suspense>
  );
}

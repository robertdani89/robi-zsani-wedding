import DashboardShell from "@/components/DashboardShell";
import DashboardTasksPanel from "@/components/DashboardTasksPanel";
import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { useEvent } from "@/context/EventContext";
import { useRouter } from "expo-router";

export default function GuestDashboardScreen() {
  const router = useRouter();
  const { state } = useApp();
  const { activeEvent } = useEvent();

  useEffect(() => {
    const resolvedRole = state.guest?.role ?? activeEvent?.role ?? "guest";

    if (resolvedRole !== "guest") {
      router.replace("/dashboard");
    }
  }, [activeEvent?.role, router, state.guest?.role]);

  return (
    <DashboardShell>
      <DashboardTasksPanel />
    </DashboardShell>
  );
}

import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "./BottomNav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppShell() {
  const { user, loading } = useAuth();
  const [unread, setUnread] = useState(0);
  const [newTickets, setNewTickets] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadCounts = async () => {
      // Unread notifications
      const { count: notifCount } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false)
        .eq("user_id", user.id);

      // New/upcoming tickets (paid or pending, future trips)
      const today = new Date().toISOString().slice(0, 10);
      const { count: ticketCount } = await supabase
        .from("ticket")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", ["pending", "paid"]);

      if (!cancelled) {
        setUnread(notifCount ?? 0);
        setNewTickets(ticketCount ?? 0);
      }
    };

    loadCounts();

    // Listen for new notifications
    const ch1 = supabase
      .channel(`notif-badge-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => loadCounts())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => loadCounts())
      .subscribe();

    // Listen for new tickets
    const ch2 = supabase
      .channel(`ticket-badge-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket", filter: `user_id=eq.${user.id}` },
        () => loadCounts())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-2xl">
        <Outlet />
      </div>
      <BottomNav unreadCount={unread} ticketCount={newTickets} />
    </div>
  );
}

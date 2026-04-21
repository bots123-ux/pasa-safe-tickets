import { useEffect, useRef, useState } from "react";
import { Bell, Ticket, CreditCard, Info, Check, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState, EmptyBellIllustration } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notif {
  id: string;
  type: "booking" | "payment" | "reminder" | "system";
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}
const ICON: Record<Notif["type"], typeof Bell> = {
  booking: Ticket, payment: CreditCard, reminder: Bell, system: Info,
};

export default function Notifications() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showClear, setShowClear] = useState(false);
  // Track IDs we already marked read — prevents infinite loop
  const markedReadRef = useRef<Set<string>>(new Set());

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as Notif[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;

    // Only subscribe to INSERT events — avoids infinite loop from UPDATE (mark-read)
    const ch = supabase
      .channel(`notif-page-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotif = payload.new as Notif;
          // Prepend new notification in real time
          setItems((prev) => [newNotif, ...prev]);
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Mark unread as read — only once per notification ID
  useEffect(() => {
    if (!user || items.length === 0) return;
    const unreadIds = items
      .filter((i) => !i.read && !markedReadRef.current.has(i.id))
      .map((i) => i.id);
    if (unreadIds.length === 0) return;

    // Track them immediately to prevent double-marking
    unreadIds.forEach((id) => markedReadRef.current.add(id));

    supabase.from("notifications").update({ read: true }).in("id", unreadIds).then(() => {
      // Update local state without triggering a re-fetch
      setItems((prev) => prev.map((n) => unreadIds.includes(n.id) ? { ...n, read: true } : n));
    });
  }, [user, items]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) toast.error("Failed to delete.");
    else {
      setItems((prev) => prev.filter((n) => n.id !== id));
      markedReadRef.current.delete(id);
    }
    setDeleting(null);
  };

  const handleClearAll = async () => {
    if (!user) return;
    const { error } = await supabase.from("notifications").delete().eq("user_id", user.id);
    if (error) toast.error("Failed to clear.");
    else {
      setItems([]);
      markedReadRef.current.clear();
      toast.success("All notifications cleared.");
    }
    setShowClear(false);
  };

  return (
    <div className="px-5 py-6">
      <div className="mb-5 flex items-center justify-between animate-fade-in">
        <h1 className="text-2xl font-extrabold">{t("notif.title")}</h1>
        {items.length > 0 && (
          <button onClick={() => setShowClear(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
      ) : items.length === 0 ? (
        <EmptyState illustration={<EmptyBellIllustration />} title={t("notif.empty")} description="We will send updates about your bookings here." />
      ) : (
        <ul className="space-y-3">
          {items.map((n, i) => {
            const Icon = ICON[n.type];
            // Format date in local time (Philippines UTC+8)
            const dateStr = format(new Date(n.created_at), "MMM d, yyyy · h:mm a");
            return (
              <li key={n.id}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border bg-card p-4 transition-all animate-slide-up",
                  n.read ? "border-border" : "border-accent/40 bg-accent/[0.04]",
                )}
                style={{ animationDelay: `${i * 30}ms` }}>
                <div className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                  n.read ? "bg-secondary text-muted-foreground" : "bg-accent text-accent-foreground",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{n.title}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {n.read && <Check className="h-3 w-3 text-muted-foreground" />}
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={deleting === n.id}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        aria-label="Delete notification">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{dateStr}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Clear all confirmation */}
      {showClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm px-6"
          onClick={() => setShowClear(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elevated"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-xl font-extrabold">Clear all notifications?</h3>
            <p className="mb-6 text-sm text-muted-foreground">This will permanently delete all your notifications.</p>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setShowClear(false)}>Cancel</Button>
              <Button variant="destructive" size="lg" className="flex-1" onClick={handleClearAll}>Clear all</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

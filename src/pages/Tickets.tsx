import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Ticket as TicketIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState, EmptyTicketIllustration } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TicketRow {
  id: string;
  seat_number: number;
  status: string;
  price_php: number;
  created_at: string;
  trips: {
    travel_date: string;
    departure_time: string;
    routes: { origin: string; destination: string };
  };
}

export default function Tickets() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("ticket")
        .select("id, seat_number, status, price_php, created_at, trips(travel_date, departure_time, routes(origin, destination))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setTickets((data as unknown as TicketRow[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const now = new Date();
  const isUpcoming = (tr: TicketRow) => {
    const dep = new Date(`${tr.trips.travel_date}T${tr.trips.departure_time}`);
    return dep.getTime() >= now.getTime() && tr.status !== "cancelled";
  };

  const upcoming = tickets.filter(isUpcoming);
  const past = tickets.filter((t) => !isUpcoming(t));
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="px-5 py-6">
      <h1 className="mb-1 text-2xl font-extrabold animate-fade-in">{t("tickets.title")}</h1>
      <p className="mb-5 text-sm text-muted-foreground">Your boarding passes</p>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
        {(["upcoming", "past"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
              tab === k ? "bg-card text-primary shadow-soft" : "text-muted-foreground",
            )}
          >
            {k === "upcoming" ? t("tickets.upcoming") : t("tickets.past")} ({k === "upcoming" ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          illustration={<EmptyTicketIllustration />}
          title={t("tickets.empty")}
          description="Book a Manila ⇄ Baguio trip to get started."
          action={
            <Button asChild variant="navy" size="lg">
              <Link to="/app">{t("home.book")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {list.map((tr, i) => (
            <Link
              key={tr.id}
              to={`/app/tickets/${tr.id}`}
              className="group block animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <article className="overflow-hidden rounded-2xl bg-gradient-ticket text-primary-foreground shadow-navy transition-transform group-hover:-translate-y-0.5">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {format(new Date(tr.trips.travel_date), "EEE, d MMM")} · {tr.trips.departure_time.slice(0, 5)}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xl font-bold">
                      <span>{tr.trips.routes.origin}</span>
                      <ArrowRight className="h-4 w-4 text-accent" />
                      <span>{tr.trips.routes.destination}</span>
                    </div>
                  </div>
                  <TicketIcon className="h-7 w-7 text-accent" />
                </div>
                <div className="border-t border-dashed border-primary-foreground/20 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <Field label="Seat" value={`#${tr.seat_number}`} />
                    <Field label="Status" value={tr.status} />
                    <Field label="Total" value={`₱${Number(tr.price_php).toLocaleString()}`} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-primary-foreground/60">{label}</div>
      <div className="font-bold capitalize">{value}</div>
    </div>
  );
}

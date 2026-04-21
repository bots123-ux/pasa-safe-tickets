import { NavLink } from "react-router-dom";
import { Home, Ticket, Wallet, Bell, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const { t } = useI18n();
  const items = [
    { to: "/app", icon: Home, label: t("nav.home"), end: true },
    { to: "/app/tickets", icon: Ticket, label: t("nav.tickets") },
    { to: "/app/wallet", icon: Wallet, label: t("nav.wallet") },
    { to: "/app/notifications", icon: Bell, label: t("nav.notif"), badge: unreadCount },
    { to: "/app/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg shadow-elevated pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
        {items.map(({ to, icon: Icon, label, end, badge }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "relative flex h-9 w-12 items-center justify-center rounded-xl transition-all",
                      isActive && "bg-accent/20 text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {badge && badge > 0 ? (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    ) : null}
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { useEffect, useState } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, CreditCard, Smartphone, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState, EmptyWalletIllustration } from "@/components/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Tx {
  id: string;
  type: "topup" | "payment" | "refund";
  amount_php: number;
  description: string | null;
  created_at: string;
}

const QUICK_AMOUNTS = [200, 500, 1000, 2000];

export default function Wallet() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [balance, setBalance] = useState<number>(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState<string>("500");
  const [method, setMethod] = useState<"gcash" | "card">("gcash");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: w }, { data: txData }] = await Promise.all([
      supabase.from("wallet").select("balance_php").eq("user_id", user.id).maybeSingle(),
      supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);
    setBalance(Number(w?.balance_php ?? 0));
    setTxs((txData as Tx[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTopup = async () => {
    if (!user) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0 || amt > 50000) {
      toast.error("Enter a valid amount (₱1 – ₱50,000).");
      return;
    }
    setSubmitting(true);
    try {
      const newBal = balance + amt;
      const { error: e1 } = await supabase.from("wallet").update({ balance_php: newBal }).eq("user_id", user.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "topup",
        amount_php: amt,
        description: `Top up via ${method === "gcash" ? "GCash" : "Card"}`,
      });
      if (e2) throw e2;
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "payment",
        title: "Wallet topped up",
        body: `₱${amt.toLocaleString()} added to your wallet.`,
      });
      toast.success(`Added ₱${amt.toLocaleString()} to your wallet`);
      setShowTopup(false);
      setAmount("500");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Top up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-6">
      <h1 className="mb-5 text-2xl font-extrabold animate-fade-in">{t("wallet.title")}</h1>

      {/* Balance card */}
      <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-navy animate-slide-up">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">{t("wallet.balance")}</p>
        {loading ? (
          <div className="mt-2 h-10 w-40 animate-shimmer rounded-lg" />
        ) : (
          <div className="mt-1 text-4xl font-extrabold">₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        )}
        <Button
          variant="hero"
          size="lg"
          className="mt-5 w-full"
          onClick={() => setShowTopup(true)}
        >
          <Plus className="h-5 w-5" /> {t("wallet.topup")}
        </Button>
      </section>

      {/* Transactions */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("wallet.history")}</h2>
        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : txs.length === 0 ? (
          <EmptyState
            illustration={<EmptyWalletIllustration />}
            title={t("wallet.empty")}
            description="Top up to start booking faster."
          />
        ) : (
          <ul className="space-y-2">
            {txs.map((tx) => {
              const positive = tx.amount_php >= 0;
              return (
                <li
                  key={tx.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      positive ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {positive ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{tx.description ?? tx.type}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(tx.created_at), "PP · p")}</div>
                  </div>
                  <div className={cn("font-bold", positive ? "text-success" : "text-foreground")}>
                    {positive ? "+" : ""}₱{Math.abs(tx.amount_php).toLocaleString()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Top-up sheet */}
      {showTopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowTopup(false)}>
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elevated animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">{t("wallet.topup")}</h3>
              <button onClick={() => setShowTopup(false)} className="rounded-full p-2 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={cn(
                    "rounded-xl border-2 py-2 text-sm font-semibold transition-all",
                    Number(amount) === a ? "border-accent bg-accent/10 text-primary" : "border-border hover:border-accent/40",
                  )}
                >
                  ₱{a.toLocaleString()}
                </button>
              ))}
            </div>

            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              max={50000}
              value={amount}
              onChange={(e) => setAmount(e.target.value.slice(0, 6))}
              className="h-12 rounded-xl text-lg font-bold"
            />

            <p className="mb-2 mt-4 text-sm font-semibold">Pay with</p>
            <div className="mb-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setMethod("gcash")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                  method === "gcash" ? "border-accent bg-accent/10" : "border-border",
                )}
              >
                <Smartphone className="h-4 w-4" /> GCash
              </button>
              <button
                onClick={() => setMethod("card")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                  method === "card" ? "border-accent bg-accent/10" : "border-border",
                )}
              >
                <CreditCard className="h-4 w-4" /> Card
              </button>
            </div>

            <Button variant="navy" size="lg" className="w-full" disabled={submitting} onClick={handleTopup}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Top up ₱${Number(amount || 0).toLocaleString()}`}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Demo wallet — no real charges.</p>
          </div>
        </div>
      )}
    </div>
  );
}

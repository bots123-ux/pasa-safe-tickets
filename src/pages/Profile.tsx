import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2, Globe, User as UserIcon, Mail, Phone, FileText, HelpCircle, CreditCard, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardSkeleton } from "@/components/Skeleton";
import { sanitizeText, sanitizePhone } from "@/lib/sanitize";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const nameSchema = z.string().min(2).max(80);
const phoneSchema = z.string().regex(/^\+\d{8,15}$/).or(z.literal(""));

export default function Profile() {
  const { user, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("passenger")
        .select("full_name, email, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      setFullName(data?.full_name ?? "");
      setEmail(data?.email ?? user.email ?? "");
      setPhone(data?.phone ?? "");
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const cleanName = sanitizeText(fullName, 80);
    const cleanPhone = sanitizePhone(phone);
    const nv = nameSchema.safeParse(cleanName);
    if (!nv.success) {
      toast.error("Please enter a valid name (2–80 characters).");
      return;
    }
    const pv = phoneSchema.safeParse(cleanPhone);
    if (!pv.success) {
      toast.error("Phone must be in international format, e.g. +639171234567 — or leave blank.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("passenger")
        .update({ full_name: cleanName, phone: cleanPhone || null, language: lang })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="px-5 py-6">
      <h1 className="mb-5 text-2xl font-extrabold animate-fade-in">{t("profile.title")}</h1>

      {loading ? (
        <CardSkeleton />
      ) : (
        <>
          {/* Avatar block */}
          <section className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 animate-slide-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-2xl font-extrabold text-accent shadow-navy">
              {(fullName || email).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate font-bold">{fullName || "—"}</div>
              <div className="truncate text-sm text-muted-foreground">{email}</div>
            </div>
          </section>

          {/* Form */}
          <section className="mb-6 space-y-4 rounded-2xl border border-border bg-card p-5 animate-slide-up">
            <div className="space-y-1.5">
              <Label htmlFor="pf-name">Full name</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="pf-name" value={fullName} maxLength={80} onChange={(e) => setFullName(e.target.value)} className="h-12 rounded-xl pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="pf-email" value={email} disabled className="h-12 rounded-xl pl-10 bg-secondary" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-phone">Phone</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pf-phone"
                  value={phone}
                  maxLength={16}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 rounded-xl pl-10"
                  placeholder="+639171234567"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Language
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {([
                  { code:"en",  label:"English",     cc:"EN", color:"bg-blue-700" },
                  { code:"fil", label:"Filipino",     cc:"PH", color:"bg-blue-600" },
                  { code:"ceb", label:"Cebuano",      cc:"PH", color:"bg-red-600" },
                  { code:"ilo", label:"Ilocano",      cc:"PH", color:"bg-yellow-600" },
                  { code:"kap", label:"Kapampangan",  cc:"PH", color:"bg-green-700" },
                  { code:"ja",  label:"Japanese",     cc:"JP", color:"bg-red-500" },
                  { code:"ko",  label:"Korean",       cc:"KR", color:"bg-blue-500" },
                  { code:"zh",  label:"Chinese",      cc:"CN", color:"bg-red-600" },
                  { code:"fr",  label:"French",       cc:"FR", color:"bg-indigo-600" },
                  { code:"es",  label:"Spanish",      cc:"ES", color:"bg-yellow-600" },
                  { code:"de",  label:"German",       cc:"DE", color:"bg-gray-800" },
                  { code:"it",  label:"Italian",      cc:"IT", color:"bg-green-700" },
                  { code:"hi",  label:"Hindi",        cc:"IN", color:"bg-orange-500" },
                  { code:"th",  label:"Thai",         cc:"TH", color:"bg-blue-800" },
                  { code:"vi",  label:"Vietnamese",   cc:"VN", color:"bg-red-700" },
                ] as const).map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    style={{ minHeight: 44 }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 px-3 text-sm font-semibold transition-all",
                      lang === l.code ? "border-accent bg-accent/10 text-primary" : "border-border hover:border-accent/40",
                    )}
                  >
                    <span className={`flex h-6 w-7 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold text-white ${l.color}`}>{l.cc}</span>
                    <span className="truncate">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button variant="navy" size="lg" className="w-full" disabled={saving} onClick={handleSave}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.save")}
            </Button>
          </section>

          {/* Quick links */}
          <section className="space-y-1 rounded-2xl border border-border bg-card p-2">
            {[
              {to:"/app/faq",icon:HelpCircle,label:"FAQ"},
              {to:"/app/payment-methods",icon:CreditCard,label:"Payment Methods"},
              {to:"/app/route-map",icon:MapPin,label:"Route Map"},
              {to:"/app/policy",icon:FileText,label:"Privacy Policy"},
            ].map(({to,icon:Icon,label})=>(
              <Link key={to} to={to} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-secondary transition-colors">
                <Icon className="h-4 w-4 text-muted-foreground"/>
                <span className="flex-1 text-sm font-semibold">{label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground"/>
              </Link>
            ))}
          </section>

          <Button variant="outline" size="lg" className="mt-2 w-full text-destructive hover:bg-destructive/5" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> {t("profile.logout")}
          </Button>

          <p className="mt-8 text-center text-xs text-muted-foreground">{t("profile.version")}</p>
        </>
      )}
    </div>
  );
}

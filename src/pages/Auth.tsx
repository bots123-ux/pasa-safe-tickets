import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeEmail, sanitizeText } from "@/lib/sanitize";
import { attemptsRemaining, clearAttempts, getLockRemainingMs, recordFailedAttempt } from "@/lib/loginThrottle";
import { toast } from "sonner";

const emailSchema = z.string().email().max(254);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(128);
const nameSchema = z.string().min(2, "Name is too short").max(80);
type Mode = "signin" | "signup" | "forgot";

function formatTime(ms: number) {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}
function friendlyError(msg: string): string {
  if (!msg) return "Something went wrong. Please try again.";
  if (msg.includes("rate limit")) return "Too many requests. Please wait a few minutes and try again.";
  if (msg.includes("Email not confirmed")) return "Please check your email to confirm your account first.";
  if (msg.includes("Invalid login credentials")) return "Incorrect email or password. Please try again.";
  if (msg.includes("User already registered")) return "This email is already registered. Try signing in instead.";
  if (msg.includes("Password should be")) return "Password must be at least 8 characters.";
  return msg;
}

export default function Auth() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search] = useSearchParams();
  const [mode, setMode] = useState<Mode>(search.get("mode") === "signup" ? "signup" : "signin");
  const [submitting, setSubmitting] = useState(false);
  const [lockMs, setLockMs] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => { if (user) navigate("/app", { replace: true }); }, [user, navigate]);

  useEffect(() => {
    if (email) setLockMs(getLockRemainingMs(email));
  }, [email]);
  useEffect(() => {
    if (lockMs <= 0) return;
    const timer = setInterval(() => { const r = getLockRemainingMs(email); setLockMs(r); if (r <= 0) clearInterval(timer); }, 1000);
    return () => clearInterval(timer);
  }, [lockMs]);
  const isLocked = lockMs > 0 && mode === "signin";

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeEmail(email);
    if (!emailSchema.safeParse(cleanEmail).success) { toast.error("Please enter a valid email."); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: `${window.location.origin}/auth?mode=reset` });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: any) { toast.error(friendlyError(err?.message)); }
    finally { setSubmitting(false); }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const cleanEmail = sanitizeEmail(email);
    if (!emailSchema.safeParse(cleanEmail).success) { toast.error("Please enter a valid email."); return; }
    if (!passwordSchema.safeParse(password).success) { toast.error("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const cleanName = sanitizeText(fullName, 80);
        if (!nameSchema.safeParse(cleanName).success) { toast.error("Name is too short."); setSubmitting(false); return; }
        const { error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { emailRedirectTo: `${window.location.origin}/app`, data: { full_name: cleanName } } });
        if (error) throw error;
        await supabase.auth.signOut();
        toast.success("Account created! Please sign in.");
        setMode("signin"); setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) { const r = recordFailedAttempt(cleanEmail); if (r.locked) setLockMs(r.remainingMs); throw error; }
        clearAttempts(cleanEmail); navigate("/app", { replace: true });
      }
    } catch (err: any) { toast.error(friendlyError(err?.message)); }
    finally { setSubmitting(false); }
  };

  if (mode === "forgot") return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <header className="mb-8 animate-fade-in"><Logo /></header>
        <section className="flex-1">
          <button type="button" onClick={() => { setMode("signin"); setForgotSent(false); }}
            className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </button>
          <h1 className="mb-2 text-3xl font-extrabold">Forgot password?</h1>
          <p className="mb-6 text-sm text-muted-foreground">Enter your email and we will send you a reset link.</p>
          {forgotSent ? (
            <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-6 text-center">
              <div className="mb-3 text-4xl">📧</div>
              <h2 className="mb-1 font-bold text-primary">Check your inbox!</h2>
              <p className="text-sm text-muted-foreground">Reset link sent to <strong>{email}</strong></p>
              <button type="button" onClick={() => { setForgotSent(false); setEmail(""); }}
                className="mt-4 text-xs text-muted-foreground underline hover:text-foreground">Try a different email</button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    maxLength={254} required className="h-12 rounded-xl pl-10" placeholder="you@example.com" />
                </div>
              </div>
              <Button type="submit" variant="navy" size="lg" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <header className="mb-8 animate-fade-in"><Logo /></header>
        <section className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold animate-slide-up">{mode === "signin" ? t("auth.signIn") : t("auth.signUp")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
              <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-semibold text-primary underline-offset-2 hover:underline">
                {mode === "signin" ? t("auth.signUp") : t("auth.signIn")}
              </button>
            </p>
          </div>
          {isLocked && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="text-sm">
                <div className="font-bold text-destructive">{t("auth.lockTitle")}</div>
                <div>{t("auth.lockBody")} <span className="font-mono font-bold">{formatTime(lockMs)}</span></div>
              </div>
            </div>
          )}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("auth.fullName")}</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    maxLength={80} required className="h-12 rounded-xl pl-10" placeholder="Juan Dela Cruz" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} maxLength={254} required className="h-12 rounded-xl pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                {mode === "signin" && (
                  <button type="button" onClick={() => setMode("forgot")} className="text-xs font-semibold text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  maxLength={128} required className="h-12 rounded-xl pl-10 pr-10" placeholder="••••••••" style={{WebkitAppearance:"none"}} />
                <button type="button"
                  onMouseDown={(e) => { e.preventDefault(); setShowPassword(p => !p); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signin" && !isLocked && attemptsRemaining(email) < 5 && (
                <p className="text-xs text-destructive">{attemptsRemaining(email)} attempts remaining before lockout</p>
              )}
            </div>
            <Button type="submit" variant="navy" size="lg" className="w-full" disabled={submitting || isLocked}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
            </Button>
          </form>
        </section>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms. <Link to="/" className="underline">Back to home</Link>
        </p>
      </div>
    </main>
  );
}

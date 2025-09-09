import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { signInWithPassword, signUpWithPassword } from "@/integrations/supabase/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut } from "@/integrations/supabase/api";

export default function Auth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'farmer' | 'vet'>('farmer');
      
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("confirmed") === "1") {
      setTab("login");
      toast({ title: "Email confirmed", description: "Please log in to continue." });
      signOut().catch(() => {});
    }
  }, [location.search]);

  function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNeedConfirm(false);
    const emailNorm = email.trim().toLowerCase();
    if (!isValidEmail(emailNorm)) { setLoading(false); toast({ title: "Invalid email", description: "Enter a valid email address." }); return; }
    try {
      await signInWithPassword(emailNorm, password);
      const prof = await (await import("@/integrations/supabase/api")).getUserProfile();
      toast({ title: "Signed in" });
      navigate(prof?.role === 'vet' ? "/vet" : "/");
    } catch (err: any) {
      const message = err?.message || String(err);
      const lower = (message || "").toLowerCase();
      if (lower.includes("confirm") && lower.includes("email") || lower.includes("not confirmed")) {
        setNeedConfirm(true);
        toast({ title: "Email not confirmed", description: "Please verify your email to sign in." });
      } else if (lower.includes("invalid") && (lower.includes("credentials") || lower.includes("login"))) {
        toast({ title: "Invalid email or password", description: "Please try again." });
      } else if (lower.includes("network") || lower.includes("fetch")) {
        toast({ title: "Network error", description: "Check your connection and try again." });
      } else {
        toast({ title: "Error", description: message });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const emailNorm = email.trim().toLowerCase();
    if (!isValidEmail(emailNorm)) { toast({ title: "Invalid email", description: "Enter a valid email address." }); return; }
    setResendLoading(true);
    try {
      const { resendConfirmation } = await import("@/integrations/supabase/api");
      await resendConfirmation(emailNorm);
      toast({ title: "Verification email sent", description: `Sent to ${emailNorm}` });
    } catch (e: any) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("rate") || msg.includes("limit")) {
        toast({ title: "Too many attempts", description: "Please wait a bit before trying again." });
      } else {
        toast({ title: "Could not resend", description: e?.message || String(e) });
      }
    } finally { setResendLoading(false); }
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    const emailNorm = email.trim().toLowerCase();
    if (!isValidEmail(emailNorm)) { toast({ title: "Invalid email", description: "Enter a valid email address." }); return; }
    const strong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
    if (!strong) {
      toast({ title: "Weak password", description: "Use 8+ chars with letters and numbers." });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match" });
      return;
    }
    const normalizedPhone = phone.replace(/[^0-9]+/g, "");
    if (!normalizedPhone || normalizedPhone.length < 8) {
      toast({ title: "Invalid phone", description: "Enter a valid phone number" });
      return;
    }
    setLoading(true);
    try {
      const exists = await (await import("@/integrations/supabase/api")).emailInUse(emailNorm);
      if (exists) {
        toast({ title: "Account cannot be created as it exists", description: "Use Sign In instead.", variant: "destructive" });
        setTab("login");
        return;
      }
      const { session } = await signUpWithPassword(emailNorm, password, name, role, normalizedPhone);
      if (session) {
        toast({ title: "Account created" });
        navigate(role === 'vet' ? "/vet" : "/");
        return;
      }
      try {
        await signInWithPassword(emailNorm, password);
        toast({ title: "Signed in" });
        navigate(role === 'vet' ? "/vet" : "/");
      } catch (e: any) {
        const msg = e?.message || String(e);
        const low = (msg || '').toLowerCase();
        if (low.includes('confirm') || low.includes('not confirmed')) {
          try {
            const { resendConfirmation } = await import("@/integrations/supabase/api");
            await resendConfirmation(email);
          } catch {}
          toast({ title: "Account already exists", description: "We re-sent the verification email. Please confirm, then sign in.", variant: "destructive" });
          setNeedConfirm(true);
          setTab('login');
        } else if (low.includes('invalid') && (low.includes('credentials') || low.includes('password') || low.includes('login'))) {
          toast({ title: "Account cannot be created as it exists", description: "Use Sign In instead.", variant: "destructive" });
          setTab('login');
        } else {
          toast({ title: "Check your email to confirm", description: `Sent to ${emailNorm}` });
          setNeedConfirm(true);
        }
      }
    } catch (err: any) {
      const message = err?.message || String(err);
      const lower = (message || "").toLowerCase();
      if (lower.includes("already") && ((lower.includes("registered") || lower.includes("exists") || lower.includes("exist")) && lower.includes("phone"))) {
        toast({ title: "Phone already registered", description: "Use a different phone or sign in.", variant: "destructive" });
        setTab("login");
      } else if (lower.includes("duplicate") && (lower.includes("users_phone_key") || lower.includes("phone") || lower.includes("unique constraint"))) {
        toast({ title: "Phone already registered", description: "Use a different phone or sign in.", variant: "destructive" });
        setTab("login");
      } else if (
        lower.includes("already") && (lower.includes("registered") || lower.includes("exists") || lower.includes("exist")) ||
        (lower.includes("duplicate") && (lower.includes("users_email_key") || lower.includes("email") || lower.includes("unique constraint")))
      ) {
        toast({ title: "Account cannot be created as it exists", description: "Use Sign In instead.", variant: "destructive" });
        setTab("login");
      } else {
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[480px,1fr] gap-8 items-stretch">
        <div className="hidden md:flex h-full items-center justify-center rounded-lg border bg-card p-8 shadow-sm">
          <img src="/placeholder.svg" alt="Logo" className="w-full max-w-[420px] h-auto object-contain opacity-95" />
        </div>
        <Card className="w-full max-w-lg h-full mx-auto md:mx-0">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
                          </TabsList>

            <TabsContent value="login" className="mt-4">
              <form className="space-y-3" onSubmit={onLogin}>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" />
                </div>
                <Button className="w-full" type="submit" disabled={loading || !email || !password}>Sign In</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form className="space-y-3" onSubmit={onSignUp}>
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g., 9876543210" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password2">Password</Label>
                  <Input id="password2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as any)} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="role-farmer" value="farmer" />
                      <Label htmlFor="role-farmer">Farmer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="role-vet" value="vet" />
                      <Label htmlFor="role-vet">Vet</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button className="w-full" type="submit" disabled={loading || !email || !password || !confirm}>Create Account</Button>
              </form>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

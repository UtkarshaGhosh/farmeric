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

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      const prof = await (await import("@/integrations/supabase/api")).getUserProfile();
      toast({ title: "Signed in" });
      navigate(prof?.role === 'vet' ? "/vet" : "/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Use at least 6 characters." });
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
      const exists = await (await import("@/integrations/supabase/api")).emailInUse(email);
      if (exists) {
        toast({ title: "Account cannot be created as it exists", description: "Use Sign In instead.", variant: "destructive" });
        setTab("login");
        return;
      }
      const { session } = await signUpWithPassword(email, password, name, role, normalizedPhone);
      toast({ title: session ? "Account created" : "Check your email to confirm" });
      navigate(role === 'vet' ? "/vet" : "/");
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
      <Card className="w-full max-w-md">
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
  );
}

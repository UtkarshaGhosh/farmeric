import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { signInWithPassword, signUpWithPassword, signInWithPhoneOtp, verifyPhoneOtp, signInWithGoogle } from "@/integrations/firebase/api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut } from "@/integrations/firebase/api";

export default function Auth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<"login" | "signup" | "phone">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

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
      toast({ title: "Signed in" });
      navigate("/");
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
    setLoading(true);
    try {
      const { session } = await signUpWithPassword(email, password, name);
      toast({ title: session ? "Account created" : "Check your email to confirm" });
      navigate("/");
    } catch (err: any) {
      const message = err?.message || String(err);
      const lower = (message || "").toLowerCase();
      if (lower.includes("already") && (lower.includes("registered") || lower.includes("exists") || lower.includes("exist"))) {
        toast({ title: "Email already registered", description: "Please sign in with this email.", variant: "destructive" });
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
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="phone">Phone OTP</TabsTrigger>
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
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={async () => { try { setLoading(true); await signInWithGoogle(); navigate("/"); } catch (e:any) { toast({ title: "Error", description: e.message || String(e) }); } finally { setLoading(false); }}}>Continue with Google</Button>
              </div>
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
                  <Label htmlFor="password2">Password</Label>
                  <Input id="password2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••" />
                </div>
                <Button className="w-full" type="submit" disabled={loading || !email || !password || !confirm}>Create Account</Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 555 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                {otpSent && (
                  <div className="space-y-1">
                    <Label htmlFor="otp">OTP Code</Label>
                    <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
                  </div>
                )}
                {!otpSent ? (
                  <Button className="w-full" disabled={loading || !phone} onClick={async () => {
                    try { setLoading(true); await signInWithPhoneOtp(phone); setOtpSent(true); toast({ title: "OTP sent" }); }
                    catch (e:any) { toast({ title: "Error", description: e.message || String(e) }); }
                    finally { setLoading(false); }
                  }}>Send OTP</Button>
                ) : (
                  <Button className="w-full" disabled={loading || !otp} onClick={async () => {
                    try { setLoading(true); await verifyPhoneOtp(phone, otp); navigate("/"); }
                    catch (e:any) { toast({ title: "Error", description: e.message || String(e) }); }
                    finally { setLoading(false); }
                  }}>Verify & Continue</Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

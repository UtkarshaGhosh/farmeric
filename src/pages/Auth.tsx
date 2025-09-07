import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailOtp, signInWithPhoneOtp, verifyPhoneOtp } from "@/integrations/supabase/api";
import { Link } from "react-router-dom";

export default function Auth() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailOtp(email);
      toast({ title: "Magic link sent", description: "Check your email to complete sign-in." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function onPhoneRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithPhoneOtp(phone);
      setOtpSent(true);
      toast({ title: "OTP sent", description: "Enter the code you received via SMS." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyPhoneOtp(phone, code);
      toast({ title: "Signed in", description: "You are now signed in." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use email magic link or phone OTP</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <form className="space-y-3" onSubmit={onEmailSubmit}>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <Button className="w-full" type="submit" disabled={loading || !email}>Send Magic Link</Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-4">
              {!otpSent ? (
                <form className="space-y-3" onSubmit={onPhoneRequest}>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone (E.164)</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+1 555 123 4567" />
                  </div>
                  <Button className="w-full" type="submit" disabled={loading || !phone}>Send OTP</Button>
                </form>
              ) : (
                <form className="space-y-3" onSubmit={onVerifyCode}>
                  <div className="space-y-1">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="123456" />
                  </div>
                  <Button className="w-full" type="submit" disabled={loading || !code}>Verify & Sign In</Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
          <div className="text-xs text-muted-foreground mt-4 text-center">
            <Link to="/">Back to app</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

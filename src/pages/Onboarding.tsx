import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { upsertUserProfile } from "@/integrations/supabase/api";
import { useNavigate } from "react-router-dom";
import { useI18n, LANGUAGES } from "@/lib/i18n";

export default function Onboarding() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [stateName, setStateName] = useState("");
  const [language, setLanguage] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !district || !language) {
      toast({ title: "Fill required fields", description: "Name, district and language are required" });
      return;
    }
    const normalizedPhone = phone.replace(/[^0-9]+/g, "");
    if (!normalizedPhone || normalizedPhone.length < 8) {
      toast({ title: "Invalid phone", description: "Enter a valid phone number" });
      return;
    }
    setLoading(true);
    try {
      const profile = await upsertUserProfile({ name, location: { district, village, state: stateName }, language_preference: language, phone: normalizedPhone });
      toast({ title: "Profile saved" });
      navigate(profile?.role === 'vet' ? "/vet" : "/farm-setup");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("onboarding.welcome","Welcome")}</CardTitle>
          <CardDescription>{t("onboarding.setupProfile","Let's set up your profile")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1">
              <Label htmlFor="name">{t("onboarding.fullName","Full Name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t("ph.name","Your name")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="district">{t("common.district","District")}</Label>
                <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required placeholder={t("common.district","District")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="village">{t("common.village","Village")}</Label>
                <Input id="village" value={village} onChange={(e) => setVillage(e.target.value)} placeholder={t("common.village","Village")} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">{t("common.state","State")}</Label>
              <Input id="state" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder={t("common.state","State")} />
            </div>
            <div className="space-y-1">
              <Label>{t("common.preferredLanguage","Preferred Language")}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.selectLanguage","Select language")} />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l)=> (
                    <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">{t("common.phone","Phone")}</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder={t("ph.phone","e.g., 9876543210")} />
            </div>
            <Button className="w-full" type="submit" disabled={loading || !name || !district || !language || !phone}>{t("common.continue","Continue")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

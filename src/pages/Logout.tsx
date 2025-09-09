import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/integrations/supabase/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await signOut();
      } finally {
        if (mounted) navigate("/auth", { replace: true });
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("logout.signingOut","Signing out")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("logout.pleaseWait","Please wait while we log you out…")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;

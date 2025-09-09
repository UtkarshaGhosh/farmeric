import { LANGUAGES, useI18n } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="fixed top-3 right-3 z-50 w-[180px]">
      <Select value={lang} onValueChange={(v) => setLang(v as any)}>
        <SelectTrigger aria-label="Language">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

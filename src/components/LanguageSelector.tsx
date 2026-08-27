import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en" as const, label: "English", native: "English" },
  { code: "od" as const, label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "hi" as const, label: "Hindi", native: "हिन्दी" },
];

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="size-4 text-muted-foreground" />
      <div className="flex rounded-lg border border-border bg-background overflow-hidden">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              locale === lang.code
                ? "bg-green-700 text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {lang.native}
          </button>
        ))}
      </div>
    </div>
  );
}

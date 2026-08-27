import { useNavigate } from "react-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Sprout, CloudRain, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: CloudRain,
      title: t("landing.features.weather"),
      desc: t("landing.features.weatherDesc"),
    },
    {
      icon: Sprout,
      title: t("landing.features.advisory"),
      desc: t("landing.features.advisoryDesc"),
    },
    {
      icon: TrendingUp,
      title: t("landing.features.market"),
      desc: t("landing.features.marketDesc"),
    },
    {
      icon: ShieldCheck,
      title: t("landing.features.risk"),
      desc: t("landing.features.riskDesc"),
    },
  ];

  const steps = [
    { num: "1", title: t("landing.howItWorks.step1"), desc: t("landing.howItWorks.step1Desc") },
    { num: "2", title: t("landing.howItWorks.step2"), desc: t("landing.howItWorks.step2Desc") },
    { num: "3", title: t("landing.howItWorks.step3"), desc: t("landing.howItWorks.step3Desc") },
    { num: "4", title: t("landing.howItWorks.step4"), desc: t("landing.howItWorks.step4Desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="size-5 text-green-700" />
            <span className="font-semibold text-foreground">{t("app.name")}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-14 pb-14 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-medium mb-5">
          {t("app.subtitle")}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug max-w-2xl">
          {t("landing.hero.title")}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xl">
          {t("landing.hero.subtitle")}
        </p>

        <div className="flex flex-wrap gap-3 mt-7">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800 transition-colors"
          >
            {t("landing.hero.cta")}
            <ArrowRight className="size-4" />
          </button>
          <button
            onClick={() => navigate("/officer")}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border bg-card text-foreground rounded-lg font-medium text-sm hover:bg-muted transition-colors"
          >
            {t("landing.hero.ctaOfficer")}
          </button>
        </div>

        <div className="mt-6 px-3 py-2 bg-muted/50 border border-border rounded max-w-md">
          <span className="text-xs text-muted-foreground">{t("common.demoMode")}</span>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-14 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 border border-border bg-card rounded-lg"
              >
                <div className="shrink-0 size-9 rounded bg-green-50 border border-green-100 flex items-center justify-center">
                  <f.icon className="size-4.5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-14 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-bold text-foreground mb-6">{t("landing.howItWorks.title")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="p-4 border border-border bg-card rounded-lg">
                <div className="size-7 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold mb-3">
                  {step.num}
                </div>
                <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo narrative */}
      <section className="px-4 py-14 border-t border-border bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-bold text-foreground mb-2">Demo scenario: Ramesh from Sambalpur</h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mb-6">
            Ramesh is a small paddy farmer in Ainthapali. Krishi Saathi pulls live weather
            data for his location, detects that rainfall is 32% below the seasonal norm,
            and tells him to irrigate within two days. It compares paddy prices across
            nearby mandis. At the same time, it calculates his financial distress risk
            from the rainfall gap, falling paddy prices, and his loan due in 12 days —
            and surfaces him as high-priority on the agriculture officer's dashboard,
            with the exact reasons explained.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800 transition-colors"
          >
            View the demo
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="size-4 text-green-700" />
            <span className="font-semibold text-sm">{t("app.name")}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mb-2">
            {t("landing.footer.disclaimer")}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t("landing.footer.dataNote")}
          </p>
        </div>
      </footer>
    </div>
  );
}

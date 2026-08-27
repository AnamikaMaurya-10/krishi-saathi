import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Sprout, CloudRain, TrendingUp, ShieldCheck, ArrowRight, ChevronRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#f8faf6]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="size-6 text-green-700" />
            <span className="font-bold text-foreground text-lg tracking-tight">{t("app.name")}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-12 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-4">
            {t("app.subtitle")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight max-w-2xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl">
            {t("landing.hero.subtitle")}
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 transition-colors"
            >
              {t("landing.hero.cta")}
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => navigate("/officer")}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-card text-foreground rounded-xl font-semibold text-sm hover:bg-muted transition-colors"
            >
              {t("landing.hero.ctaOfficer")}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg max-w-md">
            <span className="text-xs text-amber-700">📋 {t("common.demoMode")}</span>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex gap-4 p-5 rounded-xl border border-border bg-background"
              >
                <div className="shrink-0 size-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <f.icon className="size-5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-8">{t("landing.howItWorks.title")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="relative p-4 rounded-xl border border-border bg-card">
                <div className="size-8 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-bold mb-3">
                  {step.num}
                </div>
                <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden sm:block absolute top-8 -right-3 size-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Farmer */}
      <section className="px-4 py-16 bg-green-700 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">Demo Flow: Ramesh from Sambalpur</h2>
          <p className="text-sm text-green-100 max-w-lg mx-auto leading-relaxed mb-6">
            Ramesh opens KrishiSaathi, the system fetches real weather data for Sambalpur,
            identifies below-normal rainfall, generates irrigation advice, calculates his
            distress risk score — and alerts the agriculture officer automatically.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors"
          >
            Try the Demo
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="size-5 text-green-700" />
            <span className="font-bold text-sm">{t("app.name")}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mb-3">
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

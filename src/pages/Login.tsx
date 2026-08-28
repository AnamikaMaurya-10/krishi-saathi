import { Sprout, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <Sprout className="size-5 text-green-700" />
            <span className="font-semibold text-foreground">KrishiSaathi</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-medium mb-4">
              Demo Mode
            </div>
            <h1 className="text-xl font-bold text-foreground">Welcome to KrishiSaathi</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Smart Crop Advisory &amp; Farmer Distress Early-Warning System
            </p>
          </div>

          <div className="space-y-3">
            {/* Farmer Card */}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-4 p-4 border border-border bg-card rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors text-left group"
            >
              <div className="shrink-0 size-11 rounded-full bg-green-100 border border-green-200 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Sprout className="size-5 text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Login as Farmer</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View crop advisory, weather, market prices &amp; risk score
                </p>
              </div>
              <span className="text-muted-foreground group-hover:text-green-700 transition-colors text-lg">
                →
              </span>
            </button>

            {/* Officer Card */}
            <button
              onClick={() => navigate("/officer")}
              className="w-full flex items-center gap-4 p-4 border border-border bg-card rounded-lg hover:bg-amber-50 hover:border-amber-200 transition-colors text-left group"
            >
              <div className="shrink-0 size-11 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <ShieldCheck className="size-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Login as Officer</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monitor farmer risk, view alerts &amp; intervention suggestions
                </p>
              </div>
              <span className="text-muted-foreground group-hover:text-amber-700 transition-colors text-lg">
                →
              </span>
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground/70 mt-8">
            This is a demo application. No authentication is required.
          </p>
        </div>
      </main>
    </div>
  );
}

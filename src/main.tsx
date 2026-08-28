import { Toaster } from "@/components/ui/sonner";
import React, { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ChatBot } from "@/components/ChatBot";
import "./index.css";

// Lazy load route components
const Landing = lazy(() => import("./pages/Landing.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const FarmerDashboard = lazy(() => import("./pages/FarmerDashboard.tsx"));
const WeatherPage = lazy(() => import("./pages/WeatherPage.tsx"));
const MarketPage = lazy(() => import("./pages/MarketPage.tsx"));
const OfficerDashboard = lazy(() => import("./pages/OfficerDashboard.tsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
    </div>
  );
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[Root] Runtime crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Application error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<FarmerDashboard />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/market" element={<MarketPage />} />
              <Route path="/officer" element={<OfficerDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
        <ChatBot />
      </LanguageProvider>
    </RootErrorBoundary>
  </StrictMode>,
);

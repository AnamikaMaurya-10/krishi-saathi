import { useNavigate, useLocation } from "react-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, Cloud, ShoppingCart, BarChart3, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", icon: Home, labelKey: "nav.home" },
  { path: "/weather", icon: Cloud, labelKey: "nav.weather" },
  { path: "/market", icon: ShoppingCart, labelKey: "nav.market" },
  { path: "/officer", icon: BarChart3, labelKey: "nav.officer" },
  { path: "/profile", icon: User, labelKey: "nav.profile" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
                isActive ? "text-green-700" : "text-muted-foreground"
              }`}
            >
              <item.icon className="size-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

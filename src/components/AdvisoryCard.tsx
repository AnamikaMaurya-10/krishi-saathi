import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { speak, stop, isSpeaking } from "@/services/voiceService";
import { getAdvisoryText, getSeverityColor, getSeverityIcon, type Advisory } from "@/services/advisoryEngine";
import { Volume2, VolumeX } from "lucide-react";

interface AdvisoryCardProps {
  advisory: Advisory;
}

export function AdvisoryCard({ advisory }: AdvisoryCardProps) {
  const { locale } = useLanguage();
  const [speaking, setSpeaking] = useState(false);

  const text = getAdvisoryText(advisory, locale);
  const severityStyles = getSeverityColor(advisory.severity);
  const icon = getSeverityIcon(advisory.severity);

  const handleSpeak = () => {
    if (speaking) {
      stop();
      setSpeaking(false);
    } else {
      speak(text, locale);
      setSpeaking(true);
    }
  };

  return (
    <div className={`rounded-xl border p-4 ${severityStyles}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">{icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {advisory.type === "irrigation" && "💧 Irrigation"}
              {advisory.type === "drainage" && "🌊 Drainage"}
              {advisory.type === "heat" && "🌡️ Heat"}
              {advisory.type === "market" && "📊 Market"}
              {advisory.type === "general" && "📋 General"}
              {advisory.type === "alert" && "⚡ Alert"}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{text}</p>
          <p className="text-xs mt-2 opacity-70">
            <strong>Action:</strong> {advisory.action}
          </p>
        </div>

        <button
          onClick={handleSpeak}
          className="shrink-0 p-2 rounded-lg hover:bg-black/5 transition-colors"
          title="Listen"
        >
          {speaking ? (
            <VolumeX className="size-5" />
          ) : (
            <Volume2 className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}

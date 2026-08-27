import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { speak, stop } from "@/services/voiceService";
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
    <div className={`rounded-lg border p-3.5 ${severityStyles}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">{icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
              {advisory.type === "irrigation" && "\uD83D\uDCA7 Irrigation"}
              {advisory.type === "drainage" && "\uD83C\uDF0A Drainage"}
              {advisory.type === "heat" && "\uD83C\uDF21\uFE0F Heat"}
              {advisory.type === "market" && "\uD83D\uDCCA Market"}
              {advisory.type === "general" && "\uD83D\uDCCB General"}
              {advisory.type === "alert" && "\u26A1 Alert"}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{text}</p>
          <p className="text-xs mt-1.5 opacity-70">
            <strong>Action:</strong> {advisory.action}
          </p>
        </div>

        <button
          onClick={handleSpeak}
          className="shrink-0 p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Listen"
        >
          {speaking ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

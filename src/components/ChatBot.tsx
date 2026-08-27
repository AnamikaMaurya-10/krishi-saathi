import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/hooks/useWeather";
import { SAMPLE_FARMERS } from "@/data/farmers";
import { getCropById, getCropStage } from "@/data/crops";
import { getPriceChangePercent } from "@/data/marketPrices";
import { calculateDistressScore } from "@/services/riskCalculator";
import { calculateRainfallDeviation, getForecastRainfallTotal } from "@/services/weatherService";
import { getNormalRainfall } from "@/data/rainNormals";
import { handleChat, type ChatMessage } from "@/services/chatbotService";
import { HELPLINES, type Helpline } from "@/data/helplines";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Sprout,
  CloudRain,
  TrendingUp,
  Wheat,
  Landmark,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

const farmer = SAMPLE_FARMERS[0]; // Ramesh Kumar

function HelplineCard({ helpline, locale }: { helpline: Helpline; locale: string }) {
  const name = locale === "od" ? helpline.nameOdia : locale === "hi" ? helpline.nameHindi : helpline.name;
  const desc = locale === "od" ? helpline.descriptionOdia : locale === "hi" ? helpline.descriptionHindi : helpline.description;
  
  return (
    <div className="p-2.5 border border-border bg-card rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Phone className="size-3.5 text-green-700 shrink-0" />
        <p className="text-xs font-semibold text-foreground">{name}</p>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-1.5">{desc}</p>
      <div className="flex items-center justify-between">
        <a
          href={`tel:${helpline.phone.replace(/[^0-9]/g, "")}`}
          className="text-xs font-medium text-green-700 underline"
        >
          📞 {helpline.phone}
        </a>
        <span className="text-[10px] text-muted-foreground">{helpline.available}</span>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { icon: CloudRain, label: "Weather", labelOdia: "ପାଗ", labelHindi: "मौसम", query: "What's the weather today?" },
  { icon: Sprout, label: "Irrigation", labelOdia: "ଜଳସେଚନ", labelHindi: "सिंचाई", query: "Should I irrigate my field?" },
  { icon: Wheat, label: "Crop Advice", labelOdia: "ଫସଲ ପରାମର୍ଶ", labelHindi: "फसल सलाह", query: "What should I do for my crop?" },
  { icon: TrendingUp, label: "Market Prices", labelOdia: "ବାଜାର", labelHindi: "बाज़ार", query: "What are the current mandi prices?" },
  { icon: Landmark, label: "Schemes", labelOdia: "ଯୋଜନା", labelHindi: "योजनाएं", query: "What government schemes can I get?" },
  { icon: ShieldCheck, label: "Risk Score", labelOdia: "ବିପଦ", labelHindi: "जोखिम", query: "What is my risk score?" },
  { icon: HelpCircle, label: "Talk to Expert", labelOdia: "ବିଶେଷଜ୍ଞ", labelHindi: "विशेषज्ञ", query: "I need to talk to an expert" },
];

export function ChatBot() {
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { weather } = useWeather(farmer.location.lat, farmer.location.lng, farmer.district);

  // Compute risk data
  const riskData = (() => {
    const rainfallDeviation = farmer.rainfallDeviation;
    const priceDecline = getPriceChangePercent(farmer.crop);
    const loanDue = new Date(farmer.loanDueDate);
    const daysUntilLoan = Math.floor((loanDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return calculateDistressScore(rainfallDeviation, priceDecline, daysUntilLoan);
  })();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Send welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0 && weather) {
      const rainfallDeviation = farmer.rainfallDeviation;
      const priceDecline = getPriceChangePercent(farmer.crop);
      const loanDue = new Date(farmer.loanDueDate);
      const daysUntilLoan = Math.floor((loanDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const ctx = {
        farmer,
        weather: {
          temperature: weather.current.temperature,
          humidity: weather.current.humidity,
          precipitation: weather.current.precipitation,
          windSpeed: weather.current.windSpeed,
          rainfallDeviation,
        },
        riskScore: riskData.totalScore,
        riskCategory: riskData.category,
      };

      const { message } = handleChat("hello", ctx, locale as "en" | "od" | "hi");
      setMessages([{
        id: "welcome",
        role: "assistant",
        text: message,
        timestamp: Date.now(),
      }]);
    }
  }, [isOpen, messages.length, weather, locale, riskData]);

  const sendMessage = (text: string) => {
    if (!text.trim() || !weather) return;

    const rainfallDeviation = farmer.rainfallDeviation;
    const priceDecline = getPriceChangePercent(farmer.crop);
    const loanDue = new Date(farmer.loanDueDate);
    const daysUntilLoan = Math.floor((loanDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const ctx = {
      farmer,
      weather: {
        temperature: weather.current.temperature,
        humidity: weather.current.humidity,
        precipitation: weather.current.precipitation,
        windSpeed: weather.current.windSpeed,
        rainfallDeviation,
      },
      riskScore: riskData.totalScore,
      riskCategory: riskData.category,
    };

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate brief "thinking" delay for natural feel
    setTimeout(() => {
      const { message, showHelplines } = handleChat(text, ctx, locale as "en" | "od" | "hi");

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: message,
        timestamp: Date.now(),
        showHelplines,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 400 + Math.random() * 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quickActionLabel = (action: typeof QUICK_ACTIONS[0]) => {
    if (locale === "od") return action.labelOdia;
    if (locale === "hi") return action.labelHindi;
    return action.label;
  };

  // Parse markdown-ish bold in messages
  const renderMessageText = (text: string) => {
    // Split into paragraphs and render
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold: **text**
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        // Italic: _text_
        const italicParts = part.split(/(_.*?_)/g).map((ip, k) => {
          if (ip.startsWith("_") && ip.endsWith("_")) {
            return <em key={k} className="italic text-muted-foreground">{ip.slice(1, -1)}</em>;
          }
          return ip;
        });
        return <span key={j}>{italicParts}</span>;
      });
      if (line === "") return <br key={i} />;
      return <p key={i} className="leading-relaxed">{parts}</p>;
    });
  };

  // Determine if we should show helplines after a message
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
  const showHelplinesNow = lastAssistantMsg?.showHelplines && !isTyping;
  const relevantHelplines = showHelplinesNow
    ? HELPLINES.filter(h => h.type === "mental_health" || h.type === "emergency" || h.type === "agriculture")
    : [];

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-50 size-14 rounded-full bg-green-700 text-white shadow-lg hover:bg-green-800 transition-all flex items-center justify-center"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="size-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[380px] h-[100dvh] sm:h-[560px] sm:bottom-20 sm:right-4 sm:rounded-xl border border-border bg-background flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="size-9 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
              <Sprout className="size-4.5 text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {locale === "od" ? "କୃଷି ସାଥୀ ସହାୟକ" : locale === "hi" ? "कृषि साथी सहायक" : "Krishi Saathi Assistant"}
              </p>
              <p className="text-[10px] text-green-600">
                {locale === "od" ? "ଅନଲାଇନ" : locale === "hi" ? "ऑनलाइन" : "Online"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              aria-label="Close chat"
            >
              <X className="size-5 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                    msg.role === "user"
                      ? "bg-green-700 text-white rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? renderMessageText(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Helpline cards */}
            {relevantHelplines.length > 0 && (
              <div className="space-y-2">
                {relevantHelplines.map(h => (
                  <HelplineCard key={h.id} helpline={h} locale={locale} />
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions (show only when few messages) */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 border-t border-border/50 overflow-x-auto">
              <div className="flex gap-1.5 pb-1">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.query)}
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <action.icon className="size-3 text-green-700" />
                    {quickActionLabel(action)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-3 py-2.5 border-t border-border flex items-center gap-2 shrink-0 bg-card"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                locale === "od" ? "ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ..." :
                locale === "hi" ? "अपना सवाल लिखें..." :
                "Type your question..."
              }
              className="flex-1 text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-green-700"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="size-9 rounded-lg bg-green-700 text-white flex items-center justify-center hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/**
 * Chatbot Service
 * 
 * Rule-based agricultural chatbot that:
 * - Answers common farmer questions about weather, crop, market, irrigation
 * - Provides contextual advice based on farmer profile and live data
 * - Escalates to human experts when the situation is beyond basic advice
 * - Detects distress signals and provides helpline numbers
 * 
 * Does NOT use any external AI API. All logic is deterministic and explainable.
 */

import type { Locale } from "./i18n";
import type { Farmer } from "@/data/farmers";
import { getCropById, getCropStage } from "@/data/crops";
import { getMarketPrices, getPriceChangePercent } from "@/data/marketPrices";
import { getRainData, getNormalRainfall } from "@/data/rainNormals";
import { calculateDistressScore, getMainRiskReasons } from "./riskCalculator";
import { calculateRainfallDeviation } from "./weatherService";
import { HELPLINES, getEscalationMessage } from "@/data/helplines";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  /** Whether this message includes helpline escalation */
  isEscalation?: boolean;
  /** Whether to show expert contact cards */
  showHelplines?: boolean;
}

interface ChatContext {
  farmer: Farmer;
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    rainfallDeviation: number;
  } | null;
  riskScore: number;
  riskCategory: string;
}

// Distress keyword detection (multilingual)
const DISTRESS_KEYWORDS = {
  en: ["suicide", "end my life", "kill myself", "cant go on", "cannot go on", "hopeless", "no way out", "better off dead", "want to die", "ending it", "give up on life", "dont want to live", "don't want to live", "too much debt", "cant repay", "cant pay", "unable to pay", "will lose everything", "desperate", "help me please", "sos", "emergency", "urgent help"],
  od: ["ଆତ୍ମହତ୍ୟା", "ଜୀବନ ଶେଷ", "ଆଉ ବଞ୍ଚିବାକୁ ଚାହେଁନି", "ନିରାଶ", "କୌଣସି ଉପାୟ ନାହିଁ", "ସାହାଯ୍ୟ କରନ୍ତୁ", "ଅତ୍ୟଧିକ ଋଣ", "ଋଣ ଫେରାଇ ପାରୁନି"],
  hi: ["आत्महत्या", "जीवन समाप्त", "नहीं जीना चाहता", "निराश", "कोई रास्ता नहीं", "बहुत कर्ज", "ऋण नहीं चुका पा रहा", "सब खत्म", "मदद करो", "बचाओ"],
};

// Intent patterns per locale
interface IntentPattern {
  intent: string;
  patterns: RegExp[];
}

const INTENT_PATTERNS: Record<Locale, IntentPattern[]> = {
  en: [
    { intent: "greeting", patterns: [/^(hi|hello|hey|namaskar|good\s*(morning|afternoon|evening)|namaste)/i] },
    { intent: "weather", patterns: [/weather|temperature|rain|forecast|mausam|barish|temperature kitna/i] },
    { intent: "irrigation", patterns: [/irrigat|water|pani|sinch|field water|khet mein paani|should i irrigate/i] },
    { intent: "market", patterns: [/price|mandi|sell|market|rate|kitne me bik|bech/i] },
    { intent: "crop_advice", patterns: [/crop|advice|suggestion|kya kar|what should|fertiliz|pest|disease|crop stage|growth/i] },
    { intent: "loan", patterns: [/loan|debt|emi|repay|credit|karj|rin|kitna bakaya/i] },
    { intent: "scheme", patterns: [/scheme|subsidy|government|yojana|pmfby|pm-kisan|help.*govt/i] },
    { intent: "risk", patterns: [/risk|score|distress|danger|khatra|danger level/i] },
    { intent: "soil", patterns: [/soil|mitti|ph value|nitrogen|npk|fertilizer dose/i] },
    { intent: "expert", patterns: [/expert|officer|contact|speak.*person|talk.*someone|human|agent|help.*call/i] },
    { intent: "help", patterns: [/help|madad|sahayata|挽救|help me/i] },
  ],
  od: [
    { intent: "greeting", patterns: [/^(ନମସ୍କାର|ହେଲୋ|hi)/i] },
    { intent: "weather", patterns: [/ପାଗ|ତାପମାନ|ବର୍ଷା|ପାଣି ପାଗ/i] },
    { intent: "irrigation", patterns: [/ଜଳସେଚନ|ପାଣି|ଖେତରେ ପାଣି|sinch/i] },
    { intent: "market", patterns: [/ମୂଲ୍ୟ|ମାଁଡି|ବିକ୍ରୟ|ରେଟ|ଦାମ/i] },
    { intent: "crop_advice", patterns: [/ଫସଲ|ପରାମର୍ଶ|ସାର|ପୋକ|ରୋଗ/i] },
    { intent: "loan", patterns: [/ଋଣ|କର୍ଜ|ଏମଆଇ|ପରିଶୋଧ/i] },
    { intent: "scheme", patterns: [/ଯୋଜନା|ସରକାରୀ|ସବସିଡି/i] },
    { intent: "expert", patterns: [/ବିଶେଷଜ୍ଞ|ଅଧିକାରୀ|ଯୋଗାଯୋଗ|କଲ୍/i] },
    { intent: "help", patterns: [/ସାହାଯ୍ୟ|ମଦଦ|ବଞ୍ଚାଅ/i] },
  ],
  hi: [
    { intent: "greeting", patterns: [/^(नमस्ते|नमस्कार|हेलो|hi)/i] },
    { intent: "weather", patterns: [/मौसम|तापमान|बारिश|पानी|बरसात/i] },
    { intent: "irrigation", patterns: [/सिंचाई|पानी|खेत में पानी|sinch/i] },
    { intent: "market", patterns: [/मूल्य|भाव|मंडी|बेच|रेट|कितने में/i] },
    { intent: "crop_advice", patterns: [/फसल|सलाह|खाद|कीट|रोग|बीज/i] },
    { intent: "loan", patterns: [/ऋण|कर्ज|लोन|EMI|चुकौती|कितना बाकी/i] },
    { intent: "scheme", patterns: [/योजना|सरकारी|सब्सिडी|PMFBY|PM-KISAN/i] },
    { intent: "expert", patterns: [/विशेषज्ञ|अधिकारी|संपर्क|बात.*व्यक्ति|इंसान/i] },
    { intent: "help", patterns: [/मदद|सहायता|बचाओ|HELP/i] },
  ],
};

function detectIntent(text: string, locale: Locale): string {
  const patterns = INTENT_PATTERNS[locale] || INTENT_PATTERNS.en;
  for (const { intent, patterns: pats } of patterns) {
    for (const pat of pats) {
      if (pat.test(text)) return intent;
    }
  }
  return "unknown";
}

function detectDistress(text: string, locale: Locale): boolean {
  const lower = text.toLowerCase();
  const keywords = DISTRESS_KEYWORDS[locale] || DISTRESS_KEYWORDS.en;
  return keywords.some(k => lower.includes(k.toLowerCase()));
}

function getLocalizedText(en: string, od: string, hi: string, locale: Locale): string {
  if (locale === "od") return od;
  if (locale === "hi") return hi;
  return en;
}

// --- Response generators per intent ---

function greetingResponse(locale: Locale, farmerName: string): string {
  return getLocalizedText(
    `Namaskar, ${farmerName}! 🙏 I'm your Krishi Saathi assistant. I can help you with:\n\n• Weather & rainfall updates\n• Irrigation advice\n• Crop-stage guidance\n• Market prices & mandi comparison\n• Government schemes\n• Loan & financial queries\n\nWhat would you like to know?`,
    `ନମସ୍କାର, ${farmerName}! 🙏 ମୁଁ ଆପଣଙ୍କ କୃଷି ସାଥୀ ସହାୟକ। ମୁଁ ସାହାଯ୍ୟ କରିପାରିବି:\n\n• ପାଗ ଓ ବର୍ଷା ଅପଡେଟ\n• ଜଳସେଚନ ପରାମର୍ଶ\n• ଫସଲ ସ୍ତର ସୂଚନା\n• ବାଜାର ମୂଲ୍ୟ\n• ସରକାରୀ ଯୋଜନା\n• ଋଣ ସମ୍ପର୍କିତ ପ୍ରଶ୍ନ\n\nଆପଣ କଣ ଜାଣିବାକୁ ଚାହାନ୍ତି?`,
    `नमस्ते, ${farmerName}! 🙏 मैं आपका कृषि साथी सहायक हूं। मैं मदद कर सकता हूं:\n\n• मौसम और बारिश अपडेट\n• सिंचाई सलाह\n• फसल चरण की जानकारी\n• बाज़ार मूल्य\n• सरकारी योजनाएं\n• ऋण संबंधी प्रश्न\n\nआप क्या जानना चाहेंगे?`,
    locale
  );
}

function weatherResponse(ctx: ChatContext, locale: Locale): string {
  if (!ctx.weather) {
    return getLocalizedText(
      "Weather data is currently unavailable. Please check again in a few minutes, or visit the Weather page for the latest update.",
      "ବର୍ତ୍ତମାନ ପାଗ ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ। ଦୟାକରି କିଛି ସମୟ ପରେ ପୁଣି ଚେକ୍ କରନ୍ତୁ।",
      "मौसम डेटा अभी उपलब्ध नहीं है। कृपया कुछ देर बाद फिर से जांचें।",
      locale
    );
  }

  const w = ctx.weather;
  const dev = Math.abs(Math.round(w.rainfallDeviation));
  const rainStatus = w.rainfallDeviation < -20
    ? getLocalizedText(`Rainfall is ${dev}% below normal — this is a concern for your crop.`, `ବର୍ଷା ସାଧାରଣଠାରୁ ${dev}% କମ୍ — ଏହା ଆପଣଙ୍କ ଫସଲ ପାଇଁ ଚିନ୍ତାଜନକ।`, `बारिश सामान्य से ${dev}% कम है — यह आपकी फसल के लिए चिंताजनक है।`, locale)
    : w.rainfallDeviation < -10
    ? getLocalizedText(`Rainfall is ${dev}% below normal. Keep monitoring.`, `ବର୍ଷା ସାଧାରଣଠାରୁ ${dev}% କମ୍। ନଜର ରଖନ୍ତୁ।`, `बारिश सामान्य से ${dev}% कम है। निगरानी रखें।`, locale)
    : getLocalizedText("Rainfall is near normal levels.", "ବର୍ଷା ସାଧାରଣ ସ୍ତରରେ ଅଛି।", "बारिश सामान्य स्तर पर है।", locale);

  return getLocalizedText(
    `**Current Weather — ${ctx.farmer.district}**\n\n🌡 Temperature: ${Math.round(w.temperature)}°C\n💧 Humidity: ${w.humidity}%\n🌧 Rainfall: ${w.precipitation} mm\n💨 Wind: ${Math.round(w.windSpeed)} km/h\n\n📊 ${rainStatus}\n\nDo you want irrigation advice or crop-specific guidance?`,
    `**ବର୍ତ୍ତମାନର ପାଗ — ${ctx.farmer.district}**\n\n🌡 ତାପମାନ: ${Math.round(w.temperature)}°C\n💧 ଆର୍ଦ୍ରତା: ${w.humidity}%\n🌧 ବର୍ଷା: ${w.precipitation} ମିମି\n💨 ପବନ: ${Math.round(w.windSpeed)} କିମି/ଘ\n\n📊 ${rainStatus}\n\nଜଳସେଚନ ପରାମର୍ଶ ଚାହାନ୍ତି କି?`,
    `**वर्तमान मौसम — ${ctx.farmer.district}**\n\n🌡 तापमान: ${Math.round(w.temperature)}°C\n💧 आर्द्रता: ${w.humidity}%\n🌧 बारिश: ${w.precipitation} मिमी\n💨 हवा: ${Math.round(w.windSpeed)} किमी/घंटा\n\n📊 ${rainStatus}\n\nक्या आप सिंचाई सलाह चाहेंगे?`,
    locale
  );
}

function irrigationResponse(ctx: ChatContext, locale: Locale): string {
  const w = ctx.weather;
  if (!w) {
    return getLocalizedText(
      "I need weather data to give irrigation advice. Weather data is temporarily unavailable.",
      "ଜଳସେଚନ ପରାମର୍ଶ ପାଇଁ ମୋତେ ପାଗ ତଥ୍ୟ ଆବଶ୍ୟକ।",
      "सिंचाई सलाह के लिए मुझे मौसम डेटा चाहिए।",
      locale
    );
  }

  const crop = getCropById(ctx.farmer.crop);
  const stage = getCropStage(ctx.farmer.sowingDate, ctx.farmer.crop);
  const hasIrrigation = ctx.farmer.irrigationAvailable;

  if (w.rainfallDeviation < -20 && !hasIrrigation) {
    return getLocalizedText(
      `⚠️ **Irrigation is needed but not available on your farm.**\n\nRainfall is ${Math.abs(Math.round(w.rainfallDeviation))}% below normal.\n\n**What you can do:**\n• Collect and store rainwater when it does rain\n• Explore community water-sharing arrangements\n• Contact your Block Agriculture Officer for emergency irrigation support\n\nWould you like the officer contact number?`,
      `⚠️ **ଜଳସେଚନ ଆବଶ୍ୟକ କିନ୍ତୁ ଆପଣଙ୍କ ଖେତରେ ଉପଲବ୍ଧ ନାହିଁ।**\n\nବର୍ଷା ସାଧାରଣଠାରୁ ${Math.abs(Math.round(w.rainfallDeviation))}% କମ୍।\n\n**ଆପଣ ଯା କରିପାରିବେ:**\n• ବର୍ଷା ହେଲେ ପାଣି ସଂରକ୍ଷଣ କରନ୍ତୁ\n• ସମ୍ମିଳନୀ ପାଣି ବାଣ୍ଟିବା ବ୍ୟବସ୍ଥା ଖୋଜନ୍ତୁ\n• ଜରୁରୀକାଳୀନ ଜଳସେଚନ ସହାୟତା ପାଇଁ ବ୍ଲକ୍ କୃଷି ଅଧିକାରୀଙ୍କୁ ସମ୍ପର୍କ କରନ୍ତୁ\n\nଅଧିକାରୀ ନମ୍ବର ଚାହାନ୍ତି କି?`,
      `⚠️ **सिंचाई की जरूरत है लेकिन आपके खेत में उपलब्ध नहीं है।**\n\nबारिश सामान्य से ${Math.abs(Math.round(w.rainfallDeviation))}% कम है।\n\n**क्या कर सकते हैं:**\n• बारिश होने पर पानी इकट्ठा करें\n• सामुदायिक पानी बांटने की व्यवस्था देखें\n• आपातकालीन सिंचाई सहायता के लिए ब्लॉक कृषि अधिकारी से संपर्क करें\n\nक्या अधिकारी का नंबर चाहिए?`,
      locale
    );
  }

  if (w.rainfallDeviation < -20 && hasIrrigation) {
    return getLocalizedText(
      `💧 **Irrigation recommended within 24–48 hours.**\n\nRainfall is ${Math.abs(Math.round(w.rainfallDeviation))}% below normal.${stage ? ` Your ${ctx.farmer.crop} is in the **${stage.name}** stage.` : ''}\n\n**Action:**\n• Irrigate the field within the next 1–2 days\n•${stage?.name === 'Vegetative' ? ' Maintain 2–5 cm standing water in the field' : stage?.name === 'Reproductive' ? ' Keep consistent water levels — this is critical during flowering' : ' Monitor soil moisture and irrigate as needed'}\n• Early morning or evening irrigation is best to reduce evaporation`,
      `💧 **ଜଳସେଚନ ଆସନ୍ତା 24–48 ଘଣ୍ଟାରେ କରନ୍ତୁ।**\n\nବର୍ଷା ସାଧାରଣଠାରୁ ${Math.abs(Math.round(w.rainfallDeviation))}% କମ୍।${stage ? ` ଆପଣଙ୍କ ଧାନ **${stage.nameOdia}** ସ୍ତରରେ ଅଛି।` : ''}\n\n**କାର୍ଯ୍ୟ:**\n• ଆସନ୍ତା 1–2 ଦିନରେ ଖେତରେ ଜଳସେଚନ କରନ୍ତୁ\n• ସକାଳ ବା ସନ୍ଧ୍ୟାରେ ଜଳସେଚନ କରନ୍ତୁ`,
      `💧 **सिंचाई अगले 24–48 घंटे में करें।**\n\nबारिश सामान्य से ${Math.abs(Math.round(w.rainfallDeviation))}% कम है।${stage ? ` आपका धान **${stage.nameHindi}** चरण में है।` : ''}\n\n**कार्य:**\n• अगले 1–2 दिनों में खेत में सिंचाई करें\n• सुबह या शाम को सिंचाई सबसे अच्छी है`,
      locale
    );
  }

  if (w.precipitation > 5 || w.rainfallDeviation > 10) {
    return getLocalizedText(
      `🌧 **No irrigation needed right now.**\n\nRain is expected or has recently fallen. Check that your field drainage is clear to prevent waterlogging.${stage?.name === 'Reproductive' ? '\n\n⚠️ During the reproductive stage, avoid prolonged waterlogging which can damage flowers.' : ''}`,
      `🌧 **ବର୍ତ୍ତମାନ ଜଳସେଚନ ଆବଶ୍ୟକ ନାହିଁ।**\n\nବର୍ଷା ହୋଇଛି ବା ହେବାର ଅଛି। ଜଳବନ୍ଦୀ ଏଡ଼ାଇବା ପାଇଁ ଖେତ ନିକାସ ଯାଞ୍ଚ କରନ୍ତୁ।`,
      `🌧 **अभी सिंचाई की जरूरत नहीं है।**\n\nबारिश हो रही है या हाल ही में हुई है। जलभराव से बचने के लिए खेत की निकास व्यवस्था जांचें।`,
      locale
    );
  }

  return getLocalizedText(
    `💧 **Irrigation advice:**\n\nCurrent conditions suggest moderate water needs. Check soil moisture by pushing your finger 2–3 inches into the soil — if it feels dry, irrigate.\n\n**Best practice:**\n• Irrigate in early morning or late evening\n• Avoid midday irrigation (high evaporation)\n• Maintain adequate moisture for your crop's current stage`,
    `💧 **ଜଳସେଚନ ପରାମର୍ଶ:**\n\nମାଟି ଆର୍ଦ୍ରତା ଯାଞ୍ଚ କରିବା ପାଇଁ ଆଙ୍ଗୁଠି 2–3 ଇଞ୍ଚ ମାଟିରେ ପୂରାନ୍ତୁ — ଶୁଖିଲା ଲାଗିଲେ ଜଳସେଚନ କରନ୍ତୁ।`,
    `💧 **सिंचाई सलाह:**\n\nमिट्टी की नमी जांचें — उंगली 2–3 इंच मिट्टी में डालें, सूखी लगे तो सिंचाई करें।`,
    locale
  );
}

function marketResponse(ctx: ChatContext, locale: Locale): string {
  const prices = getMarketPrices(ctx.farmer.crop);
  const priceDecline = getPriceChangePercent(ctx.farmer.crop);
  
  if (prices.length === 0) {
    return getLocalizedText(
      "Market price data is not available for your crop right now.",
      "ଆପଣଙ୍କ ଫସଲ ପାଇଁ ବାଜାର ମୂଲ୍ୟ ଉପଲବ୍ଧ ନାହିଁ।",
      "आपकी फसल के लिए बाज़ार मूल्य अभी उपलब्ध नहीं है।",
      locale
    );
  }

  const bestMarket = prices.reduce((best, p) => p.modalPrice > best.modalPrice ? p : best, prices[0]);
  const worstMarket = prices.reduce((worst, p) => p.modalPrice < worst.modalPrice ? p : worst, prices[0]);
  const savings = bestMarket.modalPrice - worstMarket.modalPrice;

  const declineText = Math.abs(priceDecline) > 10
    ? getLocalizedText(
        `\n\n⚠️ **Paddy prices have fallen ${Math.abs(Math.round(priceDecline))}%** compared to the reference period. Consider holding your produce if you have storage, or check which mandi offers the best price.`,
        `\n\n⚠️ **ଧାନ ମୂଲ୍ୟ ${Math.abs(Math.round(priceDecline))}% ହ୍ରାସ ପାଇଛି।** ଯଦି ଷ୍ଟୋରେଜ୍ ଅଛି ତେବେ ଅପେକ୍ଷା କରନ୍ତୁ।`,
        `\n\n⚠️ **धान के मूल्य ${Math.abs(Math.round(priceDecline))}% गिर गए हैं।** भंडारण है तो इंतज़ार करें।`,
        locale
      )
    : Math.abs(priceDecline) > 5
    ? getLocalizedText(
        `\n\n📉 Prices are slightly lower (${Math.abs(Math.round(priceDecline))}% decline). Compare mandis before selling.`,
        `\n\n📉 ମୂଲ୍ୟ ସାମାନ୍ୟ କମ୍ (${Math.abs(Math.round(priceDecline))}% ହ୍ରାସ)। ବିକ୍ରୟ ପୂର୍ବରୁ ମାଁଡି ତୁଳନା କରନ୍ତୁ।`,
        `\n\n📉 मूल्य में थोड़ी गिरावट (${Math.abs(Math.round(priceDecline))}%)। बेचने से पहले मंडियां तुलना करें।`,
        locale
      )
    : "";

  return getLocalizedText(
    `**${ctx.farmer.crop.charAt(0).toUpperCase() + ctx.farmer.crop.slice(1)} Prices — Nearby Mandis**\n\n${prices.map(p => `📍 **${p.market}**: ₹${p.modalPrice.toLocaleString('en-IN')}/quintal (Min: ₹${p.minPrice.toLocaleString('en-IN')}, Max: ₹${p.maxPrice.toLocaleString('en-IN')})`).join('\n')}\n\n⭐ **Best price: ${bestMarket.market}** at ₹${bestMarket.modalPrice.toLocaleString('en-IN')}/quintal\n\nSelling at the best mandi vs. worst saves ₹${savings.toLocaleString('en-IN')}/quintal.${declineText}\n\n⚠️ _These are reference prices from AGMARKNET dataset, not live feeds._`,
    `**${ctx.farmer.crop === 'paddy' ? 'ଧାନ' : ctx.farmer.crop === 'maize' ? 'ମକା' : 'ଚିନିବାଦାମ'} ମୂଲ୍ୟ — ନିକଟତମ ମାଁଡି**\n\n${prices.map(p => `📍 **${p.market}**: ₹${p.modalPrice.toLocaleString('en-IN')}/quintal`).join('\n')}\n\n⭐ **ସର୍ବୋତ୍ତମ ମୂଲ୍ୟ: ${bestMarket.market}** — ₹${bestMarket.modalPrice.toLocaleString('en-IN')}/quintal${declineText}`,
    `**${ctx.farmer.crop === 'paddy' ? 'धान' : ctx.farmer.crop === 'maize' ? 'मक्का' : 'मूंगफली'} मूल्य — निकटतम मंडियां**\n\n${prices.map(p => `📍 **${p.market}**: ₹${p.modalPrice.toLocaleString('en-IN')}/quintal`).join('\n')}\n\n⭐ **सर्वोत्तम मूल्य: ${bestMarket.market}** — ₹${bestMarket.modalPrice.toLocaleString('en-IN')}/quintal${declineText}`,
    locale
  );
}

function cropAdviceResponse(ctx: ChatContext, locale: Locale): string {
  const crop = getCropById(ctx.farmer.crop);
  const stage = getCropStage(ctx.farmer.sowingDate, ctx.farmer.crop);
  
  const cropName = locale === "od" ? crop?.nameOdia : locale === "hi" ? crop?.nameHindi : crop?.name;
  const stageName = locale === "od" ? stage?.nameOdia : locale === "hi" ? stage?.nameHindi : stage?.name;

  const daysSinceSowing = Math.floor((Date.now() - new Date(ctx.farmer.sowingDate).getTime()) / (1000 * 60 * 60 * 24));

  let advice = getLocalizedText(
    `**${cropName} — Stage: ${stageName}** (Day ${daysSinceSowing} after sowing)\n\n`,
    `**${cropName} — ସ୍ତର: ${stageName}** (ବୁଣା ପରେ ${daysSinceSowing} ଦିନ)\n\n`,
    `**${cropName} — चरण: ${stageName}** (बुवाई के ${daysSinceSowing} दिन बाद)\n\n`,
    locale
  );

  if (ctx.farmer.crop === "paddy") {
    if (stage?.name === "Vegetative") {
      advice += getLocalizedText(
        "• Maintain 2–5 cm standing water in the field\n• Apply weeding if not done recently\n• Monitor for stem borer — look for dead hearts in the plant\n• Continue regular nitrogen application as per Soil Health Card",
        "• ଖେତରେ 2–5 ସେମି ଠିଆ ପାଣି ରଖନ୍ତୁ\n• ଖରପତ୍ବର ନିବାରଣ କରନ୍ତୁ\n• ଷ୍ଟେମ୍ ବୋରର ଯାଞ୍ଚ କରନ୍ତୁ",
        "• खेत में 2–5 सेमी खड़ा पानी बनाए रखें\n• निराई-गुड़ाई करें\n• तना छेदक की जांच करें",
        locale
      );
    } else if (stage?.name === "Reproductive") {
      advice += getLocalizedText(
        "• ⚠️ **Critical stage** — avoid water stress during flowering\n• Maintain consistent water levels\n• Avoid pesticide application during flowering to protect pollinators\n• Watch for neck blast — brown lesions on the panicle neck",
        "• ⚠️ **ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସ୍ତର** — ଫୁଲ ଫେଟା ସମୟରେ ଜଳ ଚାପ ଏଡ଼ାନ୍ତୁ\n• ସ୍ଥିର ଜଳ ସ୍ତର ରଖନ୍ତୁ",
        "• ⚠️ **महत्वपूर्ण चरण** — फूल खिलने के दौरान जल तनाव से बचें\n• स्थिर जल स्तर बनाए रखें",
        locale
      );
    } else if (stage?.name === "Ripening") {
      advice += getLocalizedText(
        "• Drain the field 7–10 days before harvest\n• Reduce irrigation to allow grain to harden\n• Monitor for grain discoloration\n• Plan harvest timing — grain should be 80% golden-yellow",
        "• ଅମଳର 7–10 ଦିନ ପୂର୍ବରୁ ଖେତ ଶୁଖାନ୍ତୁ\n• ଜଳସେଚନ କମ୍ କରନ୍ତୁ",
        "• कटाई से 7–10 दिन पहले खेत सुखाएं\n• सिंचाई कम करें",
        locale
      );
    } else {
      advice += getLocalizedText(
        "• Monitor soil moisture regularly\n• Watch for pest and disease symptoms\n• Follow your crop calendar for next activities",
        "• ନିୟମିତ ମାଟି ଆର୍ଦ୍ରତା ଯାଞ୍ଚ କରନ୍ତୁ\n• ପୋକ ଓ ରୋଗ ଲକ୍ଷଣ ଦେଖନ୍ତୁ",
        "• नियमित मिट्टी की नमी जांचें\n• कीट और रोग के लक्षण देखें",
        locale
      );
    }
  } else if (ctx.farmer.crop === "maize") {
    advice += getLocalizedText(
      stage?.name === "Tasseling/Silking"
        ? "• ⚠️ **Critical stage** — ensure adequate moisture during tasseling\n• Avoid water stress — it can reduce grain fill significantly\n• Monitor for stem borer (dead hearts, white ears)"
        : "• Ensure even plant spacing\n• Watch for shoot fly in early stages\n• Apply ear rot management if humid conditions persist",
      "• ମାଟି ଆର୍ଦ୍ରତା ଯାଞ୍ଚ କରନ୍ତୁ\n• ପୋକ ନିୟନ୍ତ୍ରଣ କରନ୍ତୁ",
      "• मिट्टी की नमी जांचें\n• कीट नियंत्रण करें",
      locale
    );
  } else {
    advice += getLocalizedText(
      "• Ensure well-drained soil\n• Avoid excess moisture during pod formation\n• Monitor for leaf spot in wet conditions",
      "• ମାଟି ନିକାସ ଯାଞ୍ଚ କରନ୍ତୁ\n• ଫଳ ଗଠନ ସମୟରେ ଅତ୍ୟଧିକ ଆର୍ଦ୍ରତା ଏଡ଼ାନ୍ତୁ",
      "• मिट्टी की निकासी सुनिश्चित करें\n• फली बनने के दौरान अत्यधिक नमी से बचें",
      locale
    );
  }

  return advice;
}

function loanResponse(ctx: ChatContext, locale: Locale): string {
  const daysUntilLoan = Math.floor((new Date(ctx.farmer.loanDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilLoan <= 0) {
    return getLocalizedText(
      `⚠️ **Your loan of ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')} is overdue.**\n\nLender: ${ctx.farmer.loanLender}\n\n**What to do:**\n• Contact ${ctx.farmer.loanLender} to discuss restructuring options\n• Check if you're eligible for a loan moratorium or restructuring under government schemes\n• Kisan Credit Card (KCC) may offer better terms\n\nWould you like me to connect you with an agriculture officer who can help?`,
      `⚠️ **ଆପଣଙ୍କ ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')} ଋଣ ଅତିକ୍ରାନ୍ତ।**\n\nଋଣଦାତା: ${ctx.farmer.loanLender}\n\n${ctx.farmer.loanLender} ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ। ସରକାରୀ ଯୋଜନା ଅଧୀନରେ ଋଣ ପୁନଃଗଠନ ବିକଳ୍ପ ଯାଞ୍ଚ କରନ୍ତୁ।\n\nକୃଷି ଅଧିକାରୀଙ୍କ ସହ ଯୋଗାଯୋଗ କରିବାକୁ ଚାହାନ୍ତି କି?`,
      `⚠️ **आपका ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')} का ऋण अतिक्रांत है।**\n\nऋणदाता: ${ctx.farmer.loanLender}\n\n${ctx.farmer.loanLender} से संपर्क करें। पुनर्गठन विकल्प जांचें।`,
      locale
    );
  }

  if (daysUntilLoan <= 14) {
    return getLocalizedText(
      `⏰ **Your loan of ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')} is due in ${daysUntilLoan} days** (${new Date(ctx.farmer.loanDueDate).toLocaleDateString('en-IN')}).\n\nLender: ${ctx.farmer.loanLender}\n\n**Suggestions:**\n• Start preparing for repayment now\n• If you're facing difficulty, contact ${ctx.farmer.loanLender} immediately to discuss options\n• Check if you qualify for any government loan relief or restructuring\n• Don't wait until the last day`,
      `⏰ **ଆପଣଙ୍କ ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')} ଋଣ ${daysUntilLoan} ଦିନ ପରେ ପରିଶୋଧନ।**\n\nଋଣଦାତା: ${ctx.farmer.loanLender}\n\nଯଦି କଷ୍ଟ ହେଉଛି, ଏବେ ସମ୍ପର୍କ କରନ୍ତୁ।`,
      `⏰ **आपका ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')} का ऋण ${daysUntilLoan} दिन में देय है।**\n\nअगर कठिनाई हो रही है, अभी संपर्क करें।`,
      locale
    );
  }

  return getLocalizedText(
    `📋 **Loan Details:**\n\nAmount: ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')}\nDue: ${new Date(ctx.farmer.loanDueDate).toLocaleDateString('en-IN')} (${daysUntilLoan} days away)\nLender: ${ctx.farmer.loanLender}\n\n✅ Your loan is not due soon. Continue regular monitoring.\n\nIf you're facing any financial difficulty, don't hesitate to contact your lender or a Kisan Call Centre (1800-180-1551).`,
    `📋 **ଋଣ ବିବରଣୀ:**\n\nପରିମାଣ: ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')}\nପରିଶୋଧନ: ${daysUntilLoan} ଦିନ ବାକି\n\n✅ ଋଣ ଏବେ ଦେୟ ନୁହେଁ। ନିୟମିତ ନଜର ରଖନ୍ତୁ।`,
    `📋 **ऋण विवरण:**\n\nराशि: ₹${ctx.farmer.loanAmount.toLocaleString('en-IN')}\nदेय: ${daysUntilLoan} दिन बाकी\n\n✅ ऋण अभी देय नहीं है। नियमित निगरानी जारी रखें।`,
    locale
  );
}

function schemeResponse(ctx: ChatContext, locale: Locale): string {
  return getLocalizedText(
    `🏛 **Government Schemes Relevant to You:**\n\n1️⃣ **PMFBY (Crop Insurance)** — Protects against crop loss from natural calamities.\n   Apply: pmfby.gov.in\n\n2️⃣ **Kisan Credit Card (KCC)** — Affordable crop loans with interest subvention.\n   Apply at your nearest bank or cooperative.\n\n3️⃣ **PM-KISAN** — ₹6,000/year direct income support.\n   Check status: pmkisan.gov.in\n\n4️⃣ **PMKSY (Irrigation Support)** — Micro-irrigation and watershed development.\n   Contact your Block Agriculture Officer.\n\n5️⃣ **Soil Health Card** — Free soil testing and fertilizer recommendations.\n\n⚠️ _Eligibility must be verified with the relevant department._`,
    `🏛 **ଆପଣଙ୍କ ପାଇଁ ପ୍ରାସଙ୍ଗିକ ସରକାରୀ ଯୋଜନା:**\n\n1️⃣ **PMFBY (ଫସଲ ବୀମା)** — ପ୍ରାକୃତିକ ବିପଦରୁ ଫସଲ ସୁରକ୍ଷା।\n2️⃣ **କିଶାନ୍ କ୍ରେଡିଟ୍ କାର୍ଡ** — ସାଶ୍ରୟ ଫସଲ ଋଣ।\n3️⃣ **PM-KISAN** — ପ୍ରତି ବର୍ଷ ₹6,000 ସିଧାସଳଖ ସହାୟତା।\n4️⃣ **PMKSY (ଜଳସେଚନ ସହାୟତା)** — ମାଇକ୍ରୋ-ସିଞ୍ଚୟ ସହାୟତା।\n5️⭣ **ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ** — ମାଗଣା ମୃତ୍ତିକା ପରୀକ୍ଷା।\n\n⚠️ _ଯୋଗ୍ୟତା ସଂପୃକ୍ତ ବିଭାଗ ସହ ଯାଞ୍ଚ କରିବା ଆବଶ୍ୟକ।_`,
    `🏛 **आपके लिए प्रासंगिक सरकारी योजनाएं:**\n\n1️⃣ **PMFBY (फसल बीमा)** — प्राकृतिक आपदाओं से फसल सुरक्षा।\n2️⃣ **किसान क्रेडिट कार्ड** — सस्ते फसल ऋण।\n3️⃣ **PM-KISAN** — प्रति वर्ष ₹6,000 सीधी सहायता।\n4️⃣ **PMKSY (सिंचाई सहायता)** — सूक्ष्म सिंचाई सहायता।\n5️⃣ **मृदा स्वास्थ्य कार्ड** — मुफ्त मिट्टी परीक्षण।\n\n⚠️ _पात्रता संबंधित विभाग से सत्यापित करें।_`,
    locale
  );
}

function riskResponse(ctx: ChatContext, locale: Locale): string {
  return getLocalizedText(
    `📊 **Your Distress Risk Assessment**\n\nScore: **${ctx.riskScore}/100** (${ctx.riskCategory})\n\n**Contributing factors:**\n• Rainfall: ${Math.abs(Math.round(ctx.weather?.rainfallDeviation ?? 0))}% ${ctx.weather && ctx.weather.rainfallDeviation < 0 ? 'below' : 'above'} normal\n• Market price decline: ${Math.abs(Math.round(getPriceChangePercent(ctx.farmer.crop)))}%\n• Loan: Due in ${Math.max(0, Math.floor((new Date(ctx.farmer.loanDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days\n\n_This is a decision-support indicator, not a clinical prediction._`,
    `📊 **ଆପଣଙ୍କ ସଂକଟ ବିପଦ ମୂଲ୍ୟାୟନ**\n\nସ୍କୋର: **${ctx.riskScore}/100** (${ctx.riskCategory})`,
    `📊 **आपका वित्तीय संकट जोखिम मूल्यांकन**\n\nस्कोर: **${ctx.riskScore}/100** (${ctx.riskCategory})`,
    locale
  );
}

function expertResponse(ctx: ChatContext, locale: Locale): string {
  return getLocalizedText(
    `👨‍🌾 **Connect with an Expert**\n\nHere are experts who can help you beyond what the app can provide:\n\n📞 **Kisan Call Centre**: 1800-180-1551 (Toll-free, 24/7)\n   Agricultural advisory in your local language.\n\n📞 **Block Agriculture Officer**: Contact your local block office for personalized crop advice.\n\n📞 **PM-KISAN Helpline**: 155261 or 011-24300606\n   For PM-KISAN scheme queries.\n\nWould you like me to show more specific helplines?`,
    `👨‍🌾 **ବିଶେଷଜ୍ଞଙ୍କ ସହ ସମ୍ପର୍କ**\n\n📞 **କିଶାନ୍ କଲ୍ ସେଣ୍ଟର**: 1800-180-1551 (ଟୋଲ୍-ଫ୍ରି, 24/7)\n📞 **ବ୍ଲକ୍ କୃଷି ଅଧିକାରୀ**: ଆପଣଙ୍କ ସ୍ଥାନୀୟ ବ୍ଲକ୍ ଅଫିସ୍\n📞 **PM-KISAN ହେଲ୍ପଲାଇନ**: 155261`,
    `👨‍🌾 **विशेषज्ञ से संपर्क**\n\n📞 **किसान कॉल सेंटर**: 1800-180-1551 (टोल-फ्री, 24/7)\n📞 **ब्लॉक कृषि अधिकारी**: अपने स्थानीय ब्लॉक कार्यालय से संपर्क करें\n📞 **PM-KISAN हेल्पलाइन**: 155261`,
    locale
  );
}

function soilResponse(ctx: ChatContext, locale: Locale): string {
  return getLocalizedText(
    `🌱 **Soil Information**\n\nYour soil type: **${ctx.farmer.soilType.charAt(0).toUpperCase() + ctx.farmer.soilType.slice(1)}**\n\n**Tips for ${ctx.farmer.soilType} soil:**\n${ctx.farmer.soilType === 'loamy'
      ? '• Loamy soil is ideal for most crops — good drainage and water retention\n• Apply organic compost to maintain soil health\n• Test soil pH annually through the Soil Health Card scheme'
      : ctx.farmer.soilType === 'clay'
      ? '• Clay soil holds water well but can become waterlogged\n• Avoid over-irrigation — check drainage channels\n• Add organic matter to improve soil structure\n• Best for paddy cultivation'
      : '• Sandy soil drains quickly — more frequent, lighter irrigation needed\n• Add organic matter (compost, green manure) to improve water retention\n• Apply fertilizer in split doses to prevent leaching'
    }\n\n📞 Get a free Soil Health Card from your nearest agriculture center.`,
    `🌱 **ମୃତ୍ତିକା ସୂଚନା**\n\nଆପଣଙ୍କ ମୃତ୍ତିକା ପ୍ରକାର: **${ctx.farmer.soilType}**\n\nମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ପାଇଁ ନିକଟତମ କୃଷି କେନ୍ଦ୍ରରେ ଯୋଗାଯୋଗ କରନ୍ତୁ।`,
    `🌱 **मिट्टी की जानकारी**\n\nआपकी मिट्टी: **${ctx.farmer.soilType}**\n\nमुफ्त मृदा स्वास्थ्य कार्ड के लिए निकटतम कृषि केंद्र से संपर्क करें।`,
    locale
  );
}

function fallbackResponse(locale: Locale): string {
  return getLocalizedText(
    "I'm not sure I understand that question. I can help you with:\n\n• 🌤 **Weather** — \"What's the weather?\"\n• 💧 **Irrigation** — \"Should I irrigate?\"\n• 🌾 **Crop advice** — \"What should I do for my paddy?\"\n• 💰 **Market prices** — \"What's the price in the mandi?\"\n• 📋 **Loan** — \"When is my loan due?\"\n• 🏛 **Schemes** — \"What government schemes can I get?\"\n• ⚠️ **Risk** — \"What's my risk score?\"\n• 👨‍🌾 **Expert** — \"I need to talk to an expert\"\n\nTry asking any of these!",
    "ମୁଁ ଏହି ପ୍ରଶ୍ନ ବୁଝିପାରିଲି ନାହିଁ। ମୁଁ ସାହାଯ୍ୟ କରିପାରିବି:\n\n• 🌤 **ପାଗ** — \"ପାଗ କେମିତି ଅଛି?\"\n• 💧 **ଜଳସେଚନ** — \"ଜଳସେଚନ କରିବି କି?\"\n• 🌾 **ଫସଲ ପରାମର୍ଶ** — \"ଧାନ ପାଇଁ କଣ କରିବି?\"\n• 💰 **ବାଜାର ମୂଲ୍ୟ** — \"ମାଁଡିରେ ଦାମ କେତେ?\"\n• 🏛 **ଯୋଜନା** — \"କେଉଁ ସରକାରୀ ଯୋଜନା ମିଳିବ?\"",
    "मैं यह प्रश्न नहीं समझ पाया। मैं मदद कर सकता हूं:\n\n• 🌤 **मौसम** — \"मौसम कैसा है?\"\n• 💧 **सिंचाई** — \"सिंचाई करूं?\"\n• 🌾 **फसल सलाह** — \"धान के लिए क्या करूं?\"\n• 💰 **बाज़ार मूल्य** — \"मंडी में भाव क्या है?\"\n• 🏛 **योजनाएं** — \"कौन सी सरकारी योजना मिलेगी?\"",
    locale
  );
}

/**
 * Main chat handler — takes user input and returns a response
 */
export function handleChat(
  userText: string,
  ctx: ChatContext,
  locale: Locale
): { message: string; showHelplines: boolean } {
  // 1. Check for distress signals FIRST — always escalate
  if (detectDistress(userText, locale)) {
    const escalationMsg = getEscalationMessage(ctx.farmer.name, ctx.riskCategory, locale);
    const helplineList = HELPLINES.filter(h => h.type === "mental_health" || h.type === "emergency")
      .map(h => `📞 **${locale === "od" ? h.nameOdia : locale === "hi" ? h.nameHindi : h.name}**: ${h.phone}\n   ${locale === "od" ? h.descriptionOdia : locale === "hi" ? h.descriptionHindi : h.description}`)
      .join("\n\n");
    
    return {
      message: `${escalationMsg}\n\n${helplineList}`,
      showHelplines: true,
    };
  }

  // 2. If farmer is HIGH risk and asking for help, escalate
  if (ctx.riskCategory === "HIGH" && detectIntent(userText, locale) === "help") {
    return {
      message: getEscalationMessage(ctx.farmer.name, "HIGH", locale),
      showHelplines: true,
    };
  }

  // 3. Route to appropriate intent handler
  const intent = detectIntent(userText, locale);
  
  switch (intent) {
    case "greeting":
      return { message: greetingResponse(locale, ctx.farmer.name), showHelplines: false };
    case "weather":
      return { message: weatherResponse(ctx, locale), showHelplines: false };
    case "irrigation":
      return { message: irrigationResponse(ctx, locale), showHelplines: false };
    case "market":
      return { message: marketResponse(ctx, locale), showHelplines: false };
    case "crop_advice":
      return { message: cropAdviceResponse(ctx, locale), showHelplines: false };
    case "loan":
      return { message: loanResponse(ctx, locale), showHelplines: false };
    case "scheme":
      return { message: schemeResponse(ctx, locale), showHelplines: false };
    case "risk":
      return { message: riskResponse(ctx, locale), showHelplines: false };
    case "soil":
      return { message: soilResponse(ctx, locale), showHelplines: false };
    case "expert":
      return { message: expertResponse(ctx, locale), showHelplines: true };
    default:
      return { message: fallbackResponse(locale), showHelplines: false };
  }
}

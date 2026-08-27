/**
 * Advisory Engine
 * 
 * Rule-based agricultural advisory system that combines:
 * - Weather data
 * - Crop information & growth stage
 * - Soil conditions
 * - Rainfall deviation
 * - Market conditions
 * 
 * Produces simple, actionable recommendations.
 */

import type { Locale } from "./i18n";

export interface Advisory {
  id: string;
  type: "irrigation" | "drainage" | "heat" | "market" | "general" | "alert";
  severity: "info" | "warning" | "urgent";
  messageEn: string;
  messageOdia: string;
  messageHindi: string;
  reason: string;
  action: string;
}

interface AdvisoryInput {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  forecastPrecipitation3Day: number;
  rainfallDeviation: number;
  cropId: string;
  cropStage: string;
  soilType: string;
  irrigationAvailable: boolean;
  priceDecline: number;
}

export function generateAdvisories(input: AdvisoryInput): Advisory[] {
  const advisories: Advisory[] = [];
  const now = new Date();

  // RAINFALL / IRRIGATION ADVISORY
  if (input.rainfallDeviation < -20 && !input.irrigationAvailable) {
    advisories.push({
      id: `irr-${now.getTime()}`,
      type: "irrigation",
      severity: "urgent",
      messageEn: `Rainfall is ${Math.abs(Math.round(input.rainfallDeviation))}% below normal. Since irrigation is not available, try to collect and conserve any available water. Consider community water-sharing arrangements.`,
      messageOdia: `ବର୍ଷା ସାଧାରଣଠାରୁ ${Math.abs(Math.round(input.rainfallDeviation))}% କମ୍। ଜଳସେଚନ ଉପଲବ୍ଧ ନଥିବାରୁ, ଯଥାସମ୍ଭବ ପାଣି ସଂରକ୍ଷଣ କରନ୍ତୁ।`,
      messageHindi: `वर्षा सामान्य से ${Math.abs(Math.round(input.rainfallDeviation))}% कम है। सिंचाई उपलब्ध नहीं है, इसलिए उपलब्ध पानी को इकट्ठा और संरक्षित करने का प्रयास करें।`,
      reason: "Low rainfall without irrigation access",
      action: "Conserve water, explore community water sharing",
    });
  } else if (input.rainfallDeviation < -20 && input.irrigationAvailable) {
    advisories.push({
      id: `irr-${now.getTime()}`,
      type: "irrigation",
      severity: "warning",
      messageEn: `Rainfall is ${Math.abs(Math.round(input.rainfallDeviation))}% below normal. If irrigation water is available, consider irrigating the field within the next 24–48 hours.`,
      messageOdia: `ବର୍ଷା ସାଧାରଣଠାରୁ ${Math.abs(Math.round(input.rainfallDeviation))}% କମ୍। ଜଳସେଚନ ପାଣି ଉପଲବ୍ଧ ଥିଲେ, ଆସନ୍ତା 24–48 ଘଣ୍ଟାରେ ଖେତରେ ଜଳସେଚନ କରନ୍ତୁ।`,
      messageHindi: `वर्षा सामान्य से ${Math.abs(Math.round(input.rainfallDeviation))}% कम है। यदि सिंचाई का पानी उपलब्ध है, तो अगले 24–48 घंटे में खेत में सिंचाई करने पर विचार करें।`,
      reason: "Low rainfall but irrigation is available",
      action: "Irrigate field within 24-48 hours",
    });
  }

  // HEAVY RAINFALL ADVISORY
  if (input.forecastPrecipitation3Day > 50) {
    advisories.push({
      id: `drain-${now.getTime()}`,
      type: "drainage",
      severity: "warning",
      messageEn: `Heavy rainfall (${Math.round(input.forecastPrecipitation3Day)} mm) expected in the next 3 days. Avoid unnecessary irrigation and check field drainage channels.`,
      messageOdia: `ଆସନ୍ତା 3 ଦିନରେ ଭାରୀ ବର୍ଷା (${Math.round(input.forecastPrecipitation3Day)} ମିମି) ଆଶାକୃତ। ଅନାବଶ୍ୟକ ଜଳସେଚନ ଏଡ଼ାନ୍ତୁ ଏବଂ ଖେତ ନିକାସ ଯାଞ୍ଚ କରନ୍ତୁ।`,
      messageHindi: `अगले 3 दिनों में भारी वर्षा (${Math.round(input.forecastPrecipitation3Day)} मिमी) की उम्मीद है। अनावश्यक सिंचाई से बचें और खेत की निकास व्यवस्था जांचें।`,
      reason: "Heavy rainfall forecast",
      action: "Check drainage, stop irrigation",
    });
  }

  // HIGH TEMPERATURE ADVISORY
  if (input.temperature > 36) {
    advisories.push({
      id: `heat-${now.getTime()}`,
      type: "heat",
      severity: input.temperature > 40 ? "urgent" : "warning",
      messageEn: `High temperature (${Math.round(input.temperature)}°C) may increase crop water stress. Monitor soil moisture and maintain adequate irrigation where possible.`,
      messageOdia: `ଉଚ୍ଚ ତାପମାନ (${Math.round(input.temperature)}°C) ଫସଲ ଜଳ ଚାପ ବଢ଼ାଇପାରେ। ମାଟି ଆର୍ଦ୍ରତା ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ସମ୍ଭବ ହେଲେ ପର୍ଯ୍ୟାପ୍ତ ଜଳସେଚନ ରଖନ୍ତୁ।`,
      messageHindi: `उच्च तापमान (${Math.round(input.temperature)}°C) फसल जल तनाव बढ़ा सकता है। मिट्टी की नमी की निगरानी करें और जहां संभव हो उचित सिंचाई बनाए रखें।`,
      reason: "High temperature stress",
      action: "Increase irrigation frequency, mulching",
    });
  }

  // CROP STAGE SPECIFIC ADVICE
  if (input.cropId === "paddy" && input.cropStage === "Reproductive") {
    advisories.push({
      id: `stage-${now.getTime()}`,
      type: "general",
      severity: "info",
      messageEn: "Paddy is at the reproductive stage. This is a critical period — avoid water stress during flowering. Maintain consistent water levels in the field.",
      messageOdia: "ଧାନ ପ୍ରଜନନ ସ୍ତରରେ ଅଛି। ଏହା ଏକ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସମୟ — ଫୁଲ ଫେଟା ସମୟରେ ଜଳ ଚାପ ଏଡ଼ାନ୍ତୁ।",
      messageHindi: "धान प्रजनन चरण में है। यह एक महत्वपूर्ण समय है — फूल खिलने के दौरान जल तनाव से बचें।",
      reason: "Critical crop growth stage",
      action: "Maintain consistent water levels",
    });
  }

  if (input.cropId === "paddy" && input.cropStage === "Vegetative") {
    advisories.push({
      id: `stage-${now.getTime()}`,
      type: "general",
      severity: "info",
      messageEn: "Paddy is in the vegetative stage. Maintain standing water (2-5 cm) in the field for best growth. This is also a good time to apply weeding.",
      messageOdia: "ଧାନ ବର୍ଦ୍ଧନଶୀଳ ସ୍ତରରେ ଅଛି। ସର୍ବୋତ୍ତମ ବୃଦ୍ଧି ପାଇଁ ଖେତରେ ଠିଆ ପାଣି (2-5 ସେମି) ରଖନ୍ତୁ।",
      messageHindi: "धान वानस्पतिक चरण में है। सर्वोत्तम विकास के लिए खेत में खड़ा पानी (2-5 सेमी) बनाए रखें।",
      reason: "Vegetative growth stage",
      action: "Maintain 2-5 cm standing water",
    });
  }

  // MARKET ADVISORY
  if (input.priceDecline < -10) {
    advisories.push({
      id: `mkt-${now.getTime()}`,
      type: "market",
      severity: "warning",
      messageEn: `Paddy prices have fallen ${Math.abs(Math.round(input.priceDecline))}% compared to recent reference period. Check nearby mandis before deciding where to sell. Consider holding if storage is available.`,
      messageOdia: `ଧାନ ମୂଲ୍ୟ ସାମ୍ପ୍ରତିକ ସନ୍ଦର୍ଭ ଅବଧି ତୁଳନାରେ ${Math.abs(Math.round(input.priceDecline))}% ହ୍ରାସ ପାଇଛି। ବିକ୍ରୟ ନିର୍ଣ୍ଣୟ ପୂର୍ବରୁ ନିକଟତମ ମଣ୍ଡି ଯାଞ୍ଚ କରନ୍ତୁ।`,
      messageHindi: `धान के मूल्य हाल के संदर्भ अवधि की तुलना में ${Math.abs(Math.round(input.priceDecline))}% गिर गए हैं। बेचने का निर्णय लेने से पहले निकटतम मंडियों की जांच करें।`,
      reason: "Significant price decline",
      action: "Compare mandi prices, consider holding",
    });
  } else if (input.priceDecline < -5) {
    advisories.push({
      id: `mkt-${now.getTime()}`,
      type: "market",
      severity: "info",
      messageEn: `Paddy prices have declined slightly (${Math.abs(Math.round(input.priceDecline))}%). Compare prices across nearby mandis for the best deal.`,
      messageOdia: `ଧାନ ମୂଲ୍ୟ ସାମାନ୍ୟ ହ୍ରାସ ପାଇଛି (${Math.abs(Math.round(input.priceDecline))}%). ସର୍ବୋତ୍ତମ ମୂଲ୍ୟ ପାଇଁ ନିକଟତମ ମଣ୍ଡିରେ ମୂଲ୍ୟ ତୁଳନା କରନ୍ତୁ।`,
      messageHindi: `धान के मूल्य में थोड़ी गिरावट (${Math.abs(Math.round(input.priceDecline))}%) आई है। सर्वोत्तम मूल्य के लिए निकटतम मंडियों में मूल्यों की तुलना करें।`,
      reason: "Slight price decline",
      action: "Compare mandi prices",
    });
  }

  // WIND ADVISORY
  if (input.windSpeed > 30) {
    advisories.push({
      id: `wind-${now.getTime()}`,
      type: "alert",
      severity: "warning",
      messageEn: `Strong winds (${Math.round(input.windSpeed)} km/h) expected. Secure tall crops and check for any crop damage.`,
      messageOdia: `ପ୍ରବଳ ପବନ (${Math.round(input.windSpeed)} କିମି/ଘ) ଆଶାକୃତ। ଲମ୍ବା ଫସଲ ସୁରକ୍ଷା କରନ୍ତୁ।`,
      messageHindi: `तेज हवा (${Math.round(input.windSpeed)} किमी/घंटा) की उम्मीद है। लंबी फसलों को सुरक्षित करें।`,
      reason: "High wind speed",
      action: "Secure crops, check for damage",
    });
  }

  // If no specific advisory, give a general all-clear
  if (advisories.length === 0) {
    advisories.push({
      id: `gen-${now.getTime()}`,
      type: "general",
      severity: "info",
      messageEn: "Current conditions look manageable. Continue regular monitoring of your crop and soil moisture. No urgent action needed at this time.",
      messageOdia: "ବର୍ତ୍ତମାନର ପରିସ୍ଥିତି ପରିଚାଳନାଯୋଗ୍ୟ ଦେଖାଯାଉଛି। ଆପଣଙ୍କ ଫସଲ ଏବଂ ମାଟି ଆର୍ଦ୍ରତାର ନିୟମିତ ଯାଞ୍ଚ ଜାରି ରଖନ୍ତୁ।",
      messageHindi: "वर्तमान स्थिति प्रबंधनीय लग रही है। अपनी फसल और मिट्टी की नमी की नियमित निगरानी जारी रखें।",
      reason: "No critical conditions detected",
      action: "Continue regular monitoring",
    });
  }

  return advisories;
}

export function getAdvisoryText(advisory: Advisory, locale: Locale): string {
  switch (locale) {
    case "od": return advisory.messageOdia;
    case "hi": return advisory.messageHindi;
    default: return advisory.messageEn;
  }
}

export function getSeverityColor(severity: "info" | "warning" | "urgent"): string {
  switch (severity) {
    case "urgent": return "text-red-600 bg-red-50 border-red-200";
    case "warning": return "text-amber-700 bg-amber-50 border-amber-200";
    case "info": return "text-green-700 bg-green-50 border-green-200";
  }
}

export function getSeverityIcon(severity: "info" | "warning" | "urgent"): string {
  switch (severity) {
    case "urgent": return "🔴";
    case "warning": return "⚠️";
    case "info": return "✅";
  }
}

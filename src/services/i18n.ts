/**
 * Internationalization Service
 * 
 * Supports: English (en), Odia (od), Hindi (hi)
 */

import en from "@/locales/en.json";
import od from "@/locales/od.json";
import hi from "@/locales/hi.json";

export type Locale = "en" | "od" | "hi";

const translations: Record<Locale, Record<string, unknown>> = {
  en,
  od,
  hi,
};

export function t(key: string, locale: Locale = "en"): string {
  const keys = key.split(".");
  let value: unknown = translations[locale];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to English
      value = translations.en;
      for (const fk of keys) {
        if (value && typeof value === "object" && fk in value) {
          value = (value as Record<string, unknown>)[fk];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }

  return typeof value === "string" ? value : key;
}

export function tWithParams(key: string, params: Record<string, string | number>, locale: Locale = "en"): string {
  let text = t(key, locale);
  for (const [param, value] of Object.entries(params)) {
    text = text.replace(`{{${param}}}`, String(value));
  }
  return text;
}

export function getLocalizedFieldName(field: string, locale: Locale): string {
  const map: Record<string, Record<Locale, string>> = {
    name: { en: "Name", od: "ନାମ", hi: "नाम" },
    village: { en: "Village", od: "ଗାଁ", hi: "गाँव" },
    district: { en: "District", od: "ଜିଲ୍ଲା", hi: "जिला" },
    state: { en: "State", od: "ରାଜ୍ୟ", hi: "राज्य" },
    crop: { en: "Crop", od: "ଫସଲ", hi: "फसल" },
    farmSize: { en: "Farm Size", od: "ଖେତ ଆୟତନ", hi: "खेत का आकार" },
    sowingDate: { en: "Sowing Date", od: "ବୁଣା ତାରିଖ", hi: "बुवाई की तारीख" },
    soilType: { en: "Soil Type", od: "ମାଟି ପ୍ରକାର", hi: "मिट्टी का प्रकार" },
    irrigation: { en: "Irrigation", od: "ଜଳସେଚନ", hi: "सिंचाई" },
  };
  return map[field]?.[locale] || field;
}

export function getLanguageName(locale: Locale): string {
  return t("language." + locale, locale);
}

export const AVAILABLE_LOCALES: Locale[] = ["en", "od", "hi"];

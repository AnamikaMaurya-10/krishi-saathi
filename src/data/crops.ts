export interface CropInfo {
  id: string;
  name: string;
  nameOdia: string;
  nameHindi: string;
  season: string;
  seasonOdia: string;
  seasonHindi: string;
  growthStages: {
    name: string;
    nameOdia: string;
    nameHindi: string;
    typicalDaysAfterSowing: [number, number];
  }[];
  waterNeeds: "low" | "moderate" | "high";
  temperatureRange: { min: number; max: number };
  frostSensitive: boolean;
  heatSensitive: boolean;
  rainfallNormal: number; // mm per season (kharif)
  advisoryRules: string[];
}

export const CROPS: Record<string, CropInfo> = {
  paddy: {
    id: "paddy",
    name: "Paddy (Rice)",
    nameOdia: "ଧାନ",
    nameHindi: "धान (चावल)",
    season: "Kharif (Jun–Nov)",
    seasonOdia: "ଖରିଫ (ଜୁନ–ନଭେମ୍ବର)",
    seasonHindi: "खरीफ (जून–नवंबर)",
    growthStages: [
      { name: "Germination", nameOdia: "ଅଙ୍କୁରୋତ୍ପାଦନ", nameHindi: "अंकुरण", typicalDaysAfterSowing: [0, 15] },
      { name: "Seedling", nameOdia: "ଚାରା", nameHindi: "बीजपत्र", typicalDaysAfterSowing: [15, 30] },
      { name: "Vegetative", nameOdia: "ବର୍ଦ୍ଧନଶୀଳ", nameHindi: "वानस्पतिक", typicalDaysAfterSowing: [30, 65] },
      { name: "Reproductive", nameOdia: "ପ୍ରଜନନ", nameHindi: "प्रजनन", typicalDaysAfterSowing: [65, 95] },
      { name: "Ripening", nameOdia: "ପାଚନ", nameHindi: "पकना", typicalDaysAfterSowing: [95, 120] },
      { name: "Harvest", nameOdia: "ଅମଳ", nameHindi: "फसल कटाई", typicalDaysAfterSowing: [120, 140] },
    ],
    waterNeeds: "high",
    temperatureRange: { min: 20, max: 38 },
    frostSensitive: true,
    heatSensitive: true,
    rainfallNormal: 1000,
    advisoryRules: [
      "maintain standing water during vegetative stage",
      "drain field before reproductive stage",
      "avoid water stress during flowering",
      "monitor for blast disease in humid conditions",
    ],
  },
  maize: {
    id: "maize",
    name: "Maize",
    nameOdia: "ମକା",
    nameHindi: "मक्का",
    season: "Kharif (Jun–Oct)",
    seasonOdia: "ଖରିଫ (ଜୁନ–ଅକ୍ଟୋବର)",
    seasonHindi: "खरीफ (जून–अक्टूबर)",
    growthStages: [
      { name: "Germination", nameOdia: "ଅଙ୍କୁରୋତ୍ପାଦନ", nameHindi: "अंकुरण", typicalDaysAfterSowing: [0, 10] },
      { name: "Vegetative", nameOdia: "ବର୍ଦ୍ଧନଶୀଳ", nameHindi: "वानस्पतिक", typicalDaysAfterSowing: [10, 45] },
      { name: "Tasseling/Silking", nameOdia: "ଫୁଲ ଫେଟା", nameHindi: "बाली निकलना", typicalDaysAfterSowing: [45, 65] },
      { name: "Grain Fill", nameOdia: "ଦାଣା ଭର୍ତ୍ତି", nameHindi: "दाना भरना", typicalDaysAfterSowing: [65, 85] },
      { name: "Harvest", nameOdia: "ଅମଳ", nameHindi: "फसल कटाई", typicalDaysAfterSowing: [85, 110] },
    ],
    waterNeeds: "moderate",
    temperatureRange: { min: 18, max: 35 },
    frostSensitive: true,
    heatSensitive: false,
    rainfallNormal: 600,
    advisoryRules: [
      "ensure adequate moisture during tasseling",
      "avoid waterlogging",
      "monitor for stem borer",
    ],
  },
  groundnut: {
    id: "groundnut",
    name: "Groundnut",
    nameOdia: "ଚିନିବାଦାମ",
    nameHindi: "मूंगफली",
    season: "Kharif (Jun–Oct)",
    seasonOdia: "ଖରିଫ (ଜୁନ–ଅକ୍ଟୋବର)",
    seasonHindi: "खरीफ (जून–अक्टूबर)",
    growthStages: [
      { name: "Germination", nameOdia: "ଅଙ୍କୁରୋତ୍ପାଦନ", nameHindi: "अंकुरण", typicalDaysAfterSowing: [0, 10] },
      { name: "Vegetative", nameOdia: "ବର୍ଦ୍ଧନଶୀଳ", nameHindi: "वानस्पतिक", typicalDaysAfterSowing: [10, 40] },
      { name: "Flowering/Pegging", nameOdia: "ଫୁଲ ଓ ପେଗିଂ", nameHindi: "फूल और पेगिंग", typicalDaysAfterSowing: [40, 60] },
      { name: "Pod Fill", nameOdia: "ଫଳଭର୍ତ୍ତି", nameHindi: "फली भरना", typicalDaysAfterSowing: [60, 80] },
      { name: "Harvest", nameOdia: "ଅମଳ", nameHindi: "फसल कटाई", typicalDaysAfterSowing: [80, 100] },
    ],
    waterNeeds: "moderate",
    temperatureRange: { min: 20, max: 35 },
    frostSensitive: true,
    heatSensitive: false,
    rainfallNormal: 500,
    advisoryRules: [
      "well-drained soil is important",
      "avoid excess moisture during pod formation",
      "monitor for leaf spot in wet conditions",
    ],
  },
};

export function getCropById(id: string): CropInfo | undefined {
  return CROPS[id] || CROPS["paddy"];
}

export function getCropStage(sowingDate: string, cropId: string): { name: string; nameOdia: string; nameHindi: string } | null {
  const crop = getCropById(cropId);
  if (!crop) return null;

  const sowing = new Date(sowingDate);
  const now = new Date();
  const daysSinceSowing = Math.floor((now.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24));

  for (const stage of crop.growthStages) {
    if (daysSinceSowing >= stage.typicalDaysAfterSowing[0] && daysSinceSowing < stage.typicalDaysAfterSowing[1]) {
      return { name: stage.name, nameOdia: stage.nameOdia, nameHindi: stage.nameHindi };
    }
  }
  // Return last stage if past harvest
  const lastStage = crop.growthStages[crop.growthStages.length - 1];
  return { name: lastStage.name, nameOdia: lastStage.nameOdia, nameHindi: lastStage.nameHindi };
}

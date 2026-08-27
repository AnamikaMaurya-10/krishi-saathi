export interface GovScheme {
  id: string;
  name: string;
  nameOdia: string;
  nameHindi: string;
  description: string;
  descriptionOdia: string;
  descriptionHindi: string;
  category: "crop_insurance" | "credit" | "disaster" | "irrigation" | "welfare";
  url: string;
  relevanceToRisk: string;
}

export const GOV_SCHEMES: GovScheme[] = [
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    nameOdia: "ପ୍ରଧାନମନ୍ତ୍ରୀ ଫସଲ ବିମା ଯୋଜନା",
    nameHindi: "प्रधानमंत्री फसल बीमा योजना",
    description: "Crop insurance scheme that protects farmers against crop loss due to natural calamities, pests, and diseases.",
    descriptionOdia: "ପ୍ରାକୃତିକ ବିପଦ, ପୋକ ଏବଂ ରୋଗ ଯୋଗୁଁ ଫସଲ କ୍ଷତିରୁ ଚାଷୀଙ୍କୁ ସୁରକ୍ଷା ଦେଉଥିବା ଫସଲ ବୀମା ଯୋଜନା।",
    descriptionHindi: "प्राकृतिक आपदाओं, कीटों और बीमारियों से फसल हानि के खिलाफ किसानों की रक्षा करने वाली फसल बीमा योजना।",
    category: "crop_insurance",
    url: "https://pmfby.gov.in",
    relevanceToRisk: "Relevant when crop loss is expected due to rainfall deviation",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    nameOdia: "କିଶାନ୍ କ୍ରେଡିଟ୍ କାର୍ଡ",
    nameHindi: "किसान क्रेडिट कार्ड",
    description: "Provides affordable crop loans to farmers for their agricultural needs, with interest subvention.",
    descriptionOdia: "ଚାଷୀମାନଙ୍କୁ ସେମାନଙ୍କ କୃଷି ଆବଶ୍ୟକତା ପାଇଁ ସାଶ୍ରୟ ଫସଲ ଋଣ ପ୍ରଦାନ କରେ।",
    descriptionHindi: "किसानों को उनकी कृषि आवश्यकताओं के लिए सस्ते फसल ऋण प्रदान करता है।",
    category: "credit",
    url: "https://pmkisan.gov.in",
    relevanceToRisk: "Relevant when loan repayment is under stress",
  },
  {
    id: "pmkisan",
    name: "PM-KISAN",
    nameOdia: "ପିଏମ୍-କିଶାନ୍",
    nameHindi: "पीएम-किसान",
    description: "Direct income support of ₹6,000 per year to small and marginal farmer families.",
    descriptionOdia: "ଛୋଟ ଏବଂ ସୀମାନ୍ତ ଚାଷୀ ପରିବାରମାନଙ୍କୁ ପ୍ରତି ବର୍ଷ ₹6,000 ସିଧାସଳଖ ଆୟ ସହାୟତା।",
    descriptionHindi: "छोटे और सीमांत किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता।",
    category: "welfare",
    url: "https://pmkisan.gov.in",
    relevanceToRisk: "Available to all eligible farmer families",
  },
  {
    id: "smb",
    name: "Soil Health Card Scheme",
    nameOdia: "ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ଯୋଜନା",
    nameHindi: "मृदा स्वास्थ्य कार्ड योजना",
    description: "Provides soil health cards to farmers with crop-wise recommendations on nutrients and fertilizers.",
    descriptionOdia: "ଚାଷୀମାନଙ୍କୁ ପୋଷକ ଏବଂ ସାର ଉପରେ ଫସଲ-ଅନୁସାରେ ସୁପାରିଶ ସହ ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ପ୍ରଦାନ କରେ।",
    descriptionHindi: "किसानों को पोषक तत्वों और उर्वरकों पर फसल-वार सिफारिशों के साथ मृदा स्वास्थ्य कार्ड प्रदान करता है।",
    category: "welfare",
    url: "https://soilhealth.dac.gov.in",
    relevanceToRisk: "Helps optimize fertilizer use and improve yields",
  },
  {
    id: "pmksy",
    name: "Pradhan Mantri Krishi Sinchayee Yojana",
    nameOdia: "ପ୍ରଧାନମନ୍ତ୍ରୀ କୃଷି ସିଞ୍ଚୟ ଯୋଜନା",
    nameHindi: "प्रधानमंत्री कृषि सिंचाई योजना",
    description: "Ensures water to every farm ('Per Drop More Crop') through micro-irrigation and watershed development.",
    descriptionOdia: "ମାଇକ୍ରୋ-ସିଞ୍ଚୟ ଏବଂ ଜଳାଧାର ବିକାଶ ମାଧ୍ୟମରେ ପ୍ରତ୍ୟେକ ଖେତକୁ ପାଣି ('ଅଧିକ ଫସଲ, ଅଳ୍ପ ପାଣି')।",
    descriptionHindi: "सूक्ष्म सिंचाई और जलसंभर विकास के माध्यम से हर खेत को पानी सुनिश्चित करता है ('हर बूंद, ज्यादा फसल')।",
    category: "irrigation",
    url: "https://pmksy.gov.in",
    relevanceToRisk: "Relevant when irrigation is not available",
  },
];

export function getRelevantSchemes(hasRainfallDeviation: boolean, hasLoanStress: boolean, hasIrrigation: boolean): GovScheme[] {
  const relevant: GovScheme[] = [];

  if (hasRainfallDeviation) {
    relevant.push(...GOV_SCHEMES.filter(s => s.id === "pmfby"));
  }
  if (hasLoanStress) {
    relevant.push(...GOV_SCHEMES.filter(s => s.id === "kcc"));
  }
  if (!hasIrrigation) {
    relevant.push(...GOV_SCHEMES.filter(s => s.id === "pmksy"));
  }

  // Always include PM-KISAN and Soil Health as general schemes
  relevant.push(...GOV_SCHEMES.filter(s => s.id === "pmkisan" || s.id === "smb"));

  // Deduplicate
  const seen = new Set<string>();
  return relevant.filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

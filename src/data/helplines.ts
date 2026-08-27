/**
 * Expert Helplines & Escalation Contacts
 * 
 * Real Indian agricultural and emergency helplines.
 * Used when the chatbot cannot resolve a farmer's issue
 * or when the farmer shows signs of financial/emotional distress.
 */

export interface Helpline {
  id: string;
  name: string;
  nameOdia: string;
  nameHindi: string;
  phone: string;
  description: string;
  descriptionOdia: string;
  descriptionHindi: string;
  available: string;
  type: "agriculture" | "emergency" | "mental_health" | "financial";
}

export const HELPLINES: Helpline[] = [
  {
    id: "kisan_call_center",
    name: "Kisan Call Centre",
    nameOdia: "କିଶାନ୍ କଲ୍ ସେଣ୍ଟର",
    nameHindi: "किसान कॉल सेंटर",
    phone: "1800-180-1551",
    description: "Toll-free agricultural advisory helpline by the Government of India. Available in local languages.",
    descriptionOdia: "ଭାରତ ସରକାରଙ୍କ ଦ୍ୱାରା ଟୋଲ୍-ଫ୍ରି କୃଷି ପରାମର୍ଶ ହେଲ୍ପଲାଇନ। ସ୍ଥାନୀୟ ଭାଷାରେ ଉପଲବ୍ଧ।",
    descriptionHindi: "भारत सरकार द्वारा टोल-फ्री कृषि सलाह हेल्पलाइन। स्थानीय भाषाओं में उपलब्ध।",
    available: "24/7",
    type: "agriculture",
  },
  {
    id: "pmfby_helpline",
    name: "PMFBY Crop Insurance Helpline",
    nameOdia: "ପିଏମ୍‌ଏଫ୍‌ବିଏଇ ଫସଲ ବୀମା ହେଲ୍ପଲାଇନ",
    nameHindi: "पीएमएफबीवाई फसल बीमा हेल्पलाइन",
    phone: "1800-180-1551",
    description: "For crop insurance claims and PMFBY scheme queries.",
    descriptionOdia: "ଫସଲ ବୀମା ଦାବି ଏବଂ ପିଏମ୍‌ଏଫ୍‌ବିଏଇ ଯୋଜନା ପ୍ରଶ୍ନ ପାଇଁ।",
    descriptionHindi: "फसल बीमा दावों और पीएमएफबीवाई योजना के प्रश्नों के लिए।",
    available: "24/7",
    type: "financial",
  },
  {
    id: "kisan_mitra",
    name: "Kisan Mitra / Agriculture Officer",
    nameOdia: "କିଶାନ୍ ମିତ୍ର / କୃଷି ଅଧିକାରୀ",
    nameHindi: "किसान मित्र / कृषि अधिकारी",
    phone: "Contact your Block Agriculture Officer",
    description: "Your local block agriculture officer can provide personalized crop advice and help with government scheme applications.",
    descriptionOdia: "ଆପଣଙ୍କ ସ୍ଥାନୀୟ ବ୍ଲକ୍ କୃଷି ଅଧିକାରୀ ବ୍ୟକ୍ତିଗତ ଫସଲ ପରାମର୍ଶ ଏବଂ ସରକାରୀ ଯୋଜନା ଆବେଦନରେ ସାହାଯ୍ୟ କରିପାରିବେ।",
    descriptionHindi: "आपके स्थानीय ब्लॉक कृषि अधिकारी व्यक्तिगत फसल सलाह और सरकारी योजना आवेदन में मदद कर सकते हैं।",
    available: "Working hours (10 AM – 5 PM)",
    type: "agriculture",
  },
  {
    id: "vandrevala",
    name: "Vandrevala Foundation (Mental Health)",
    nameOdia: "ଭାନ୍ଦ୍ରେବାଲା ଫାଉଣ୍ଡେସନ୍ (ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ)",
    nameHindi: "वंद्रेवाला फाउंडेशन (मानसिक स्वास्थ्य)",
    phone: "1860-2662-345",
    description: "Free 24/7 mental health support. Trained counselors available in multiple languages. If you or someone you know is going through a difficult time, please reach out.",
    descriptionOdia: "ମାଗଣା 24/7 ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟତା। ବହୁ ଭାଷାରେ ପ୍ରଶିକ୍ଷିତ ପରାମର୍ଶଦାତା ଉପलବ୍ଧ।",
    descriptionHindi: "मुफ्त 24/7 मानसिक स्वास्थ्य सहायता। कई भाषाओं में प्रशिक्षित परामर्शदाता उपलब्ध।",
    available: "24/7",
    type: "mental_health",
  },
  {
    id: "icall",
    name: "iCall (Psychosocial Support)",
    nameOdia: "ଆଇକଲ୍ (ସାଇକୋସୋଶାଲ୍ ସପୋର୍ଟ)",
    nameHindi: "आईकॉल (मनोसामाजिक सहायता)",
    phone: "9152987821",
    description: "Free psychosocial support helpline. Trained counselors available Monday to Saturday, 8 AM – 10 PM.",
    descriptionOdia: "ମାଗଣା ସାଇକୋସୋଶାଲ୍ ସପୋର୍ଟ ହେଲ୍ପଲାଇନ। ସୋମବାର ଠାରୁ ଶନିବାର, ସକାଳ 8 ଟା ରାତି 10 ଟା।",
    descriptionHindi: "मुफ्त मनोसामाजिक सहायता हेल्पलाइन। सोमवार से शनिवार, सुबह 8 बजे रात 10 बजे।",
    available: "Mon–Sat, 8 AM – 10 PM",
    type: "mental_health",
  },
  {
    id: "emergency",
    name: "Emergency Services",
    nameOdia: "ଜରୁରୀକାଳୀନ ସେବା",
    nameHindi: "आपातकालीन सेवाएं",
    phone: "112",
    description: "For any medical or safety emergency, dial 112 immediately.",
    descriptionOdia: "ଯେକୌଣସି ଚିକିତ୍ସା ବା ସୁରକ୍ଷା ଜରୁରୀକାଳୀନ ସ୍ଥିତିରେ, ତୁରନ୍ତ 112 ଡାୟାଲ୍ କରନ୍ତୁ।",
    descriptionHindi: "किसी भी चिकित्सा या सुरक्षा आपातकाल में, तुरंत 112 डायल करें।",
    available: "24/7",
    type: "emergency",
  },
];

export function getHelplinesByType(type: Helpline["type"]): Helpline[] {
  return HELPLINES.filter(h => h.type === type);
}

export function getEscalationMessage(farmerName: string, riskCategory: string, locale: string = "en"): string {
  const name = farmerName;
  
  if (locale === "od") {
    if (riskCategory === "HIGH") {
      return `${name}, ଆପଣଙ୍କ ପରିସ୍ଥିତି ଗୁରୁତର ଦେଖାଯାଉଛି। ଦୟାକରି ନିମ୍ନଲିଖିତ ହେଲ୍ପଲାଇନରେ ଯୋଗାଯୋଗ କରନ୍ତୁ — ଆପଣ ଏକୁଟିଆ ନୁହଁନ୍ତି।`;
    }
    return `${name}, ଯଦି ସାଧାରଣ ପରାମର୍ଶ ସହାୟକ ହେଉନାହିଁ, ଦୟାକରି ନିମ୍ନଲିଖିତ ବିଶେଷଜ୍ଞଙ୍କ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।`;
  }
  
  if (locale === "hi") {
    if (riskCategory === "HIGH") {
      return `${name}, आपकी स्थिति गंभीर दिख रही है। कृपया नीचे दी गई हेल्पलाइन पर संपर्क करें — आप अकेले नहीं हैं।`;
    }
    return `${name}, यदि सामान्य सलाह मददगार नहीं है, तो कृपया नीचे दिए गए विशेषज्ञों से संपर्क करें।`;
  }
  
  if (riskCategory === "HIGH") {
    return `${name}, your situation looks serious. Please reach out to the helplines below — you are not alone.`;
  }
  return `${name}, if the general advice isn't helping, please contact the experts below.`;
}

import { useLanguage } from "@/contexts/LanguageContext";
import { SAMPLE_FARMERS } from "@/data/farmers";
import { getCropById, getCropStage } from "@/data/crops";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Sprout, ArrowLeft, MapPin, Droplets, Wheat, Calendar, Landmark, Phone } from "lucide-react";
import { useNavigate } from "react-router";

const farmer = SAMPLE_FARMERS[0];

export default function ProfilePage() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const crop = getCropById(farmer.crop);
  const cropStage = getCropStage(farmer.sowingDate, farmer.crop);

  const cropName = crop ? (locale === "od" ? crop.nameOdia : locale === "hi" ? crop.nameHindi : crop.name) : "Paddy";
  const stageName = cropStage ? (locale === "od" ? cropStage.nameOdia : locale === "hi" ? cropStage.nameHindi : cropStage.name) : "\u2014";
  const farmerName = locale === "od" ? farmer.nameOdia : locale === "hi" ? farmer.nameHindi : farmer.name;

  const soilTypes: Record<string, Record<string, string>> = {
    loamy: { en: "Loamy", od: "\u0B26\u0B4B\u0B06", hi: "\u0926\u094B\u092E\u091F" },
    clay: { en: "Clay", od: "\u0B1A\u0BBF\u0B15\u0BBF\u0BBE \u0B2E\u0BBE\u0D1F\u0BFF", hi: "\u091A\u093F\u0915\u0928\u0940 \u092E\u093F\u091F\u094D\u091F\u0940" },
    sandy: { en: "Sandy", od: "\u0B2C\u0BBE\u0B32\u0BC1\u0B05", hi: "\u0930\u0947\u0924\u0940\u0932\u0940" },
    other: { en: "Other", od: "\u0B05\u0B28\u0D4D\u0D2F", hi: "\u0905\u0928\u094D\u092F" },
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded hover:bg-muted">
            <ArrowLeft className="size-5" />
          </button>
          <Sprout className="size-5 text-green-700" />
          <span className="font-semibold text-sm">{t("profile.title")}</span>
          <div className="ml-auto"><LanguageSelector /></div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Farmer info */}
        <div className="border border-border bg-card p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-11 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
              <span className="text-base font-bold text-green-700">{farmerName.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">{farmerName}</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span>{farmer.village}, {farmer.district}, {farmer.state}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("profile.crop")}</p>
              <p className="font-medium flex items-center gap-1.5"><Wheat className="size-3.5 text-amber-600" /> {cropName}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("profile.farmSize")}</p>
              <p className="font-medium">{farmer.farmSize} {t("farmer.acres")}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("profile.sowingDate")}</p>
              <p className="font-medium flex items-center gap-1.5">
                <Calendar className="size-3.5 text-blue-500" />
                {new Date(farmer.sowingDate).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("farmer.cropStage")}</p>
              <p className="font-medium">{stageName}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("profile.soilType")}</p>
              <p className="font-medium">{soilTypes[farmer.soilType]?.[locale] || farmer.soilType}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("profile.irrigationAvail")}</p>
              <p className="font-medium flex items-center gap-1.5">
                <Droplets className="size-3.5 text-blue-400" />
                {farmer.irrigationAvailable ? t("farmer.available") : t("farmer.notAvailable")}
              </p>
            </div>
          </div>
        </div>

        {/* Loan details */}
        <div className="border border-border bg-card p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Landmark className="size-4 text-muted-foreground" />
            {t("profile.loanDetails")}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("profile.loanAmount")}</p>
              <p className="font-medium">{'\u20B9'}{farmer.loanAmount.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("profile.loanDueDate")}</p>
              <p className="font-medium">{new Date(farmer.loanDueDate).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-muted-foreground mb-0.5">{t("profile.loanLender")}</p>
              <p className="font-medium">{farmer.loanLender}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="border border-border bg-card p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{farmer.phoneNumber}</span>
          </div>
        </div>

        {/* Government schemes */}
        <div className="border border-border bg-card p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-1">{t("schemes.title")}</h3>
          <p className="text-[11px] text-muted-foreground mb-3">{t("schemes.disclaimer")}</p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-green-50 border border-green-100 rounded">
              <p className="font-medium text-green-800">{t("schemes.cropInsurance")}</p>
              <p className="text-green-700 mt-0.5">Protects against crop loss from natural calamities, pests, and disease.</p>
            </div>
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded">
              <p className="font-medium text-blue-800">{t("schemes.agriCredit")}</p>
              <p className="text-blue-700 mt-0.5">Affordable crop loans with interest subvention for farming needs.</p>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded">
              <p className="font-medium text-amber-800">PM-KISAN</p>
              <p className="text-amber-700 mt-0.5">{'\u20B9'}6,000 per year direct income support to farmer families.</p>
            </div>
            <div className="p-2.5 bg-purple-50 border border-purple-100 rounded">
              <p className="font-medium text-purple-800">{t("schemes.irrigationSupport")} (PMKSY)</p>
              <p className="text-purple-700 mt-0.5">Micro-irrigation and watershed development support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

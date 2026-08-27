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
  const stageName = cropStage ? (locale === "od" ? cropStage.nameOdia : locale === "hi" ? cropStage.nameHindi : cropStage.name) : "—";
  const farmerName = locale === "od" ? farmer.nameOdia : locale === "hi" ? farmer.nameHindi : farmer.name;

  const soilTypes: Record<string, Record<string, string>> = {
    loamy: { en: "Loamy", od: "ଦୋଆ", hi: "दोमट" },
    clay: { en: "Clay", od: "ଚିକଣା ମାଟି", hi: "चिकनी मिट्टी" },
    sandy: { en: "Sandy", od: "ବାଲୁଅ", hi: "रेतीली" },
    other: { en: "Other", od: "ଅନ୍ୟ", hi: "अन्य" },
  };

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded-lg hover:bg-muted">
            <ArrowLeft className="size-5" />
          </button>
          <Sprout className="size-5 text-green-700" />
          <span className="font-bold text-sm">{t("profile.title")}</span>
          <div className="ml-auto"><LanguageSelector /></div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Farmer Info */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-lg font-bold text-green-700">{farmerName.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{farmerName}</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span>{farmer.village}, {farmer.district}, {farmer.state}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("profile.crop")}</p>
              <p className="font-medium flex items-center gap-1.5"><Wheat className="size-3.5 text-amber-600" /> {cropName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("profile.farmSize")}</p>
              <p className="font-medium">{farmer.farmSize} {t("farmer.acres")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("profile.sowingDate")}</p>
              <p className="font-medium flex items-center gap-1.5">
                <Calendar className="size-3.5 text-blue-500" />
                {new Date(farmer.sowingDate).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("farmer.cropStage")}</p>
              <p className="font-medium">{stageName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("profile.soilType")}</p>
              <p className="font-medium">{soilTypes[farmer.soilType]?.[locale] || farmer.soilType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("profile.irrigationAvail")}</p>
              <p className="font-medium flex items-center gap-1.5">
                <Droplets className="size-3.5 text-blue-400" />
                {farmer.irrigationAvailable ? `✓ ${t("farmer.available")}` : `✗ ${t("farmer.notAvailable")}`}
              </p>
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Landmark className="size-4 text-muted-foreground" />
            {t("profile.loanDetails")}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("profile.loanAmount")}</p>
              <p className="font-medium">₹{farmer.loanAmount.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("profile.loanDueDate")}</p>
              <p className="font-medium">{new Date(farmer.loanDueDate).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-0.5">{t("profile.loanLender")}</p>
              <p className="font-medium">{farmer.loanLender}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{farmer.phoneNumber}</span>
          </div>
        </div>

        {/* Government Schemes */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-2">{t("schemes.title")}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t("schemes.disclaimer")}</p>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">{t("schemes.cropInsurance")}</p>
              <p className="text-green-700">Crop loss protection against natural calamities</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800">{t("schemes.agriCredit")}</p>
              <p className="text-blue-700">Affordable crop loans with interest subvention</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <p className="font-medium text-amber-800">PM-KISAN</p>
              <p className="text-amber-700">₹6,000/year direct income support</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-800">{t("schemes.irrigationSupport")}</p>
              <p className="text-purple-700">Micro-irrigation and watershed development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

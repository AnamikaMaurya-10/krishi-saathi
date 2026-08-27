import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SAMPLE_FARMERS } from "@/data/farmers";
import { getCropById } from "@/data/crops";
import { getRainData, getNormalRainfall } from "@/data/rainNormals";
import { getPriceChangePercent } from "@/data/marketPrices";
import { calculateDistressScore } from "@/services/riskCalculator";
import { getMainRiskReasons } from "@/services/riskCalculator";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Sprout, ArrowLeft, AlertTriangle, TrendingDown, Phone, Eye } from "lucide-react";
import { useNavigate } from "react-router";

interface FarmerRiskRow {
  farmer: typeof SAMPLE_FARMERS[0];
  riskResult: ReturnType<typeof calculateDistressScore>;
  reasons: string[];
}

export default function OfficerDashboard() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);

  const farmerRiskData: FarmerRiskRow[] = useMemo(() => {
    return SAMPLE_FARMERS.map((farmer) => {
      const rainData = getRainData(farmer.district);
      const normalRain = getNormalRainfall(farmer.district);
      // Simulate rainfall deviation based on loan pressure and location
      const rainfallDeviation = -10 - (Math.abs(farmer.loanAmount) / 1000) * 1.2;
      const priceDecline = getPriceChangePercent(farmer.crop);
      const loanDue = new Date(farmer.loanDueDate);
      const daysUntilLoan = Math.floor((loanDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const riskResult = calculateDistressScore(rainfallDeviation, priceDecline, daysUntilLoan);
      const reasons = getMainRiskReasons(riskResult);

      return { farmer, riskResult, reasons };
    }).sort((a, b) => b.riskResult.totalScore - a.riskResult.totalScore);
  }, []);

  const highRisk = farmerRiskData.filter(f => f.riskResult.category === "HIGH").length;
  const medRisk = farmerRiskData.filter(f => f.riskResult.category === "MEDIUM").length;
  const lowRisk = farmerRiskData.filter(f => f.riskResult.category === "LOW").length;

  const selectedData = farmerRiskData.find(f => f.farmer.id === selectedFarmer);

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-muted">
            <ArrowLeft className="size-5" />
          </button>
          <Sprout className="size-5 text-green-700" />
          <span className="font-bold text-sm">{t("officer.title")}</span>
          <div className="ml-auto"><LanguageSelector /></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{farmerRiskData.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("officer.totalFarmers")}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{highRisk}</p>
            <p className="text-[10px] text-red-700 mt-0.5">{t("officer.highRisk")}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{medRisk}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">{t("officer.mediumRisk")}</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{lowRisk}</p>
            <p className="text-[10px] text-green-700 mt-0.5">{t("officer.lowRisk")}</p>
          </div>
        </div>

        {/* Risk Distribution Bar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">{t("officer.riskDistribution")}</h3>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
            {highRisk > 0 && (
              <div className="bg-red-500 h-full" style={{ width: `${(highRisk / farmerRiskData.length) * 100}%` }} />
            )}
            {medRisk > 0 && (
              <div className="bg-amber-500 h-full" style={{ width: `${(medRisk / farmerRiskData.length) * 100}%` }} />
            )}
            {lowRisk > 0 && (
              <div className="bg-green-500 h-full" style={{ width: `${(lowRisk / farmerRiskData.length) * 100}%` }} />
            )}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>HIGH: {highRisk}</span>
            <span>MEDIUM: {medRisk}</span>
            <span>LOW: {lowRisk}</span>
          </div>
        </div>

        {/* Farmer Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">{t("officer.farmerList")}</h3>
          </div>
          <div className="divide-y divide-border">
            {farmerRiskData.map((row) => {
              const { farmer, riskResult, reasons } = row;
              const crop = getCropById(farmer.crop);
              const cropName = crop ? (locale === "od" ? crop.nameOdia : locale === "hi" ? crop.nameHindi : crop.name) : "Paddy";
              const farmerName = locale === "od" ? farmer.nameOdia : locale === "hi" ? farmer.nameHindi : farmer.name;
              const villageName = farmer.village;
              const cat = riskResult.category;

              return (
                <div
                  key={farmer.id}
                  onClick={() => setSelectedFarmer(selectedFarmer === farmer.id ? null : farmer.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedFarmer === farmer.id ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{farmerName}</span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs text-muted-foreground">{villageName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{cropName}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{reasons[0]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${cat === "HIGH" ? "text-red-600" : cat === "MEDIUM" ? "text-amber-600" : "text-green-600"}`}>
                          {riskResult.totalScore}
                        </p>
                        <p className={`text-[10px] font-semibold ${cat === "HIGH" ? "text-red-600" : cat === "MEDIUM" ? "text-amber-600" : "text-green-600"}`}>
                          {cat}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {selectedFarmer === farmer.id && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                      {/* Risk Breakdown */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-[10px] text-muted-foreground">{t("risk.rainfall")}</p>
                          <p className="text-sm font-bold">{riskResult.breakdown.rainfall.score}/100</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-[10px] text-muted-foreground">{t("risk.marketPrice")}</p>
                          <p className="text-sm font-bold">{riskResult.breakdown.marketPrice.score}/100</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-[10px] text-muted-foreground">{t("risk.loanProximity")}</p>
                          <p className="text-sm font-bold">{riskResult.breakdown.loanProximity.score}/100</p>
                        </div>
                      </div>

                      {/* Reasons */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{t("officer.mainReason")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {reasons.map((reason, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full">{reason}</span>
                          ))}
                        </div>
                      </div>

                      {/* Farm Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Area:</span> <span className="font-medium">{farmer.farmSize} acres</span></div>
                        <div><span className="text-muted-foreground">Loan:</span> <span className="font-medium">₹{farmer.loanAmount.toLocaleString("en-IN")}</span></div>
                        <div><span className="text-muted-foreground">Soil:</span> <span className="font-medium capitalize">{farmer.soilType}</span></div>
                        <div><span className="text-muted-foreground">Irrigation:</span> <span className="font-medium">{farmer.irrigationAvailable ? "Yes" : "No"}</span></div>
                      </div>

                      {/* Suggested Intervention */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{t("risk.suggestedIntervention")}</p>
                        <div className="space-y-1 text-xs text-foreground">
                          <p>• {t("interventions.contact")}</p>
                          <p>• {t("interventions.advisory")}</p>
                          <p>• {t("interventions.irrigation")}</p>
                          <p>• {t("interventions.mandi")}</p>
                          <p>• {t("interventions.scheme")}</p>
                          {riskResult.category === "HIGH" && <p>• {t("interventions.escalate")}</p>}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                          <Phone className="size-3.5" /> {t("risk.contactFarmer")}
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                          <Eye className="size-3.5" /> {t("risk.sendAdvisory")}
                        </button>
                      </div>

                      <p className="text-[10px] text-muted-foreground">{t("risk.disclaimer")}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const PROFIT_MULTIPLES = {
  saas: { min: 18, max: 45 },
  ecommerce: { min: 10, max: 26 },
  content: { min: 15, max: 32 },
  website: { min: 15, max: 32 },
  app: { min: 12, max: 30 },
  other: { min: 10, max: 24 },
};

const REVENUE_MULTIPLES = {
  saas: { min: 1.5, max: 3.2 },
  ecommerce: { min: 1.0, max: 2.2 },
  content: { min: 0.9, max: 1.8 },
  website: { min: 0.9, max: 1.8 },
  app: { min: 1.0, max: 2.1 },
  other: { min: 0.8, max: 1.6 },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  return Number(value) || 0;
};

const normalizeAssetType = (value) => {
  if (!value) return "other";
  const key = String(value).toLowerCase();
  if (PROFIT_MULTIPLES[key]) return key;
  if (key === "e-commerce" || key === "ecommerce") return "ecommerce";
  if (key === "content" || key === "content_site") return "content";
  return "other";
};

const addUnique = (list, item) => {
  if (!list.includes(item)) list.push(item);
};

export const calculateMultiplier = (inputs) => {
  const assetType = normalizeAssetType(inputs.assetType);
  const baseRange = PROFIT_MULTIPLES[assetType] || PROFIT_MULTIPLES.other;
  const adjustments = [];
  const warnings = [];

  const revenueStability = inputs.revenueStability || "";
  const margin = toNumber(inputs.margin);
  const trafficGrowth = toNumber(inputs.trafficGrowth);
  const projectAgeMonths = toNumber(inputs.projectAgeMonths);
  const monthlyRevenue = toNumber(inputs.monthlyRevenue);
  const seasonality = inputs.seasonality || "";
  const channelMix = inputs.channelMix || {};
  const paidShare = toNumber(channelMix.paid);
  const documentationQuality = inputs.documentationQuality || "";
  const techDebt = inputs.techDebt || "";
  const platformRisk = inputs.platformRisk || "";
  const operatingHours = toNumber(inputs.operatingHours);
  const revenueConcentration = toNumber(inputs.revenueConcentration);
  const proofCount = toNumber(inputs.proofCount);
  const proofLinksCount = toNumber(inputs.proofLinksCount);
  const churnRate = toNumber(inputs.churnRate);

  const addAdjustment = (key, delta) => {
    if (!delta) return;
    adjustments.push({ key, delta });
  };

  if (revenueStability === "high") addAdjustment("stabilityHigh", 3);
  if (revenueStability === "medium") addAdjustment("stabilityMedium", 1);
  if (revenueStability === "low") addAdjustment("stabilityLow", -3);

  if (margin >= 50) addAdjustment("marginStrong", 2);
  if (margin > 0 && margin < 20) addAdjustment("marginWeak", -2);

  if (trafficGrowth > 25) {
    addAdjustment("growthHighRisk", -3);
    addUnique(warnings, "growthHighRisk");
  } else if (trafficGrowth >= 10) {
    addAdjustment("growthHealthy", 1);
  } else if (trafficGrowth < 0) {
    addAdjustment("growthSlow", -2);
  }

  if (seasonality === "high") addAdjustment("seasonalityHigh", -2);

  if (paidShare >= 60) addAdjustment("paidHeavy", -2);

  if (revenueConcentration >= 40) addAdjustment("highConcentration", -2);
  if (revenueConcentration > 0 && revenueConcentration < 15) {
    addAdjustment("lowConcentration", 1);
  }

  if (operatingHours > 20) addAdjustment("highOps", -2);
  if (operatingHours > 0 && operatingHours <= 6) addAdjustment("lowOps", 2);

  if (documentationQuality === "good") addAdjustment("docsGood", 2);
  if (documentationQuality === "none") addAdjustment("docsNone", -2);

  if (techDebt === "high") addAdjustment("techDebtHigh", -2);

  if (platformRisk === "high") addAdjustment("platformRiskHigh", -3);

  if (proofCount + proofLinksCount > 0) addAdjustment("proofsAvailable", 2);
  if (proofCount + proofLinksCount === 0) addAdjustment("noProofs", -1);

  if (assetType === "saas") {
    if (revenueStability !== "high") addAdjustment("saasStabilityCap", -2);
    if (churnRate > 8) addAdjustment("saasChurnHigh", -2);
  }

  if (projectAgeMonths > 0 && projectAgeMonths < 3) {
    addAdjustment("youngProject", -4);
    addUnique(warnings, "youngProject");
  }

  if (projectAgeMonths > 0 && projectAgeMonths <= 1 && monthlyRevenue >= 50000) {
    addAdjustment("youngRevenueHigh", -3);
    addUnique(warnings, "youngRevenueHigh");
  }

  if (margin > 70) addUnique(warnings, "marginHigh");

  const delta = adjustments.reduce((sum, item) => sum + item.delta, 0);

  let adjustedMin = clamp(baseRange.min + delta, baseRange.min, baseRange.max - 2);
  let adjustedMax = clamp(baseRange.max + delta, adjustedMin + 2, baseRange.max);

  if (assetType === "saas" && revenueStability !== "high") {
    adjustedMax = Math.min(adjustedMax, 32);
    adjustedMin = Math.min(adjustedMin, adjustedMax - 2);
  }

  if (projectAgeMonths > 0 && projectAgeMonths < 3) {
    const ageCap = Math.min(baseRange.min + 6, baseRange.max);
    adjustedMax = Math.min(adjustedMax, ageCap);
    adjustedMin = Math.min(adjustedMin, adjustedMax - 2);
  }

  if (projectAgeMonths > 0 && projectAgeMonths <= 1 && monthlyRevenue >= 50000) {
    const revenueCap = Math.min(baseRange.min + 4, baseRange.max);
    adjustedMax = Math.min(adjustedMax, revenueCap);
    adjustedMin = Math.min(adjustedMin, adjustedMax - 2);
  }

  return {
    assetType,
    baseRange,
    adjustedRange: { min: adjustedMin, max: adjustedMax },
    adjustments,
    warnings,
  };
};

export const calculateConfidence = (inputs) => {
  let score = 55;
  const reasons = [];

  const revenueStability = inputs.revenueStability || "";
  const margin = toNumber(inputs.margin);
  const projectAgeMonths = toNumber(inputs.projectAgeMonths);
  const proofCount = toNumber(inputs.proofCount);
  const proofLinksCount = toNumber(inputs.proofLinksCount);
  const platformRisk = inputs.platformRisk || "";
  const documentationQuality = inputs.documentationQuality || "";
  const techDebt = inputs.techDebt || "";
  const revenueConcentration = toNumber(inputs.revenueConcentration);
  const paidShare = toNumber(inputs.channelMix?.paid);

  if (revenueStability === "high") {
    score += 10;
    addUnique(reasons, "stableRevenue");
  }
  if (revenueStability === "low") {
    score -= 8;
    addUnique(reasons, "unstableRevenue");
  }

  if (margin >= 40) {
    score += 6;
    addUnique(reasons, "strongMargin");
  }
  if (margin > 0 && margin < 20) {
    score -= 6;
    addUnique(reasons, "weakMargin");
  }

  if (projectAgeMonths >= 12) {
    score += 5;
    addUnique(reasons, "seasonedAsset");
  }
  if (projectAgeMonths > 0 && projectAgeMonths < 3) {
    score -= 10;
    addUnique(reasons, "youngAsset");
  }

  if (proofCount + proofLinksCount > 0) {
    score += 8;
    addUnique(reasons, "proofsAvailable");
  }
  if (proofCount + proofLinksCount === 0) {
    score -= 6;
    addUnique(reasons, "noProofs");
  }

  if (documentationQuality === "good") {
    score += 5;
    addUnique(reasons, "documentationReady");
  }
  if (documentationQuality === "none") {
    score -= 4;
    addUnique(reasons, "documentationWeak");
  }

  if (platformRisk === "high") {
    score -= 8;
    addUnique(reasons, "platformRisk");
  }

  if (techDebt === "high") {
    score -= 5;
    addUnique(reasons, "techDebt");
  }

  if (revenueConcentration >= 40) {
    score -= 6;
    addUnique(reasons, "highConcentration");
  }

  if (paidShare >= 60) {
    score -= 5;
    addUnique(reasons, "paidHeavy");
  }

  score = clamp(score, 20, 92);

  return { score, reasons };
};

export const calculateValuation = (inputs) => {
  const assetType = normalizeAssetType(inputs.assetType);
  const revenue = toNumber(inputs.monthlyRevenue);
  const expenses = toNumber(inputs.monthlyExpenses);
  const netProfit = revenue - expenses;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const lossMaking = expenses >= revenue || netProfit <= 0;

  const normalizedInputs = {
    ...inputs,
    assetType,
    monthlyRevenue: revenue,
    monthlyExpenses: expenses,
    netProfit,
    margin,
  };

  const proofLinksCount = inputs.proofLinksCount ??
    Object.values(inputs.proofLinks || {}).filter(Boolean).length;

  const baseWarnings = [];
  if (lossMaking) addUnique(baseWarnings, "lossMaking");
  if (revenue <= 0) addUnique(baseWarnings, "noRevenue");

  const multiplierResult = calculateMultiplier({
    ...normalizedInputs,
    proofLinksCount,
  });

  const confidence = calculateConfidence({
    ...normalizedInputs,
    proofLinksCount,
  });

  const warnings = Array.from(new Set([...baseWarnings, ...multiplierResult.warnings]));

  const adjustmentsSorted = [...multiplierResult.adjustments].sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta)
  );

  const keyFactors = adjustmentsSorted.slice(0, 3).map((item) => item.key);

  let valuationRange = { min: 0, recommended: 0, max: 0 };
  let multiplierRange = multiplierResult.adjustedRange;
  let method = "profit";

  if (lossMaking) {
    const revenueRange = REVENUE_MULTIPLES[assetType] || REVENUE_MULTIPLES.other;
    const delta = multiplierResult.adjustments.reduce((sum, item) => sum + item.delta, 0);
    const adjustedMin = clamp(revenueRange.min + delta * 0.1, 0.6, revenueRange.max - 0.2);
    const adjustedMax = clamp(revenueRange.max + delta * 0.1, adjustedMin + 0.2, revenueRange.max);
    multiplierRange = { min: adjustedMin, max: adjustedMax };
    method = "revenue";
    valuationRange = {
      min: revenue * multiplierRange.min,
      max: revenue * multiplierRange.max,
      recommended: revenue * (multiplierRange.min + multiplierRange.max) * 0.5,
    };
    if (revenue <= 0) {
      const baseFloor = (PROFIT_MULTIPLES[assetType]?.min || 10) * 1000;
      valuationRange = {
        min: baseFloor * 0.6,
        recommended: baseFloor * 0.9,
        max: baseFloor * 1.2,
      };
      method = "asset";
    }
  } else {
    valuationRange = {
      min: netProfit * multiplierRange.min,
      max: netProfit * multiplierRange.max,
      recommended: netProfit * (multiplierRange.min + multiplierRange.max) * 0.5,
    };
  }

  if (inputs.projectAgeMonths > 0 && inputs.projectAgeMonths < 3) {
    valuationRange.max = Math.min(valuationRange.max, valuationRange.recommended * 1.15);
    valuationRange.min = Math.min(valuationRange.min, valuationRange.recommended * 0.85);
  }

  const scenarios = {
    conservative: valuationRange.min,
    base: valuationRange.recommended,
    aggressive: valuationRange.max,
  };

  const listingPrice = valuationRange.recommended;

  const risks = [];
  if (lossMaking) risks.push("lossMaking");
  if (inputs.projectAgeMonths > 0 && inputs.projectAgeMonths < 3) risks.push("youngProject");
  if (inputs.platformRisk === "high") risks.push("platformRisk");
  if (inputs.channelMix?.paid >= 60) risks.push("paidHeavy");
  if (inputs.revenueConcentration >= 40) risks.push("highConcentration");
  if (inputs.churnRate > 8) risks.push("highChurn");
  if (inputs.documentationQuality === "none") risks.push("weakDocs");
  if (inputs.techDebt === "high") risks.push("techDebt");
  if (inputs.seasonality === "high") risks.push("seasonality");

  return {
    method,
    valuationRange,
    scenarios,
    listingPrice,
    netProfit,
    margin,
    baseRange: multiplierResult.baseRange,
    adjustedRange: multiplierRange,
    adjustments: multiplierResult.adjustments,
    warnings,
    risks,
    confidence,
    keyFactors,
    assetType,
    lossMaking,
  };
};

export const generateInsights = (inputs, outputs, options = {}) => {
  const detailLevel = options.detailLevel || "standard";
  const strengths = [];
  const weaknesses = [];

  if (outputs.margin >= 40) addUnique(strengths, "strongMargin");
  if (outputs.margin > 0 && outputs.margin < 20) addUnique(weaknesses, "weakMargin");

  if (inputs.revenueStability === "high") addUnique(strengths, "stableRevenue");
  if (inputs.revenueStability === "low") addUnique(weaknesses, "unstableRevenue");

  if (inputs.trafficGrowth >= 10) addUnique(strengths, "growthMomentum");
  if (inputs.trafficGrowth < 0) addUnique(weaknesses, "growthSlow");

  if (inputs.channelMix?.paid >= 60) addUnique(weaknesses, "paidHeavy");

  if (inputs.documentationQuality === "good") addUnique(strengths, "documentationReady");
  if (inputs.documentationQuality === "none") addUnique(weaknesses, "weakDocs");

  if (inputs.proofCount + (inputs.proofLinksCount || 0) > 0) {
    addUnique(strengths, "proofsReady");
  } else {
    addUnique(weaknesses, "noProofs");
  }

  if (inputs.projectAgeMonths >= 12) addUnique(strengths, "seasonedAsset");
  if (inputs.projectAgeMonths > 0 && inputs.projectAgeMonths < 3) {
    addUnique(weaknesses, "youngProject");
  }

  if (outputs.lossMaking) addUnique(weaknesses, "lossMaking");

  const biggestRisk = outputs.risks[0] || "generalRisk";

  const quickTips = [];
  if (outputs.lossMaking) addUnique(quickTips, "reduceCosts");
  if (inputs.revenueStability === "low") addUnique(quickTips, "stabilizeRevenue");
  if (inputs.channelMix?.paid >= 60) addUnique(quickTips, "reducePaid");
  if (inputs.documentationQuality === "none") addUnique(quickTips, "documentOps");
  if (inputs.proofCount + (inputs.proofLinksCount || 0) === 0) {
    addUnique(quickTips, "collectProofs");
  }
  if (quickTips.length < 3) addUnique(quickTips, "growthPlan");
  if (quickTips.length < 3) addUnique(quickTips, "prepareDataRoom");

  const actionPlan = {
    days7: [],
    days30: [],
    days90: [],
  };

  const addAction = (bucket, key) => addUnique(actionPlan[bucket], key);

  if (inputs.proofCount + (inputs.proofLinksCount || 0) === 0) addAction("days7", "collectProofs");
  if (inputs.documentationQuality === "none") addAction("days7", "documentOps");
  if (inputs.revenueStability === "low") addAction("days30", "stabilizeRevenue");
  if (outputs.lossMaking) addAction("days30", "reduceCosts");
  if (inputs.channelMix?.paid >= 50) addAction("days30", "reducePaid");
  if (inputs.revenueConcentration >= 40) addAction("days30", "diversifyChannels");
  if (inputs.churnRate > 8) addAction("days30", "improveRetention");
  if (inputs.techDebt === "high") addAction("days90", "fixTechDebt");
  if (inputs.platformRisk === "high") addAction("days90", "reduceDependency");
  if (!actionPlan.days90.length) addAction("days90", "growthPlan");

  const buyerQuestions = [];
  addUnique(buyerQuestions, "revenueStability");
  addUnique(buyerQuestions, "trafficSources");
  addUnique(buyerQuestions, "costStructure");
  addUnique(buyerQuestions, "handover");

  if (inputs.assetType === "saas") {
    addUnique(buyerQuestions, "retention");
    addUnique(buyerQuestions, "churnDrivers");
  }

  if (inputs.assetType === "ecommerce") {
    addUnique(buyerQuestions, "supplierDependence");
  }

  if (inputs.channelMix?.paid >= 50) addUnique(buyerQuestions, "paidEfficiency");
  if (inputs.platformRisk === "high") addUnique(buyerQuestions, "platformDependence");

  while (buyerQuestions.length < 7) {
    addUnique(buyerQuestions, "growthDrivers");
    addUnique(buyerQuestions, "riskMitigation");
  }

  const sellabilityScore = clamp(
    Math.round(outputs.confidence.score * 0.75 + (outputs.margin > 30 ? 15 : 5)),
    25,
    95
  );

  const sellabilityReasons = [];
  if (outputs.lossMaking) addUnique(sellabilityReasons, "lossMaking");
  if (inputs.revenueStability === "high") addUnique(sellabilityReasons, "stableRevenue");
  if (inputs.proofCount + (inputs.proofLinksCount || 0) > 0) {
    addUnique(sellabilityReasons, "proofsAvailable");
  }
  if (inputs.projectAgeMonths < 3) addUnique(sellabilityReasons, "youngAsset");
  if (inputs.documentationQuality === "good") addUnique(sellabilityReasons, "clearOps");

  if (detailLevel === "rich") {
    addUnique(strengths, "diverseChannels");
    addUnique(weaknesses, "highConcentration");
  }

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    biggestRisk,
    quickTips: quickTips.slice(0, 3),
    actionPlan,
    buyerQuestions: buyerQuestions.slice(0, 7),
    sellability: {
      score: sellabilityScore,
      reasons: sellabilityReasons,
    },
  };
};

import { useMemo, useState } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import {
  calculateConfidence,
  calculateValuation,
  generateInsights,
} from "../../utils/valuationEngine";
import ValuationQuickForm from "./ValuationQuickForm";
import ValuationAdvancedForm from "./ValuationAdvancedForm";
import ValuationResults from "./ValuationResults";
import ValuationAIChat from "./ValuationAIChat";

const DEFAULT_VALUES = {
  assetType: "",
  projectAgeMonths: "",
  monthlyRevenue: "",
  monthlyExpenses: "",
  monthlyProfit: "",
  revenueStability: "",
  seasonality: "",
  targetMarket: "",
  niche: "",
  trafficGrowth: "",
  trafficTrend: "",
  monthlySessions: "",
  refundRate: "",
  revenueConcentration: "",
  conversionRate: "",
  retentionRate: "",
  churnRate: "",
  operatingHours: "",
  team: "",
  documentationQuality: "",
  techDebt: "",
  platformRisk: "",
  singlePointFailure: "",
  channelMix: {
    seo: "",
    paid: "",
    social: "",
    direct: "",
    email: "",
    referral: "",
  },
  proofFiles: [],
  proofLinks: {
    analytics: "",
    stripe: "",
    appStore: "",
    other: "",
  },
};

const parseNumberInput = (value) => {
  if (value === "") return "";
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  return cleaned;
};

const validateValuation = (values, errorsText, profitMode) => {
  const errors = {};
  if (!values.assetType) errors.assetType = errorsText.assetType;
  if (!values.monthlyRevenue) errors.monthlyRevenue = errorsText.monthlyRevenue;
  if (profitMode === "profit") {
    if (!values.monthlyProfit) errors.monthlyProfit = errorsText.monthlyProfit;
  } else if (!values.monthlyExpenses) {
    errors.monthlyExpenses = errorsText.monthlyExpenses;
  }
  if (!values.trafficGrowth) errors.trafficGrowth = errorsText.trafficGrowth;
  if (!values.revenueStability) errors.revenueStability = errorsText.revenueStability;

  const firstErrorField = Object.keys(errors)[0] || "";
  return { valid: !firstErrorField, errors, firstErrorField };
};

export default function ValuationForm({ language = "EN", text }) {
  const { currency, formatCurrency, formatNumber, toSAR } = useCurrency();
  const [mode, setMode] = useState("quick");
  const [profitMode, setProfitMode] = useState("expenses");
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [result, setResult] = useState(null);
  const [insights, setInsights] = useState(null);
  const [lastInputs, setLastInputs] = useState(null);

  const locale = language === "AR" ? "ar-SA" : "en-US";

  const monthlyRevenue = Number(values.monthlyRevenue) || 0;
  const monthlyExpensesInput = Number(values.monthlyExpenses) || 0;
  const monthlyProfitInput = Number(values.monthlyProfit) || 0;
  const effectiveProfit =
    profitMode === "profit"
      ? Math.min(monthlyProfitInput, monthlyRevenue)
      : monthlyRevenue - monthlyExpensesInput;
  const effectiveExpenses =
    profitMode === "profit"
      ? Math.max(monthlyRevenue - effectiveProfit, 0)
      : monthlyExpensesInput;
  const margin =
    monthlyRevenue > 0 ? (effectiveProfit / monthlyRevenue) * 100 : 0;

  const netProfitDisplay = formatCurrency(toSAR(effectiveProfit, currency), {
    locale,
    currencyCode: currency,
  });
  const marginDisplay = `${formatNumber(margin, {
    locale,
    maximumFractionDigits: 1,
  })}%`;

  const channelTotals = useMemo(
    () =>
      Object.values(values.channelMix).reduce(
        (total, value) => total + (Number(value) || 0),
        0
      ),
    [values.channelMix]
  );

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setFormMessage("");
  };

  const handleNumberChange = (field) => (event) => {
    const value = parseNumberInput(event.target.value);
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setFormMessage("");
  };

  const handleNestedChange = (group, field) => (event) => {
    const value = event.target.value;
    setValues((prev) => ({
      ...prev,
      [group]: { ...prev[group], [field]: value },
    }));
  };

  const handleNestedNumber = (group, field) => (event) => {
    const value = parseNumberInput(event.target.value);
    setValues((prev) => ({
      ...prev,
      [group]: { ...prev[group], [field]: value },
    }));
  };

  const handleProfitModeChange = (nextMode) => {
    setProfitMode(nextMode);
    setValues((prev) => {
      const revenue = Number(prev.monthlyRevenue) || 0;
      const expenses = Number(prev.monthlyExpenses) || 0;
      const profit = Number(prev.monthlyProfit) || 0;
      if (nextMode === "profit") {
        return {
          ...prev,
          monthlyProfit: profit || Math.max(revenue - expenses, 0),
        };
      }
      return {
        ...prev,
        monthlyExpenses: expenses || Math.max(revenue - profit, 0),
      };
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setValues((prev) => ({ ...prev, proofFiles: files }));
  };

  const focusFirstError = (field) => {
    if (!field || typeof document === "undefined") return;
    const target = document.querySelector(`[data-field="${field}"]`);
    if (!target) return;
    target.scrollIntoView?.({ behavior: "smooth", block: "center" });
    target.focus?.({ preventScroll: true });
  };

  const buildInputs = () => {
    const revenueSAR = toSAR(monthlyRevenue, currency);
    const expensesSAR = toSAR(effectiveExpenses, currency);
    const proofLinksCount = Object.values(values.proofLinks).filter(Boolean).length;

    return {
      assetType: values.assetType,
      projectAgeMonths: Number(values.projectAgeMonths) || 0,
      monthlyRevenue: revenueSAR,
      monthlyExpenses: expensesSAR,
      margin,
      revenueStability: values.revenueStability,
      seasonality: values.seasonality,
      trafficGrowth: Number(values.trafficGrowth) || 0,
      trafficTrend: values.trafficTrend,
      monthlySessions: Number(values.monthlySessions) || 0,
      refundRate: Number(values.refundRate) || 0,
      revenueConcentration: Number(values.revenueConcentration) || 0,
      conversionRate: Number(values.conversionRate) || 0,
      retentionRate: Number(values.retentionRate) || 0,
      churnRate: Number(values.churnRate) || 0,
      operatingHours: Number(values.operatingHours) || 0,
      team: values.team,
      documentationQuality: values.documentationQuality,
      techDebt: values.techDebt,
      platformRisk: values.platformRisk,
      singlePointFailure: values.singlePointFailure,
      channelMix: {
        seo: Number(values.channelMix.seo) || 0,
        paid: Number(values.channelMix.paid) || 0,
        social: Number(values.channelMix.social) || 0,
        direct: Number(values.channelMix.direct) || 0,
        email: Number(values.channelMix.email) || 0,
        referral: Number(values.channelMix.referral) || 0,
      },
      proofCount: values.proofFiles.length,
      proofLinksCount,
      proofLinks: values.proofLinks,
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { valid, errors: nextErrors, firstErrorField } = validateValuation(
      values,
      text.errors,
      profitMode
    );

    if (!valid) {
      setErrors(nextErrors);
      setFormMessage(text.validationMessage);
      focusFirstError(firstErrorField);
      return;
    }

    setErrors({});
    setFormMessage("");

    const inputs = buildInputs();
    const computed = calculateValuation(inputs);
    const generatedInsights = generateInsights(inputs, computed);

    setResult(computed);
    setInsights(generatedInsights);
    setLastInputs(inputs);
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
    setErrors({});
    setFormMessage("");
    setProfitMode("expenses");
    setResult(null);
    setInsights(null);
    setLastInputs(null);
  };

  const confidencePreview = (() => {
    const hasRevenue = values.monthlyRevenue !== "";
    const hasExpenseOrProfit =
      profitMode === "profit"
        ? values.monthlyProfit !== ""
        : values.monthlyExpenses !== "";
    const hasGrowth = values.trafficGrowth !== "";
    const hasStability = values.revenueStability !== "";

    if (!hasRevenue || !hasExpenseOrProfit || !hasGrowth || !hasStability) return null;
    return calculateConfidence(buildInputs());
  })();

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode === "advanced") {
      handleProfitModeChange("expenses");
    }
  };

  return (
    <div className="valuation-card">
      <div className="valuation-header">
        <h2>{text.pageTitle}</h2>
        <p className="muted">{text.pageSubtitle}</p>
      </div>

      <div className="valuation-mode-toggle">
        <button
          type="button"
          className={mode === "quick" ? "active" : ""}
          onClick={() => handleModeChange("quick")}
        >
          {text.modes.quick}
        </button>
        <button
          type="button"
          className={mode === "advanced" ? "active" : ""}
          onClick={() => handleModeChange("advanced")}
        >
          {text.modes.advanced}
        </button>
      </div>

      <p className="valuation-mode-hint">
        {mode === "quick" ? text.quick.subtitle : text.advanced.subtitle}
      </p>

      {mode === "quick" ? (
        <ValuationQuickForm
          values={values}
          errors={errors}
          text={text}
          currency={currency}
          netProfitDisplay={netProfitDisplay}
          marginDisplay={marginDisplay}
          confidenceScore={confidencePreview?.score}
          profitMode={profitMode}
          onProfitModeChange={handleProfitModeChange}
          onChange={handleChange}
          onNumberChange={handleNumberChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          formMessage={formMessage}
        />
      ) : (
        <ValuationAdvancedForm
          values={values}
          errors={errors}
          text={text}
          currency={currency}
          netProfitDisplay={netProfitDisplay}
          marginDisplay={marginDisplay}
          channelTotals={formatNumber(channelTotals, { locale })}
          onChange={handleChange}
          onNumberChange={handleNumberChange}
          onNestedChange={handleNestedChange}
          onNestedNumber={handleNestedNumber}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          formMessage={formMessage}
        />
      )}

      <ValuationResults
        result={result}
        insights={insights}
        text={text}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        language={language}
        mode={mode}
      />

      <ValuationAIChat
        inputs={lastInputs}
        result={result}
        text={text}
        formatCurrency={formatCurrency}
        language={language}
      />
    </div>
  );
}

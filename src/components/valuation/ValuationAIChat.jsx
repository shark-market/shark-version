import { useMemo, useState } from "react";
import { generateInsights } from "../../utils/valuationEngine";

const interpolate = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");

export default function ValuationAIChat({
  inputs,
  result,
  text,
  formatCurrency,
  language,
}) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);

  const locale = language === "AR" ? "ar-SA" : "en-US";

  const formattedValues = useMemo(() => {
    if (!inputs || !result) return null;
    const formatSar = (value) =>
      formatCurrency(value, { locale, currencyCode: "SAR" });
    return {
      assetType: text.options.assetTypes[result.assetType] || result.assetType,
      revenue: formatSar(result.method === "asset" ? 0 : inputs.monthlyRevenue || 0),
      expenses: formatSar(result.method === "asset" ? 0 : inputs.monthlyExpenses || 0),
      margin: `${Math.round(result.margin)}%`,
      recommended: formatSar(result.valuationRange.recommended),
      min: formatSar(result.valuationRange.min),
      max: formatSar(result.valuationRange.max),
      stability: inputs.revenueStability
        ? text.options.stability[inputs.revenueStability]
        : "-",
    };
  }, [formatCurrency, inputs, language, locale, result, text]);

  const handleAsk = () => {
    if (!inputs || !result) return;
    const richInsights = generateInsights(inputs, result, { detailLevel: "rich" });
    const summary = interpolate(text.aiChat.summaryTemplate, {
      assetType: formattedValues?.assetType || "-",
      revenue: formattedValues?.revenue || "-",
      expenses: formattedValues?.expenses || "-",
      margin: formattedValues?.margin || "-",
      stability: formattedValues?.stability || "-",
      min: formattedValues?.min || "-",
      max: formattedValues?.max || "-",
      recommended: formattedValues?.recommended || "-",
    });

    setResponse({
      prompt,
      summary,
      insights: richInsights,
    });
  };

  if (!result) {
    return (
      <div className="valuation-ai-chat">
        <div className="ai-chat-header">
          <h4>{text.aiChat.title}</h4>
          <p className="muted">{text.aiChat.subtitle}</p>
        </div>
        <div className="ai-chat-empty">{text.aiChat.emptyState}</div>
      </div>
    );
  }

  return (
    <div className="valuation-ai-chat">
      <div className="ai-chat-header">
        <h4>{text.aiChat.title}</h4>
        <p className="muted">{text.aiChat.subtitle}</p>
      </div>
      <div className="ai-chat-input">
        <label htmlFor="aiPrompt">{text.aiChat.promptLabel}</label>
        <textarea
          id="aiPrompt"
          rows={3}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={text.aiChat.placeholder}
        />
        <button className="btn btn-dark" type="button" onClick={handleAsk}>
          {text.aiChat.button}
        </button>
      </div>

      {response ? (
        <div className="ai-chat-response">
          {response.prompt ? (
            <div className="ai-chat-message user">
              <strong>{text.aiChat.userLabel}</strong>
              <p>{response.prompt}</p>
            </div>
          ) : null}

          <div className="ai-chat-message assistant">
            <strong>{text.aiChat.responseLabel}</strong>
            <p>{response.summary}</p>

            <div className="ai-chat-section">
              <h5>{text.insights.strengthsTitle}</h5>
              <ul>
                {response.insights.strengths.map((key) => (
                  <li key={`ai-strength-${key}`}>{text.insights.strengths[key]}</li>
                ))}
              </ul>
            </div>

            <div className="ai-chat-section">
              <h5>{text.insights.weaknessesTitle}</h5>
              <ul>
                {response.insights.weaknesses.map((key) => (
                  <li key={`ai-weak-${key}`}>{text.insights.weaknesses[key]}</li>
                ))}
              </ul>
            </div>

            <div className="ai-chat-section">
              <h5>{text.insights.actionPlanTitle}</h5>
              <div className="ai-chat-plan">
                <div>
                  <span>{text.insights.days7}</span>
                  <ul>
                    {response.insights.actionPlan.days7.map((key) => (
                      <li key={`ai-7-${key}`}>{text.insights.actions[key]}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span>{text.insights.days30}</span>
                  <ul>
                    {response.insights.actionPlan.days30.map((key) => (
                      <li key={`ai-30-${key}`}>{text.insights.actions[key]}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span>{text.insights.days90}</span>
                  <ul>
                    {response.insights.actionPlan.days90.map((key) => (
                      <li key={`ai-90-${key}`}>{text.insights.actions[key]}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="ai-chat-section">
              <h5>{text.insights.buyerQuestionsTitle}</h5>
              <ul>
                {response.insights.buyerQuestions.map((key) => (
                  <li key={`ai-q-${key}`}>{text.insights.buyerQuestions[key]}</li>
                ))}
              </ul>
            </div>

            <div className="ai-chat-section">
              <h5>{text.insights.sellabilityTitle}</h5>
              <p>
                {text.insights.sellabilityScoreLabel}: {response.insights.sellability.score}
              </p>
              <ul>
                {response.insights.sellability.reasons.map((key) => (
                  <li key={`ai-sell-${key}`}>{text.insights.sellabilityReasons[key]}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

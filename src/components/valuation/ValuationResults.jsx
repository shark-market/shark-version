const formatDelta = (value) => {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}`;
};

const interpolate = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");

export default function ValuationResults({
  result,
  insights,
  text,
  formatCurrency,
  formatNumber,
  language,
  mode,
}) {
  if (!result) return null;

  const locale = language === "AR" ? "ar-SA" : "en-US";
  const formatSar = (value) =>
    formatCurrency(value, { locale, currencyCode: "SAR" });

  const sellabilitySummary = insights?.sellability
    ? interpolate(text.insights.sellabilitySummary, {
        score: insights.sellability.score,
      })
    : "";

  return (
    <section className="valuation-results">
      <div className="valuation-results-header">
        <div>
          <h3>{text.results.title}</h3>
          <p className="muted">{text.results.method[result.method]}</p>
        </div>
        {result.lossMaking ? (
          <span className="pill pill-warning">{text.results.lossMakingBadge}</span>
        ) : null}
      </div>

      <div className="valuation-results-grid">
        <div className="valuation-result-card">
          <span className="range-label">{text.results.scenarios.conservative}</span>
          <strong>{formatSar(result.scenarios.conservative)}</strong>
        </div>
        <div className="valuation-result-card recommended">
          <span className="range-label">{text.results.scenarios.base}</span>
          <strong>{formatSar(result.scenarios.base)}</strong>
        </div>
        <div className="valuation-result-card">
          <span className="range-label">{text.results.scenarios.aggressive}</span>
          <strong>{formatSar(result.scenarios.aggressive)}</strong>
        </div>
      </div>

      <div className="valuation-price-grid">
        <div className="summary-card">
          <h4>{text.results.listingPriceTitle}</h4>
          <div className="summary-list">
            <div>
              <span>{text.results.listingPriceLabel}</span>
              <strong>{formatSar(result.listingPrice)}</strong>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <h4>{text.results.confidenceLabel}</h4>
          <div className="confidence-row">
            <strong>{formatNumber(result.confidence.score, { locale })}/100</strong>
            <span className="muted">{text.results.confidenceHint}</span>
          </div>
          <div className="confidence-bar">
            <span style={{ width: `${result.confidence.score}%` }} />
          </div>
          <div className="confidence-reasons">
            <span>{text.results.confidenceReasonsTitle}</span>
            <ul>
              {result.confidence.reasons.map((reason) => (
                <li key={reason}>{text.confidenceReasons[reason]}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="valuation-panel">
        <h4>{text.results.multipliersTitle}</h4>
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <span>{text.results.baseMultipleLabel}</span>
            <strong>
              {result.baseRange.min}x - {result.baseRange.max}x
            </strong>
          </div>
          <div className="breakdown-card">
            <span>{text.results.adjustedMultipleLabel}</span>
            <strong>
              {result.adjustedRange.min}x - {result.adjustedRange.max}x
            </strong>
          </div>
        </div>
        <div className="valuation-adjustments">
          <h5>{text.results.adjustmentsLabel}</h5>
          {result.adjustments.length ? (
            <div className="factor-list">
              {result.adjustments.map((adjustment) => (
                <div className="factor-row" key={`${adjustment.key}-${adjustment.delta}`}>
                  <span>{text.adjustments[adjustment.key]}</span>
                  <strong
                    className={
                      adjustment.delta > 0 ? "factor-positive" : "factor-negative"
                    }
                  >
                    {formatDelta(adjustment.delta)}x
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">{text.results.noAdjustments}</p>
          )}
        </div>
      </div>

      {result.warnings.length ? (
        <div className="valuation-panel">
          <h4>{text.results.warningsTitle}</h4>
          <ul>
            {result.warnings.map((warning) => (
              <li key={warning}>{text.warnings[warning]}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="valuation-panel">
        <h4>{text.results.keyFactorsTitle}</h4>
        <ul>
          {result.keyFactors.map((factor) => (
            <li key={factor}>{text.adjustments[factor]}</li>
          ))}
        </ul>
      </div>

      <div className="valuation-panel">
        <h4>{text.results.risksTitle}</h4>
        <ul>
          {result.risks.map((risk) => (
            <li key={risk}>{text.risks[risk]}</li>
          ))}
        </ul>
      </div>

      {mode === "quick" && insights ? (
        <div className="valuation-panel">
          <h4>{text.results.quickTipsTitle}</h4>
          <ul>
            {insights.quickTips.map((tip) => (
              <li key={tip}>{text.insights.actions[tip]}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {mode === "advanced" && insights ? (
        <div className="valuation-panel">
          <h4>{text.results.insightsTitle}</h4>
          <div className="valuation-insights-grid">
            <div>
              <h5>{text.insights.strengthsTitle}</h5>
              <ul>
                {insights.strengths.map((strength) => (
                  <li key={strength}>{text.insights.strengths[strength]}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5>{text.insights.weaknessesTitle}</h5>
              <ul>
                {insights.weaknesses.map((weakness) => (
                  <li key={weakness}>{text.insights.weaknesses[weakness]}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5>{text.insights.biggestRiskTitle}</h5>
              <p>{text.risks[insights.biggestRisk]}</p>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "advanced" && insights ? (
        <div className="valuation-panel">
          <h4>{text.insights.actionPlanTitle}</h4>
          <div className="action-plan-grid">
            <div className="action-card">
              <h5>{text.insights.days7}</h5>
              <ul>
                {insights.actionPlan.days7.map((item) => (
                  <li key={item}>{text.insights.actions[item]}</li>
                ))}
              </ul>
            </div>
            <div className="action-card">
              <h5>{text.insights.days30}</h5>
              <ul>
                {insights.actionPlan.days30.map((item) => (
                  <li key={item}>{text.insights.actions[item]}</li>
                ))}
              </ul>
            </div>
            <div className="action-card">
              <h5>{text.insights.days90}</h5>
              <ul>
                {insights.actionPlan.days90.map((item) => (
                  <li key={item}>{text.insights.actions[item]}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "advanced" && insights ? (
        <div className="valuation-panel">
          <h4>{text.insights.buyerQuestionsTitle}</h4>
          <ul>
            {insights.buyerQuestions.map((question) => (
              <li key={question}>{text.insights.buyerQuestions[question]}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {mode === "advanced" && insights ? (
        <div className="valuation-panel">
          <h4>{text.insights.sellabilityTitle}</h4>
          <p className="muted">{sellabilitySummary}</p>
          <div className="sellability-score">
            <strong>
              {text.insights.sellabilityScoreLabel}: {insights.sellability.score}/100
            </strong>
          </div>
          <ul>
            {insights.sellability.reasons.map((reason) => (
              <li key={reason}>{text.insights.sellabilityReasons[reason]}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

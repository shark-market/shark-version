export default function ValuationAdvancedForm({
  values,
  errors,
  text,
  currency,
  netProfitDisplay,
  marginDisplay,
  channelTotals,
  onChange,
  onNumberChange,
  onNestedChange,
  onNestedNumber,
  onToggle,
  onFileChange,
  onSubmit,
  onReset,
  formMessage,
}) {
  return (
    <form className="valuation-form" onSubmit={onSubmit}>
      {formMessage ? (
        <div className="form-error-banner" role="alert">
          {formMessage}
        </div>
      ) : null}

      <details className="valuation-accordion" open>
        <summary>{text.sections.basics}</summary>
        <div className="valuation-accordion-body">
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="assetType">{text.fields.assetType}</label>
              <select
                id="assetType"
                value={values.assetType}
                onChange={onChange("assetType")}
                data-field="assetType"
                aria-invalid={Boolean(errors.assetType)}
                aria-describedby={errors.assetType ? "asset-type-error" : undefined}
                className={errors.assetType ? "input-error" : ""}
              >
                <option value="">{text.placeholders.select}</option>
                {Object.entries(text.options.assetTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.assetType ? (
                <span className="field-error" id="asset-type-error">
                  {errors.assetType}
                </span>
              ) : null}
            </div>

            <div className="field-group">
              <label htmlFor="projectAge">{text.fields.projectAge}</label>
              <input
                id="projectAge"
                type="number"
                min="0"
                value={values.projectAgeMonths}
                onChange={onNumberChange("projectAgeMonths")}
                data-field="projectAgeMonths"
                aria-invalid={Boolean(errors.projectAgeMonths)}
                aria-describedby={errors.projectAgeMonths ? "project-age-error" : undefined}
                className={errors.projectAgeMonths ? "input-error" : ""}
              />
              {errors.projectAgeMonths ? (
                <span className="field-error" id="project-age-error">
                  {errors.projectAgeMonths}
                </span>
              ) : null}
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="targetMarket">{text.fields.targetMarket}</label>
              <input
                id="targetMarket"
                type="text"
                value={values.targetMarket}
                onChange={onChange("targetMarket")}
              />
            </div>
            <div className="field-group">
              <label htmlFor="niche">{text.fields.niche}</label>
              <input
                id="niche"
                type="text"
                value={values.niche}
                onChange={onChange("niche")}
              />
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="revenueStability">{text.fields.revenueStability}</label>
              <select
                id="revenueStability"
                value={values.revenueStability}
                onChange={onChange("revenueStability")}
                data-field="revenueStability"
                aria-invalid={Boolean(errors.revenueStability)}
                aria-describedby={errors.revenueStability ? "revenue-stability-error" : undefined}
                className={errors.revenueStability ? "input-error" : ""}
              >
                <option value="">{text.placeholders.select}</option>
                <option value="high">{text.options.stability.high}</option>
                <option value="medium">{text.options.stability.medium}</option>
                <option value="low">{text.options.stability.low}</option>
              </select>
              {errors.revenueStability ? (
                <span className="field-error" id="revenue-stability-error">
                  {errors.revenueStability}
                </span>
              ) : null}
            </div>

            <div className="field-group">
              <label htmlFor="seasonality">{text.fields.seasonality}</label>
              <select
                id="seasonality"
                value={values.seasonality}
                onChange={onChange("seasonality")}
              >
                <option value="">{text.placeholders.select}</option>
                <option value="none">{text.options.seasonality.none}</option>
                <option value="low">{text.options.seasonality.low}</option>
                <option value="high">{text.options.seasonality.high}</option>
              </select>
            </div>
          </div>
        </div>
      </details>

      <details className="valuation-accordion" open>
        <summary>{text.sections.financials}</summary>
        <div className="valuation-accordion-body">
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="monthlyRevenue">
                {text.fields.monthlyRevenue} ({currency})
              </label>
              <input
                id="monthlyRevenue"
                type="number"
                min="0"
                value={values.monthlyRevenue}
                onChange={onNumberChange("monthlyRevenue")}
                data-field="monthlyRevenue"
                aria-invalid={Boolean(errors.monthlyRevenue)}
                aria-describedby={errors.monthlyRevenue ? "monthly-revenue-error" : undefined}
                className={errors.monthlyRevenue ? "input-error" : ""}
              />
              {errors.monthlyRevenue ? (
                <span className="field-error" id="monthly-revenue-error">
                  {errors.monthlyRevenue}
                </span>
              ) : null}
            </div>

            <div className="field-group">
              <label htmlFor="monthlyExpenses">
                {text.fields.monthlyExpenses} ({currency})
              </label>
              <input
                id="monthlyExpenses"
                type="number"
                min="0"
                value={values.monthlyExpenses}
                onChange={onNumberChange("monthlyExpenses")}
                data-field="monthlyExpenses"
                aria-invalid={Boolean(errors.monthlyExpenses)}
                aria-describedby={errors.monthlyExpenses ? "monthly-expenses-error" : undefined}
                className={errors.monthlyExpenses ? "input-error" : ""}
              />
              {errors.monthlyExpenses ? (
                <span className="field-error" id="monthly-expenses-error">
                  {errors.monthlyExpenses}
                </span>
              ) : null}
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label>{text.fields.monthlyNetProfit}</label>
              <div className="computed-field" aria-live="polite">
                {netProfitDisplay}
              </div>
            </div>
            <div className="field-group">
              <label>{text.fields.grossMargin}</label>
              <div className="computed-field" aria-live="polite">
                {marginDisplay}
              </div>
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="refundRate">{text.fields.refundRate}</label>
              <input
                id="refundRate"
                type="number"
                min="0"
                max="100"
                value={values.refundRate}
                onChange={onNumberChange("refundRate")}
              />
            </div>
            <div className="field-group">
              <label htmlFor="revenueConcentration">{text.fields.revenueConcentration}</label>
              <input
                id="revenueConcentration"
                type="number"
                min="0"
                max="100"
                value={values.revenueConcentration}
                onChange={onNumberChange("revenueConcentration")}
              />
            </div>
          </div>
        </div>
      </details>

      <details className="valuation-accordion">
        <summary>{text.sections.growth}</summary>
        <div className="valuation-accordion-body">
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="monthlySessions">{text.fields.monthlySessions}</label>
              <input
                id="monthlySessions"
                type="number"
                min="0"
                value={values.monthlySessions}
                onChange={onNumberChange("monthlySessions")}
              />
            </div>
            <div className="field-group">
              <label htmlFor="trafficGrowth">{text.fields.trafficGrowth}</label>
              <input
                id="trafficGrowth"
                type="number"
                value={values.trafficGrowth}
                onChange={onNumberChange("trafficGrowth")}
                data-field="trafficGrowth"
                aria-invalid={Boolean(errors.trafficGrowth)}
                aria-describedby={errors.trafficGrowth ? "traffic-growth-error" : undefined}
                className={errors.trafficGrowth ? "input-error" : ""}
              />
              {errors.trafficGrowth ? (
                <span className="field-error" id="traffic-growth-error">
                  {errors.trafficGrowth}
                </span>
              ) : null}
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="trafficTrend">{text.fields.trafficTrend}</label>
              <select
                id="trafficTrend"
                value={values.trafficTrend}
                onChange={onChange("trafficTrend")}
              >
                <option value="">{text.placeholders.select}</option>
                <option value="up">{text.options.trafficTrend.up}</option>
                <option value="flat">{text.options.trafficTrend.flat}</option>
                <option value="down">{text.options.trafficTrend.down}</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="conversionRate">{text.fields.conversionRate}</label>
              <input
                id="conversionRate"
                type="number"
                min="0"
                max="100"
                value={values.conversionRate}
                onChange={onNumberChange("conversionRate")}
              />
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="retentionRate">{text.fields.retentionRate}</label>
              <input
                id="retentionRate"
                type="number"
                min="0"
                max="100"
                value={values.retentionRate}
                onChange={onNumberChange("retentionRate")}
              />
            </div>
            <div className="field-group">
              <label htmlFor="churnRate">{text.fields.churnRate}</label>
              <input
                id="churnRate"
                type="number"
                min="0"
                max="100"
                value={values.churnRate}
                onChange={onNumberChange("churnRate")}
              />
            </div>
          </div>

          <div className="field-group">
            <label>{text.fields.channelMix}</label>
            <div className="channel-grid">
              {Object.entries(text.options.channels).map(([key, label]) => (
                <div className="field-group" key={`channel-${key}`}>
                  <label htmlFor={`channel-${key}`}>{label}</label>
                  <input
                    id={`channel-${key}`}
                    type="number"
                    min="0"
                    max="100"
                    value={values.channelMix[key]}
                    onChange={onNestedNumber("channelMix", key)}
                  />
                </div>
              ))}
            </div>
            <div className="channel-total">
              <span>{text.helpers.channelMixTotal}</span>
              <strong>{channelTotals}%</strong>
            </div>
          </div>
        </div>
      </details>

      <details className="valuation-accordion">
        <summary>{text.sections.risks}</summary>
        <div className="valuation-accordion-body">
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="operatingHours">{text.fields.operatingHours}</label>
              <input
                id="operatingHours"
                type="number"
                min="0"
                value={values.operatingHours}
                onChange={onNumberChange("operatingHours")}
              />
            </div>
            <div className="field-group">
              <label htmlFor="team">{text.fields.team}</label>
              <select id="team" value={values.team} onChange={onChange("team")}>
                <option value="">{text.placeholders.select}</option>
                <option value="solo">{text.options.team.solo}</option>
                <option value="team">{text.options.team.team}</option>
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="documentationQuality">{text.fields.documentationQuality}</label>
              <select
                id="documentationQuality"
                value={values.documentationQuality}
                onChange={onChange("documentationQuality")}
              >
                <option value="">{text.placeholders.select}</option>
                <option value="none">{text.options.documentation.none}</option>
                <option value="basic">{text.options.documentation.basic}</option>
                <option value="good">{text.options.documentation.good}</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="techDebt">{text.fields.techDebt}</label>
              <select id="techDebt" value={values.techDebt} onChange={onChange("techDebt")}>
                <option value="">{text.placeholders.select}</option>
                <option value="low">{text.options.techDebt.low}</option>
                <option value="medium">{text.options.techDebt.medium}</option>
                <option value="high">{text.options.techDebt.high}</option>
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="platformRisk">{text.fields.platformRisk}</label>
              <select
                id="platformRisk"
                value={values.platformRisk}
                onChange={onChange("platformRisk")}
              >
                <option value="">{text.placeholders.select}</option>
                <option value="low">{text.options.platformRisk.low}</option>
                <option value="medium">{text.options.platformRisk.medium}</option>
                <option value="high">{text.options.platformRisk.high}</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="singlePointFailure">{text.fields.singlePointFailure}</label>
              <select
                id="singlePointFailure"
                value={values.singlePointFailure}
                onChange={onChange("singlePointFailure")}
              >
                <option value="">{text.placeholders.select}</option>
                <option value="yes">{text.options.yes}</option>
                <option value="no">{text.options.no}</option>
              </select>
            </div>
          </div>
        </div>
      </details>

      <details className="valuation-accordion">
        <summary>{text.sections.proofs}</summary>
        <div className="valuation-accordion-body">
          <div className="field-group">
            <label htmlFor="proofFiles">{text.fields.proofFiles}</label>
            <input
              id="proofFiles"
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={onFileChange}
            />
            <span className="muted">{text.helpers.proofFiles}</span>
          </div>

          <div className="proof-links-grid">
            <div className="field-group">
              <label htmlFor="analyticsLink">{text.fields.analyticsLink}</label>
              <input
                id="analyticsLink"
                type="url"
                value={values.proofLinks.analytics}
                onChange={onNestedChange("proofLinks", "analytics")}
              />
            </div>
            <div className="field-group">
              <label htmlFor="stripeLink">{text.fields.stripeLink}</label>
              <input
                id="stripeLink"
                type="url"
                value={values.proofLinks.stripe}
                onChange={onNestedChange("proofLinks", "stripe")}
              />
            </div>
            <div className="field-group">
              <label htmlFor="appStoreLink">{text.fields.appStoreLink}</label>
              <input
                id="appStoreLink"
                type="url"
                value={values.proofLinks.appStore}
                onChange={onNestedChange("proofLinks", "appStore")}
              />
            </div>
            <div className="field-group">
              <label htmlFor="otherProofLink">{text.fields.otherProofLink}</label>
              <input
                id="otherProofLink"
                type="url"
                value={values.proofLinks.other}
                onChange={onNestedChange("proofLinks", "other")}
              />
            </div>
          </div>
        </div>
      </details>

      <div className="valuation-actions">
        <button className="btn btn-dark" type="submit">
          {text.actions.calculate}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onReset}>
          {text.actions.reset}
        </button>
      </div>
    </form>
  );
}

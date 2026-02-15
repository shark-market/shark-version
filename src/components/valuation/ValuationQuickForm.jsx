export default function ValuationQuickForm({
  values,
  errors,
  text,
  currency,
  netProfitDisplay,
  marginDisplay,
  confidenceScore,
  profitMode,
  onProfitModeChange,
  onChange,
  onNumberChange,
  onSubmit,
  onReset,
  formMessage,
}) {
  const revenuePresets = [0, 5000, 10000, 25000, 50000];
  const expensePresets = [0, 2000, 5000, 10000];
  const growthPresets = [0, 5, 15];

  const applyPreset = (field, value) => {
    onNumberChange(field)({ target: { value: String(value) } });
  };

  return (
    <form className="valuation-form" onSubmit={onSubmit}>
      {formMessage ? (
        <div className="form-error-banner" role="alert">
          {formMessage}
        </div>
      ) : null}

      <div className="valuation-quick-grid">
        <div className="field-group">
          <label htmlFor="quick-assetType">{text.fields.assetType}</label>
          <select
            id="quick-assetType"
            value={values.assetType}
            onChange={onChange("assetType")}
            data-field="assetType"
            aria-invalid={Boolean(errors.assetType)}
            aria-describedby={errors.assetType ? "quick-asset-type-error" : undefined}
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
            <span className="field-error" id="quick-asset-type-error">
              {errors.assetType}
            </span>
          ) : null}
        </div>

        <div className="field-group">
          <label htmlFor="quick-monthlyRevenue">
            {text.fields.monthlyRevenue} ({currency})
          </label>
          <input
            id="quick-monthlyRevenue"
            type="number"
            min="0"
            value={values.monthlyRevenue}
            onChange={onNumberChange("monthlyRevenue")}
            data-field="monthlyRevenue"
            aria-invalid={Boolean(errors.monthlyRevenue)}
            aria-describedby={errors.monthlyRevenue ? "quick-revenue-error" : undefined}
            className={errors.monthlyRevenue ? "input-error" : ""}
          />
          {errors.monthlyRevenue ? (
            <span className="field-error" id="quick-revenue-error">
              {errors.monthlyRevenue}
            </span>
          ) : null}
          <div className="preset-group">
            <span>{text.quick.presetsRevenue}</span>
            <div className="preset-buttons">
              {revenuePresets.map((preset) => (
                <button
                  key={`revenue-${preset}`}
                  type="button"
                  className="preset-button"
                  onClick={() => applyPreset("monthlyRevenue", preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field-group">
          <div className="quick-input-toggle" role="group" aria-label={text.quick.inputModeLabel}>
            <button
              type="button"
              className={profitMode === "expenses" ? "active" : ""}
              onClick={() => onProfitModeChange("expenses")}
            >
              {text.quick.expensesLabel}
            </button>
            <button
              type="button"
              className={profitMode === "profit" ? "active" : ""}
              onClick={() => onProfitModeChange("profit")}
            >
              {text.quick.profitLabel}
            </button>
          </div>

          {profitMode === "expenses" ? (
            <>
              <label htmlFor="quick-monthlyExpenses">
                {text.fields.monthlyExpenses} ({currency})
              </label>
              <input
                id="quick-monthlyExpenses"
                type="number"
                min="0"
                value={values.monthlyExpenses}
                onChange={onNumberChange("monthlyExpenses")}
                data-field="monthlyExpenses"
                aria-invalid={Boolean(errors.monthlyExpenses)}
                aria-describedby={errors.monthlyExpenses ? "quick-expenses-error" : undefined}
                className={errors.monthlyExpenses ? "input-error" : ""}
              />
              {errors.monthlyExpenses ? (
                <span className="field-error" id="quick-expenses-error">
                  {errors.monthlyExpenses}
                </span>
              ) : null}
              <div className="preset-group">
                <span>{text.quick.presetsExpenses}</span>
                <div className="preset-buttons">
                  {expensePresets.map((preset) => (
                    <button
                      key={`expense-${preset}`}
                      type="button"
                      className="preset-button"
                      onClick={() => applyPreset("monthlyExpenses", preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="quick-monthlyProfit">
                {text.fields.monthlyProfit} ({currency})
              </label>
              <input
                id="quick-monthlyProfit"
                type="number"
                min="0"
                value={values.monthlyProfit}
                onChange={onNumberChange("monthlyProfit")}
                data-field="monthlyProfit"
                aria-invalid={Boolean(errors.monthlyProfit)}
                aria-describedby={errors.monthlyProfit ? "quick-profit-error" : undefined}
                className={errors.monthlyProfit ? "input-error" : ""}
              />
              {errors.monthlyProfit ? (
                <span className="field-error" id="quick-profit-error">
                  {errors.monthlyProfit}
                </span>
              ) : null}
            </>
          )}
        </div>

        <div className="field-group">
          <label htmlFor="quick-trafficGrowth">{text.fields.trafficGrowth}</label>
          <input
            id="quick-trafficGrowth"
            type="number"
            value={values.trafficGrowth}
            onChange={onNumberChange("trafficGrowth")}
            data-field="trafficGrowth"
            aria-invalid={Boolean(errors.trafficGrowth)}
            aria-describedby={errors.trafficGrowth ? "quick-growth-error" : undefined}
            className={errors.trafficGrowth ? "input-error" : ""}
          />
          {errors.trafficGrowth ? (
            <span className="field-error" id="quick-growth-error">
              {errors.trafficGrowth}
            </span>
          ) : null}
          <div className="preset-group">
            <span>{text.quick.presetsGrowth}</span>
            <div className="preset-buttons">
              {growthPresets.map((preset) => (
                <button
                  key={`growth-${preset}`}
                  type="button"
                  className="preset-button"
                  onClick={() => applyPreset("trafficGrowth", preset)}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="quick-revenueStability">{text.fields.revenueStability}</label>
          <select
            id="quick-revenueStability"
            value={values.revenueStability}
            onChange={onChange("revenueStability")}
            data-field="revenueStability"
            aria-invalid={Boolean(errors.revenueStability)}
            aria-describedby={errors.revenueStability ? "quick-stability-error" : undefined}
            className={errors.revenueStability ? "input-error" : ""}
          >
            <option value="">{text.placeholders.select}</option>
            <option value="high">{text.options.stability.high}</option>
            <option value="medium">{text.options.stability.medium}</option>
            <option value="low">{text.options.stability.low}</option>
          </select>
          {errors.revenueStability ? (
            <span className="field-error" id="quick-stability-error">
              {errors.revenueStability}
            </span>
          ) : null}
        </div>
      </div>

      <div className="valuation-quick-metrics">
        <div className="computed-field">
          <span>{text.fields.monthlyNetProfit}</span>
          <strong>{netProfitDisplay}</strong>
        </div>
        <div className="computed-field">
          <span>{text.fields.grossMargin}</span>
          <strong>{marginDisplay}</strong>
        </div>
        <div className="computed-field">
          <span>{text.quick.confidenceLabel}</span>
          <strong>
            {confidenceScore !== null && confidenceScore !== undefined
              ? `${confidenceScore}/100`
              : "--"}
          </strong>
        </div>
      </div>

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

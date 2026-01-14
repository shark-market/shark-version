export default function Filters({
  language = "EN",
  title = "Filters",
  clearLabel = "Clear All",
  assetTypeLabel = "Asset Type",
  assetGroups = [],
  dealTypeLabel = "Deal Type",
  monetizationLabel = "Monetization Type",
  priceRangeLabel = "Price Range",
  revenueLabel = "Monthly Revenue",
  profitLabel = "Monthly Profit",
  stageLabel = "Project Stage",
  roleLabel = "Role needed",
  equityLabel = "Equity %",
  commitmentLabel = "Commitment",
  verifiedLabel = "Verified only",
  countryLabel = "Country",
  categories = [],
  selectedCategories = [],
  onToggleCategory,
  dealTypes = [],
  selectedDealType = "all",
  onDealTypeChange,
  minPrice = "",
  maxPrice = "",
  onMinPriceChange,
  onMaxPriceChange,
  minRevenue = "",
  maxRevenue = "",
  onMinRevenueChange,
  onMaxRevenueChange,
  minProfit = "",
  maxProfit = "",
  onMinProfitChange,
  onMaxProfitChange,
  monetizationOptions = [],
  selectedMonetization = [],
  onToggleMonetization,
  regions = [],
  selectedRegion = "all",
  onRegionChange,
  stages = [],
  selectedStage = "all",
  onStageChange,
  roleOptions = [],
  selectedRole = "all",
  onRoleChange,
  equityMin = "",
  equityMax = "",
  onEquityMinChange,
  onEquityMaxChange,
  commitmentOptions = [],
  selectedCommitment = "all",
  onCommitmentChange,
  verifiedOnly = false,
  onVerifiedChange,
  onClear,
  onClose,
  closeLabel = "Close",
}) {
  return (
    <aside className="filters-card">
      <div className="filters-header">
        <h3>{title}</h3>
        <div className="filters-actions">
          <button className="link-button" type="button" onClick={onClear}>
            {clearLabel}
          </button>
          {onClose ? (
            <button className="link-button" type="button" onClick={onClose}>
              {closeLabel}
            </button>
          ) : null}
        </div>
      </div>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{assetTypeLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content">
          {assetGroups.length > 0
            ? assetGroups.map((group) => (
                <div className="filters-group" key={group.value || group.label}>
                  <span className="filters-group-label">{group.label}</span>
                  {group.options?.map((option) => (
                    <label className="checkbox-row" key={option.value}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(option.value)}
                        onChange={() => onToggleCategory?.(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              ))
            : categories.map((category) => (
                <label className="checkbox-row" key={category.value}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.value)}
                    onChange={() => onToggleCategory?.(category.value)}
                  />
                  <span>{category.label}</span>
                </label>
              ))}
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{dealTypeLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content">
          {dealTypes.map((type) => (
            <label className="checkbox-row" key={type.value}>
              <input
                type="radio"
                name="dealType"
                checked={selectedDealType === type.value}
                onChange={() => onDealTypeChange?.(type.value)}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{priceRangeLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content range-inputs">
          <input
            type="text"
            placeholder={language === "AR" ? "من" : "From"}
            value={minPrice}
            onChange={(event) => onMinPriceChange?.(event.target.value)}
          />
          <input
            type="text"
            placeholder={language === "AR" ? "إلى" : "To"}
            value={maxPrice}
            onChange={(event) => onMaxPriceChange?.(event.target.value)}
          />
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{revenueLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content range-inputs">
          <input
            type="text"
            placeholder={language === "AR" ? "من" : "From"}
            value={minRevenue}
            onChange={(event) => onMinRevenueChange?.(event.target.value)}
          />
          <input
            type="text"
            placeholder={language === "AR" ? "إلى" : "To"}
            value={maxRevenue}
            onChange={(event) => onMaxRevenueChange?.(event.target.value)}
          />
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{profitLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content range-inputs">
          <input
            type="text"
            placeholder={language === "AR" ? "من" : "From"}
            value={minProfit}
            onChange={(event) => onMinProfitChange?.(event.target.value)}
          />
          <input
            type="text"
            placeholder={language === "AR" ? "إلى" : "To"}
            value={maxProfit}
            onChange={(event) => onMaxProfitChange?.(event.target.value)}
          />
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{countryLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content">
          {regions.map((region) => (
            <label className="checkbox-row" key={region.value}>
              <input
                type="radio"
                name="region"
                checked={selectedRegion === region.value}
                onChange={() => onRegionChange?.(region.value)}
              />
              <span>{region.label}</span>
            </label>
          ))}
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{monetizationLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content">
          {monetizationOptions.map((option) => (
            <label className="checkbox-row" key={option.value}>
              <input
                type="checkbox"
                checked={selectedMonetization.includes(option.value)}
                onChange={() => onToggleMonetization?.(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{stageLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content">
          {stages.map((stage) => (
            <label className="checkbox-row" key={stage.value}>
              <input
                type="radio"
                name="stage"
                checked={selectedStage === stage.value}
                onChange={() => onStageChange?.(stage.value)}
              />
              <span>{stage.label}</span>
            </label>
          ))}
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{roleLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content">
          {roleOptions.map((role) => (
            <label className="checkbox-row" key={role.value}>
              <input
                type="radio"
                name="roleNeeded"
                checked={selectedRole === role.value}
                onChange={() => onRoleChange?.(role.value)}
              />
              <span>{role.label}</span>
            </label>
          ))}
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{equityLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content range-inputs">
          <input
            type="text"
            placeholder={language === "AR" ? "من" : "From"}
            value={equityMin}
            onChange={(event) => onEquityMinChange?.(event.target.value)}
          />
          <input
            type="text"
            placeholder={language === "AR" ? "إلى" : "To"}
            value={equityMax}
            onChange={(event) => onEquityMaxChange?.(event.target.value)}
          />
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{commitmentLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content">
          {commitmentOptions.map((option) => (
            <label className="checkbox-row" key={option.value}>
              <input
                type="radio"
                name="commitment"
                checked={selectedCommitment === option.value}
                onChange={() => onCommitmentChange?.(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </details>

      <details className="filters-section" open>
        <summary className="filters-title">
          <span>{verifiedLabel}</span>
          <span className="chevron">v</span>
        </summary>
        <div className="filters-content">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => onVerifiedChange?.(event.target.checked)}
            />
            <span>{verifiedLabel}</span>
          </label>
        </div>
      </details>
    </aside>
  );
}

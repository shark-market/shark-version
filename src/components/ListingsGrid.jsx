import ListingCard from "./ListingCard";

export default function ListingsGrid({
  items = [],
  sortBy = "newest",
  onSortChange,
  labels,
  language = "EN",
  sortOptions = [],
  isAuthenticated = false,
  canAccessDetails = true,
  onRequireAuth,
  onRequireSubscription,
  onViewDetails,
  onToggleFilters,
  activeFilters = [],
  onClearFilters,
  clearFiltersLabel,
}) {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <section className="listings" id="listings">
      <div className="listings-header">
        <h2>
          {items.length} {labels?.listingsLabel || "Listings"}
        </h2>

        <div className="listings-sort">
          {onToggleFilters ? (
            <button
              className="btn btn-ghost filters-toggle"
              type="button"
              onClick={onToggleFilters}
            >
              {labels?.filtersLabel || (language === "AR" ? "الفلاتر" : "Filters")}
            </button>
          ) : null}
          <span>{labels?.sortByLabel || "Sort by:"}</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange?.(event.target.value)}
          >
            {(sortOptions.length > 0
              ? sortOptions
              : [
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                  { value: "price-high", label: "Price: High" },
                  { value: "price-low", label: "Price: Low" },
                ]
            ).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="listings-chips">
          {onClearFilters ? (
            <button
              className="filter-chip filter-chip-clear"
              type="button"
              onClick={onClearFilters}
            >
              {clearFiltersLabel || (language === "AR" ? "مسح الكل" : "Clear All")}
            </button>
          ) : null}
          {activeFilters.map((chip) => (
            <button
              key={chip.key}
              className="filter-chip"
              type="button"
              onClick={chip.onRemove}
              aria-label={
                language === "AR" ? `إزالة ${chip.label}` : `Remove ${chip.label}`
              }
            >
              <span>{chip.label}</span>
              <span className="filter-chip-icon" aria-hidden="true">
                x
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="listings-grid">
        {items.map((item) => (
          <ListingCard
            key={item.id}
            business={item}
            labels={labels}
            language={language}
            isAuthenticated={isAuthenticated}
            canAccessDetails={canAccessDetails}
            onRequireAuth={onRequireAuth}
            onRequireSubscription={onRequireSubscription}
            onViewDetails={() => onViewDetails?.(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

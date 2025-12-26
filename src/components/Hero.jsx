export default function Hero({
  title,
  subtitle,
  searchPlaceholder,
  categories = [],
  searchTerm = "",
  onSearchChange,
  activeCategory = "all",
  onCategoryChange,
}) {
  return (
    <section className="hero" id="home">
      <div className="hero-inner">
        <h1>{title}</h1>
        <p>{subtitle}</p>

        <div className="hero-search">
          <input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </div>

        {categories.length > 0 ? (
          <div className="hero-tags">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`chip ${
                  activeCategory === category.value ? "active" : ""
                }`}
                type="button"
                onClick={() => onCategoryChange?.(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

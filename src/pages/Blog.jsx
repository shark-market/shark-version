import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BLOG_CATEGORIES, BLOG_POSTS } from "../data/blogPosts";
import { getUI } from "../data/uiDictionary";

const getField = (post, key, language) =>
  post[key]?.[language] || post[key]?.EN || post[key]?.AR || "";

export default function Blog({ language = "EN" }) {
  const ui = getUI(language);
  const text = ui.blog;
  const locale = language === "AR" ? "ar-SA" : "en-US";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categoryLabels = useMemo(() => {
    const labels = {};
    BLOG_CATEGORIES.forEach((item) => {
      labels[item.value] = item.label?.[language] || item.label?.EN;
    });
    return labels;
  }, [language]);

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return BLOG_POSTS.filter((post) => {
      const matchesCategory = category === "all" ? true : post.category === category;
      if (!matchesCategory) return false;

      if (!q) return true;

      const searchable = [
        getField(post, "title", language),
        getField(post, "excerpt", language),
        categoryLabels[post.category] || post.category,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [category, categoryLabels, language, query]);

  return (
    <section className="market-page blog-page-v2">
      <div className="container market-page-header">
        <div>
          <h1>{text.title}</h1>
          <p className="muted">{text.subtitle}</p>
        </div>
      </div>

      <div className="container blog-v2-controls">
        <label className="field-group blog-v2-search">
          <span className="sr-only">{text.search}</span>
          <input
            type="search"
            placeholder={text.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="blog-v2-categories" aria-label={text.categories}>
          {BLOG_CATEGORIES.map((item) => (
            <button
              key={item.value}
              className={`chip ${category === item.value ? "active" : ""}`}
              type="button"
              onClick={() => setCategory(item.value)}
            >
              {categoryLabels[item.value]}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        <h2 className="blog-v2-latest">{text.latest}</h2>
        <div className="blog-v2-grid">
          {posts.map((post) => (
            <article className="blog-card" key={post.id}>
              <div className="blog-media">
                <img src={post.coverImage} alt={getField(post, "title", language)} loading="lazy" />
              </div>

              <div className="blog-body">
                <span className="pill">{categoryLabels[post.category] || post.category}</span>
                <h3>{getField(post, "title", language)}</h3>
                <p className="muted">{getField(post, "excerpt", language)}</p>

                <div className="blog-meta">
                  <span>
                    {new Date(post.date).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <Link className="btn btn-ghost" to={`/blog/${post.slug}`}>
                  {text.readMore}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

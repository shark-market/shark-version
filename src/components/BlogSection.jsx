import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BLOG_CATEGORIES, BLOG_POSTS } from "../data/blogPosts";

export default function BlogSection({ language = "EN", text }) {
  const navigate = useNavigate();
  const [blogSearch, setBlogSearch] = useState("");
  const [blogCategory, setBlogCategory] = useState("all");
  const [blogSort, setBlogSort] = useState("newest");

  const categoryLabels = useMemo(() => {
    const labels = {};
    BLOG_CATEGORIES.forEach((category) => {
      labels[category.value] = category.label[language] || category.label.EN;
    });
    return labels;
  }, [language]);

  const getField = (post, key) =>
    post[key]?.[language] || post[key]?.EN || post[key]?.AR || "";

  const blogPosts = useMemo(() => {
    const normalizedSearch = blogSearch.trim().toLowerCase();

    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        blogCategory === "all" ? true : post.category === blogCategory;
      if (!matchesCategory) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      const searchable = [
        getField(post, "title"),
        getField(post, "excerpt"),
        categoryLabels[post.category] || post.category,
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedSearch);
    }).sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date);
      return blogSort === "oldest" ? -diff : diff;
    });
  }, [blogCategory, blogSearch, blogSort, categoryLabels, language]);

  return (
    <section className="blog-section" id="blog">
      <div className="container blog-header">
        <h2>{text.blogTitle}</h2>
        <p className="muted">{text.blogSubtitle}</p>
        <div className="blog-search">
          <input
            placeholder={text.blogSearch}
            value={blogSearch}
            onChange={(event) => setBlogSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="container blog-controls">
        <div className="blog-tags">
          {BLOG_CATEGORIES.map((category) => (
            <button
              key={category.value}
              className={`chip ${blogCategory === category.value ? "active" : ""}`}
              type="button"
              onClick={() => setBlogCategory(category.value)}
            >
              {categoryLabels[category.value]}
            </button>
          ))}
        </div>
        <div className="blog-sort">
          <span>{text.blogSort}</span>
          <select
            value={blogSort}
            onChange={(event) => setBlogSort(event.target.value)}
          >
            {text.blogSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="container blog-announcement" role="complementary">
        <div className="announcement-content">
          <div className="announcement-label">{text.blogAnnouncementLabel}</div>
          <h3>{text.blogAnnouncementTitle}</h3>
          <p className="muted">{text.blogAnnouncementBody}</p>
        </div>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => navigate("/pricing")}
        >
          {text.blogAnnouncementCta}
        </button>
      </div>

      <div className="container blog-grid">
        {blogPosts.map((post) => (
          <article className="blog-card" key={post.id}>
            <div className="blog-media">
              <img src={post.coverImage} alt={getField(post, "title")} />
            </div>
            <div className="blog-body">
              <span className="pill">{categoryLabels[post.category]}</span>
              <h3>{getField(post, "title")}</h3>
              <p className="muted">{getField(post, "excerpt")}</p>
              <div className="blog-meta">
                <span>
                  {new Date(post.date).toLocaleDateString(
                    language === "AR" ? "ar-SA" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
              <button className="link-button" type="button">
                {text.blogReadMore}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import {
  BLOG_CATEGORIES,
  BLOG_IMAGE_MAP,
  BLOG_POSTS,
  makeBlogImage,
} from "../data/blogdata";

export default function BlogSection({ language = "EN", text }) {
  const [blogSearch, setBlogSearch] = useState("");
  const [blogCategory, setBlogCategory] = useState("all");
  const [blogSort, setBlogSort] = useState("newest");

  const blogPosts = useMemo(() => {
    const normalizedSearch = blogSearch.trim().toLowerCase();
    return BLOG_POSTS.filter((post) => {
      const title = post.title[language] || post.title.EN;
      const excerpt = post.excerpt[language] || post.excerpt.EN;
      const matchesCategory =
        blogCategory === "all" ? true : post.category === blogCategory;
      const matchesSearch = normalizedSearch
        ? title.toLowerCase().includes(normalizedSearch) ||
          excerpt.toLowerCase().includes(normalizedSearch)
        : true;
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date);
      return blogSort === "oldest" ? -diff : diff;
    });
  }, [blogCategory, blogSearch, blogSort, language]);

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
              {category.label[language] || category.label.EN}
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

      <div className="container blog-grid">
        {blogPosts.map((post) => (
          <article className="blog-card" key={post.id}>
            <div className="blog-media">
              <img
                src={makeBlogImage(
                  post.title[language] || post.title.EN,
                  BLOG_IMAGE_MAP[post.image]
                )}
                alt={post.title[language] || post.title.EN}
              />
            </div>
            <div className="blog-body">
              <span className="pill">
                {BLOG_CATEGORIES.find(
                  (category) => category.value === post.category
                )?.label[language] || post.category}
              </span>
              <h3>{post.title[language] || post.title.EN}</h3>
              <p className="muted">{post.excerpt[language] || post.excerpt.EN}</p>
              <div className="blog-meta">
                <span>{post.readTime[language] || post.readTime.EN}</span>
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
                {language === "AR" ? "اقرأ المزيد →" : "Read More →"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

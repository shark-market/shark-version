import { Link, useParams } from "react-router-dom";
import { BLOG_CATEGORIES, BLOG_POSTS, findBlogPostBySlug } from "../data/blogPosts";
import { getUI } from "../data/uiDictionary";

const getField = (post, key, language) =>
  post[key]?.[language] || post[key]?.EN || post[key]?.AR || "";

export default function BlogPost({ language = "EN" }) {
  const { slug } = useParams();
  const ui = getUI(language);
  const text = ui.blog;
  const locale = language === "AR" ? "ar-SA" : "en-US";

  const post = findBlogPostBySlug(slug);

  if (!post) {
    return (
      <section className="market-page blog-post-page">
        <div className="container market-empty-state">
          <h1>{text.notFound}</h1>
          <Link className="btn btn-dark" to="/blog">
            {text.back}
          </Link>
        </div>
      </section>
    );
  }

  const categoryLabel =
    BLOG_CATEGORIES.find((item) => item.value === post.category)?.label?.[language] ||
    BLOG_CATEGORIES.find((item) => item.value === post.category)?.label?.EN ||
    post.category;

  const relatedPosts = BLOG_POSTS.filter((item) => item.id !== post.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <section className="market-page blog-post-page">
      <div className="container blog-post-head">
        <Link className="back-link" to="/blog">
          {text.back}
        </Link>
        <span className="pill">{categoryLabel}</span>
        <h1>{getField(post, "title", language)}</h1>
        <p className="muted">
          {new Date(post.date).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="container blog-post-layout">
        <article className="blog-post-card">
          <img src={post.coverImage} alt={getField(post, "title", language)} />
          <div className="blog-post-body">
            {(post.content?.[language] || post.content?.EN || []).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="blog-post-related">
          <h2>{text.latest}</h2>
          <div className="blog-post-related-list">
            {relatedPosts.map((item) => (
              <Link key={item.id} className="blog-related-link" to={`/blog/${item.slug}`}>
                <strong>{getField(item, "title", language)}</strong>
                <span className="muted">
                  {new Date(item.date).toLocaleDateString(locale, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

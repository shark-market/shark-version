import BlogSection from "../components/BlogSection";
import Footer from "../components/Footer";
import { TEXT } from "../data/translations";

export default function Blog({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;

  return (
    <div className="page">
      <BlogSection language={language} text={text} />
      <Footer text={text} language={language} />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import brandLogo from "../assets/brand/sharkmkt-logo.svg";
import {
  PARTNER_COMMITMENT_OPTIONS,
  PARTNER_POSTS,
  PARTNER_ROLE_OPTIONS,
} from "../data/marketplaceData";
import { getAllPartnerPosts, marketplaceEvents } from "../data/marketplaceStore";
import { getUI } from "../data/uiDictionary";
import { useAuth } from "../context/AuthContext";

const STAGE_OPTIONS = [
  { value: "Idea", label: { EN: "Idea", AR: "فكرة" } },
  { value: "MVP", label: { EN: "MVP", AR: "نموذج أولي" } },
  { value: "Revenue", label: { EN: "Revenue", AR: "إيرادات" } },
  { value: "Growth", label: { EN: "Growth", AR: "نمو" } },
];

const EXPERIENCE_OPTIONS = [
  { value: "Beginner", label: { EN: "Beginner", AR: "مبتدئ" } },
  { value: "Intermediate", label: { EN: "Intermediate", AR: "متوسط" } },
  { value: "Expert", label: { EN: "Expert", AR: "خبير" } },
];

const REMOTE_OPTIONS = [
  { value: "yes", label: { EN: "Yes", AR: "نعم" } },
  { value: "no", label: { EN: "No", AR: "لا" } },
];

const SKILL_OPTIONS = [
  "Investor",
  "Co-founder",
  "SaaS",
  "MVP",
  "Finance",
  "Engineering",
  "Design",
  "Product Management",
  "Marketing",
  "Sales",
  "Operations",
  "Growth",
  "Content",
  "SEO",
];

const COUNTRY_CITY_MAP = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam"],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah"],
  Kuwait: ["Kuwait City"],
  Qatar: ["Doha"],
  Bahrain: ["Manama"],
  Egypt: ["Cairo", "Alexandria"],
  Jordan: ["Amman"],
  Global: ["Remote"],
};

const CITY_COUNTRY_MAP = Object.entries(COUNTRY_CITY_MAP).reduce((acc, [country, cities]) => {
  cities.forEach((city) => {
    acc[city.toLowerCase()] = country;
  });
  return acc;
}, {});

const SAVED_POSTS_KEY = "sm-partner-saved-posts";
const FILTER_PRESETS_KEY = "sm-partner-filter-presets";
const PAGE_SIZE = 8;

const INITIAL_FILTERS = {
  query: "",
  role: "",
  stage: "",
  selectedSkills: [],
  minBudget: "",
  maxBudget: "",
  country: "",
  city: "",
  timezone: "",
  commitment: "",
  experience: "",
  remote: "",
};

const TEXT = {
  EN: {
    title: "Find a Partner",
    subtitle:
      "Browse partnership requests and match the right role, skills, and budget.",
    publishEntry: "I want to publish a request",
    filters: "Filters",
    quickSearch: "Quick search",
    quickSearchPlaceholder: "Quick search (project / role / skills / region)",
    role: "Role needed",
    stage: "Project stage",
    skills: "Skills",
    skillsSearchPlaceholder: "Search skills",
    budget: "Budget range (SAR)",
    country: "Country",
    city: "City",
    timezone: "Timezone",
    commitment: "Commitment",
    experience: "Experience level",
    remote: "Remote work?",
    apply: "Apply",
    reset: "Reset",
    all: "All",
    min: "Min",
    max: "Max",
    sortLabel: "Sort",
    sortRelevant: "Highest match",
    sortNewest: "Newest",
    sortBudget: "Closest to budget",
    verified: "Verified",
    newBadge: "New",
    message: "Message",
    details: "View details",
    save: "Save",
    saved: "Saved",
    location: "Location",
    noResults: "No matching partner requests.",
    showing: (shown, total) => `Showing ${shown} of ${total} results`,
    flexibleBudget: "Flexible budget",
    moreSkills: "+ More",
    appliedFilters: "Applied filters",
    clearAll: "Clear all",
    presetName: "Preset name",
    savePreset: "Save filter",
    savedFilters: "Saved filters",
    loadMore: "Load more",
    removeFilter: "Remove filter",
    yes: "Yes",
    no: "No",
  },
  AR: {
    title: "ابحث عن شريك",
    subtitle: "استعرض طلبات الشراكة وحدد الدور المناسب والمهارات والميزانية.",
    publishEntry: "أرغب نشر إعلان",
    filters: "الفلاتر",
    quickSearch: "بحث سريع",
    quickSearchPlaceholder: "بحث سريع (اسم المشروع / الدور / المهارات / المنطقة)",
    role: "الدور المطلوب",
    stage: "مرحلة المشروع",
    skills: "المهارات",
    skillsSearchPlaceholder: "ابحث عن المهارات",
    budget: "نطاق الميزانية (ريال)",
    country: "المنطقة",
    city: "المدينة",
    timezone: "المنطقة الزمنية",
    commitment: "الالتزام",
    experience: "مستوى الخبرة",
    remote: "عمل عن بعد؟",
    apply: "تطبيق",
    reset: "إعادة تعيين",
    all: "الكل",
    min: "من",
    max: "إلى",
    sortLabel: "الترتيب",
    sortRelevant: "الأعلى تطابقًا",
    sortNewest: "الأحدث",
    sortBudget: "الأقرب للميزانية",
    verified: "موثّق",
    newBadge: "جديد",
    message: "مراسلة",
    details: "عرض التفاصيل",
    save: "حفظ",
    saved: "محفوظ",
    location: "الموقع",
    noResults: "لا توجد طلبات مطابقة.",
    showing: (shown, total) => `عرض ${shown} من ${total} نتيجة`,
    flexibleBudget: "ميزانية مرنة",
    moreSkills: "+ المزيد",
    appliedFilters: "الفلاتر المطبقة",
    clearAll: "مسح الكل",
    presetName: "اسم الفلتر",
    savePreset: "حفظ الفلتر",
    savedFilters: "الفلاتر المحفوظة",
    loadMore: "عرض المزيد",
    removeFilter: "حذف الفلتر",
    yes: "نعم",
    no: "لا",
  },
};

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalize = (value) => String(value || "").trim().toLowerCase();
const asTitle = (value) => String(value || "").trim().replace(/\s+/g, " ");

const readSavedPosts = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_POSTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch (error) {
    return [];
  }
};

const readFilterPresets = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FILTER_PRESETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeFilterPresets = (presets) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
};

const writeSavedPosts = (ids) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(ids));
};

const getLabel = (option, language) =>
  option?.label?.[language] || option?.label?.EN || option?.value || "";

const extractSkills = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isRecentlyCreated = (isoDate) => {
  if (!isoDate) return false;
  const ts = new Date(isoDate).getTime();
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts <= 1000 * 60 * 60 * 72;
};

const parseLocation = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return { country: "Global", city: "" };
  }

  if (raw.includes(" - ")) {
    const [country, city] = raw.split(" - ").map((segment) => segment.trim());
    return {
      country: country || "Global",
      city: city || "",
    };
  }

  if (COUNTRY_CITY_MAP[raw]) {
    return { country: raw, city: "" };
  }

  const countryByCity = CITY_COUNTRY_MAP[raw.toLowerCase()];
  if (countryByCity) {
    return { country: countryByCity, city: raw };
  }

  return { country: raw, city: "" };
};

const formatBudget = (post, copy) => {
  const minValue = Number(post.budgetMinSAR) || 0;
  const maxValue = Number(post.budgetMaxSAR || post.budgetMinSAR) || 0;
  if (!minValue && !maxValue) return copy.flexibleBudget;
  return `${minValue.toLocaleString()} - ${maxValue.toLocaleString()}`;
};

export default function Partner({ language = "EN" }) {
  const ui = getUI(language);
  const copy = TEXT[language] || TEXT.EN;
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser } = useAuth();
  const newPostId = location.state?.newPostId ? String(location.state.newPostId) : "";

  const [posts, setPosts] = useState(() => getAllPartnerPosts(PARTNER_POSTS));
  const [savedIds, setSavedIds] = useState(() => readSavedPosts());
  const [activeFilters, setActiveFilters] = useState(INITIAL_FILTERS);
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [skillsQuery, setSkillsQuery] = useState("");
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [presetName, setPresetName] = useState("");
  const [savedPresets, setSavedPresets] = useState(() => readFilterPresets());

  useEffect(() => {
    const refresh = () => {
      setPosts(getAllPartnerPosts(PARTNER_POSTS));
    };

    refresh();
    window.addEventListener(marketplaceEvents.partnerPosts, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(marketplaceEvents.partnerPosts, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    writeSavedPosts(savedIds);
  }, [savedIds]);

  useEffect(() => {
    writeFilterPresets(savedPresets);
  }, [savedPresets]);

  const normalizedPosts = useMemo(
    () =>
      posts.map((post) => {
        const locationParts = parseLocation(post.region || post.country || "");
        const country = String(post.country || locationParts.country || "Global").trim();
        const city = String(post.city || locationParts.city || "").trim();
        const stage = post.stage || "MVP";
        const experienceLevel = post.experienceLevel || "Intermediate";
        const skillsList = extractSkills(post.skills);
        const tags = Array.from(
          new Set([
            post.roleNeeded,
            post.industryInterest,
            stage,
            ...skillsList,
          ])
        ).filter(Boolean);

        return {
          ...post,
          country,
          city,
          stage,
          experienceLevel,
          remote: typeof post.remote === "boolean" ? post.remote : true,
          skillsList,
          tags,
          locationLabel: city ? `${country} - ${city}` : country,
          createdAt: post.createdAt || post.updatedAt || "",
        };
      }),
    [posts]
  );

  const countryOptions = useMemo(() => {
    const values = new Set(normalizedPosts.map((post) => post.country).filter(Boolean));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [normalizedPosts]);

  const cityOptions = useMemo(() => {
    const values = new Set(
      normalizedPosts
        .filter((post) => (draftFilters.country ? post.country === draftFilters.country : true))
        .map((post) => post.city)
        .filter(Boolean)
    );
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [draftFilters.country, normalizedPosts]);

  const timezoneOptions = useMemo(() => {
    const values = new Set(normalizedPosts.map((post) => post.timezone).filter(Boolean));
    return Array.from(values).sort();
  }, [normalizedPosts]);

  const filteredSkillOptions = useMemo(() => {
    const query = normalize(skillsQuery);
    const uniqueSkills = Array.from(
      new Set([...SKILL_OPTIONS, ...draftFilters.selectedSkills])
    );
    if (!query) return uniqueSkills;
    return uniqueSkills.filter((skill) => normalize(skill).includes(query));
  }, [draftFilters.selectedSkills, skillsQuery]);

  const visibleSkillOptions = useMemo(() => {
    if (showAllSkills || normalize(skillsQuery)) return filteredSkillOptions;
    return filteredSkillOptions.slice(0, 10);
  }, [filteredSkillOptions, showAllSkills, skillsQuery]);

  const hasMoreSkills =
    !showAllSkills && !normalize(skillsQuery) && filteredSkillOptions.length > 10;

  const toggleDraftSkill = (skill) => {
    setDraftFilters((prev) => {
      const exists = prev.selectedSkills.includes(skill);
      return {
        ...prev,
        selectedSkills: exists
          ? prev.selectedSkills.filter((item) => item !== skill)
          : [...prev.selectedSkills, skill],
      };
    });
  };

  const addCustomSkill = (rawSkill) => {
    const nextSkill = asTitle(rawSkill);
    if (!nextSkill) return;
    setDraftFilters((prev) => {
      if (prev.selectedSkills.some((item) => normalize(item) === normalize(nextSkill))) {
        return prev;
      }
      return {
        ...prev,
        selectedSkills: [...prev.selectedSkills, nextSkill],
      };
    });
    setSkillsQuery("");
    setShowAllSkills(false);
  };

  const filteredPosts = useMemo(() => {
    return normalizedPosts.filter((post) => {
      const query = normalize(activeFilters.query);
      const searchable = normalize(
        [
          post.projectName,
          post.summary,
          post.roleNeeded,
          post.industryInterest,
          post.stage,
          post.country,
          post.city,
          post.timezone,
          post.skills,
          post.tags?.join(" "),
        ].join(" ")
      );

      const postSkills = post.skillsList.map(normalize);
      const matchesQuery = query ? searchable.includes(query) : true;
      const matchesRole = activeFilters.role ? post.roleNeeded === activeFilters.role : true;
      const matchesStage = activeFilters.stage ? post.stage === activeFilters.stage : true;
      const matchesSkills =
        activeFilters.selectedSkills.length > 0
          ? activeFilters.selectedSkills.every((skill) =>
              postSkills.includes(normalize(skill))
            )
          : true;
      const matchesCountry = activeFilters.country
        ? normalize(post.country) === normalize(activeFilters.country)
        : true;
      const matchesCity = activeFilters.city
        ? normalize(post.city) === normalize(activeFilters.city)
        : true;
      const matchesTimezone = activeFilters.timezone
        ? normalize(post.timezone) === normalize(activeFilters.timezone)
        : true;
      const matchesCommitment = activeFilters.commitment
        ? post.commitmentLevel === activeFilters.commitment
        : true;
      const matchesExperience = activeFilters.experience
        ? post.experienceLevel === activeFilters.experience
        : true;
      const matchesRemote =
        activeFilters.remote === ""
          ? true
          : activeFilters.remote === "yes"
            ? post.remote === true
            : post.remote === false;

      const budgetMin = Number(post.budgetMinSAR) || 0;
      const budgetMax = Number(post.budgetMaxSAR || post.budgetMinSAR) || 0;
      const matchesBudgetMin = activeFilters.minBudget
        ? budgetMax >= toNumber(activeFilters.minBudget)
        : true;
      const matchesBudgetMax = activeFilters.maxBudget
        ? budgetMin <= toNumber(activeFilters.maxBudget)
        : true;

      return (
        matchesQuery &&
        matchesRole &&
        matchesStage &&
        matchesSkills &&
        matchesCountry &&
        matchesCity &&
        matchesTimezone &&
        matchesCommitment &&
        matchesExperience &&
        matchesRemote &&
        matchesBudgetMin &&
        matchesBudgetMax
      );
    });
  }, [activeFilters, normalizedPosts]);

  const budgetTarget = useMemo(() => {
    const min = activeFilters.minBudget ? toNumber(activeFilters.minBudget) : null;
    const max = activeFilters.maxBudget ? toNumber(activeFilters.maxBudget) : null;
    if (min !== null && max !== null) return (min + max) / 2;
    if (min !== null) return min;
    if (max !== null) return max;
    return 50_000;
  }, [activeFilters.maxBudget, activeFilters.minBudget]);

  const sortedPosts = useMemo(() => {
    const list = [...filteredPosts];
    const query = normalize(activeFilters.query);

    const relevanceScore = (post) => {
      const searchable = normalize(
        [
          post.projectName,
          post.summary,
          post.roleNeeded,
          post.industryInterest,
          post.tags?.join(" "),
        ].join(" ")
      );
      const matchedSkills = activeFilters.selectedSkills.filter((skill) =>
        post.skillsList.map(normalize).includes(normalize(skill))
      ).length;
      const matchedInterests = (appUser?.interests || []).filter((interest) =>
        post.tags.map(normalize).includes(normalize(interest))
      ).length;
      const created = new Date(post.createdAt || 0).getTime() || 0;
      const isNew = String(post.id) === newPostId || post.isNew || isRecentlyCreated(post.createdAt);

      return (
        (isNew ? 6 : 0) +
        (post.verified ? 4 : 0) +
        matchedSkills * 2 +
        matchedInterests * 2 +
        (query && searchable.includes(query) ? 2 : 0) +
        (activeFilters.role && post.roleNeeded === activeFilters.role ? 1 : 0) +
        (activeFilters.stage && post.stage === activeFilters.stage ? 1 : 0) +
        (activeFilters.commitment && post.commitmentLevel === activeFilters.commitment ? 1 : 0) +
        (activeFilters.experience && post.experienceLevel === activeFilters.experience ? 1 : 0) +
        (created ? created / 1_000_000_000_000 : 0)
      );
    };

    list.sort((a, b) => {
      const aCreated = new Date(a.createdAt || 0).getTime() || 0;
      const bCreated = new Date(b.createdAt || 0).getTime() || 0;

      if (sortBy === "newest") {
        return bCreated - aCreated;
      }

      if (sortBy === "closest-budget") {
        const aCenter = ((Number(a.budgetMinSAR) || 0) + (Number(a.budgetMaxSAR || a.budgetMinSAR) || 0)) / 2;
        const bCenter = ((Number(b.budgetMinSAR) || 0) + (Number(b.budgetMaxSAR || b.budgetMinSAR) || 0)) / 2;
        const aDistance = Math.abs(aCenter - budgetTarget);
        const bDistance = Math.abs(bCenter - budgetTarget);
        if (aDistance === bDistance) return bCreated - aCreated;
        return aDistance - bDistance;
      }

      return relevanceScore(b) - relevanceScore(a);
    });

    return list;
  }, [
    activeFilters.commitment,
    activeFilters.experience,
    activeFilters.query,
    activeFilters.role,
    activeFilters.selectedSkills,
    activeFilters.stage,
    budgetTarget,
    filteredPosts,
    appUser?.interests,
    newPostId,
    sortBy,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilters, sortBy]);

  const visiblePosts = useMemo(
    () => sortedPosts.slice(0, visibleCount),
    [sortedPosts, visibleCount]
  );
  const hasMorePosts = visibleCount < sortedPosts.length;

  const applyFilters = (event) => {
    event.preventDefault();
    setActiveFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
    setActiveFilters(INITIAL_FILTERS);
    setSkillsQuery("");
    setShowAllSkills(false);
    setSortBy("relevant");
  };

  const clearAllFilters = () => {
    resetFilters();
  };

  const toggleSavePost = (postId) => {
    const id = String(postId);
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev]
    );
  };

  const setDraftValue = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onCountryChange = (value) => {
    setDraftFilters((prev) => ({
      ...prev,
      country: value,
      city: "",
    }));
  };

  const saveCurrentPreset = () => {
    const trimmedName = presetName.trim();
    if (!trimmedName) return;
    setSavedPresets((prev) => {
      const next = prev.filter((item) => item.name !== trimmedName);
      return [{ name: trimmedName, filters: draftFilters }, ...next].slice(0, 8);
    });
    setPresetName("");
  };

  const applyPreset = (preset) => {
    if (!preset?.filters) return;
    setDraftFilters(preset.filters);
    setActiveFilters(preset.filters);
  };

  const deletePreset = (presetNameToDelete) => {
    setSavedPresets((prev) => prev.filter((item) => item.name !== presetNameToDelete));
  };

  const appliedFilterChips = useMemo(() => {
    const chips = [];
    if (activeFilters.query) chips.push({ key: "query", label: `${copy.quickSearch}: ${activeFilters.query}` });
    if (activeFilters.role) chips.push({ key: "role", label: `${copy.role}: ${activeFilters.role}` });
    if (activeFilters.stage) chips.push({ key: "stage", label: `${copy.stage}: ${activeFilters.stage}` });
    if (activeFilters.country) chips.push({ key: "country", label: `${copy.country}: ${activeFilters.country}` });
    if (activeFilters.city) chips.push({ key: "city", label: `${copy.city}: ${activeFilters.city}` });
    if (activeFilters.timezone) chips.push({ key: "timezone", label: `${copy.timezone}: ${activeFilters.timezone}` });
    if (activeFilters.commitment) chips.push({ key: "commitment", label: `${copy.commitment}: ${activeFilters.commitment}` });
    if (activeFilters.experience) chips.push({ key: "experience", label: `${copy.experience}: ${activeFilters.experience}` });
    if (activeFilters.remote) {
      chips.push({
        key: "remote",
        label: `${copy.remote}: ${activeFilters.remote === "yes" ? copy.yes : copy.no}`,
      });
    }
    if (activeFilters.minBudget || activeFilters.maxBudget) {
      chips.push({
        key: "budget",
        label: `${copy.budget}: ${activeFilters.minBudget || "0"} - ${activeFilters.maxBudget || "∞"}`,
      });
    }
    activeFilters.selectedSkills.forEach((skill) => {
      chips.push({ key: `skill-${skill}`, label: `${copy.skills}: ${skill}` });
    });
    return chips;
  }, [
    activeFilters,
    copy.budget,
    copy.city,
    copy.commitment,
    copy.country,
    copy.experience,
    copy.no,
    copy.quickSearch,
    copy.remote,
    copy.role,
    copy.skills,
    copy.stage,
    copy.timezone,
    copy.yes,
  ]);

  const removeAppliedFilter = (chipKey) => {
    if (chipKey.startsWith("skill-")) {
      const skill = chipKey.replace("skill-", "");
      setDraftFilters((prev) => ({
        ...prev,
        selectedSkills: prev.selectedSkills.filter((item) => item !== skill),
      }));
      setActiveFilters((prev) => ({
        ...prev,
        selectedSkills: prev.selectedSkills.filter((item) => item !== skill),
      }));
      return;
    }

    if (chipKey === "budget") {
      setDraftFilters((prev) => ({ ...prev, minBudget: "", maxBudget: "" }));
      setActiveFilters((prev) => ({ ...prev, minBudget: "", maxBudget: "" }));
      return;
    }

    setDraftFilters((prev) => ({ ...prev, [chipKey]: "" }));
    setActiveFilters((prev) => ({ ...prev, [chipKey]: "" }));
  };

  return (
    <section className="market-page partner-page-v2 partner-search-page">
      <div className="container partner-page-head">
        <div className="partner-page-head-main">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <img className="partner-page-head-logo" src={brandLogo} alt={ui.brand} />
      </div>

      <div className="container partner-page-actions">
        <Link className="btn btn-dark partner-publish-entry" to="/partner/publish">
          <span aria-hidden>+</span>
          <span>{copy.publishEntry}</span>
        </Link>
      </div>

      <div className="container partner-search-layout">
        <div className="partner-results-column">
          <div className="partner-results-toolbar">
            <p className="partner-results-count">
              {copy.showing(sortedPosts.length, normalizedPosts.length)}
            </p>
            <label className="partner-sort-control">
              <span>{copy.sortLabel}</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="newest">{copy.sortNewest}</option>
                <option value="relevant">{copy.sortRelevant}</option>
                <option value="closest-budget">{copy.sortBudget}</option>
              </select>
            </label>
          </div>

          {appliedFilterChips.length > 0 ? (
            <div className="partner-applied-filters">
              <div className="partner-applied-filters-head">
                <strong>{copy.appliedFilters}</strong>
                <button type="button" className="link-button" onClick={clearAllFilters}>
                  {copy.clearAll}
                </button>
              </div>
              <div className="partner-applied-filters-list">
                {appliedFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className="partner-applied-chip"
                    onClick={() => removeAppliedFilter(chip.key)}
                    aria-label={`${copy.removeFilter}: ${chip.label}`}
                  >
                    <span>{chip.label}</span>
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="partner-result-list">
            {sortedPosts.length === 0 ? (
              <article className="partner-result-card partner-result-empty">
                <p>{copy.noResults}</p>
              </article>
            ) : (
              visiblePosts.map((post) => {
                const postId = String(post.id);
                const isSaved = savedIds.includes(postId);
                const isNew =
                  postId === newPostId || post.isNew || isRecentlyCreated(post.createdAt);
                const commitmentLabel =
                  PARTNER_COMMITMENT_OPTIONS.find(
                    (option) => option.value === post.commitmentLevel
                  )?.label?.[language] || post.commitmentLevel;

                return (
                  <article
                    className={`partner-result-card${postId === newPostId ? " highlighted" : ""}`}
                    key={post.id}
                  >
                    <div className="partner-result-head">
                      <div className="partner-result-title-wrap">
                        <div className="partner-result-title-row">
                          <h3>{post.projectName}</h3>
                          <div className="partner-result-badges">
                            {post.verified ? (
                              <span className="badge badge-light">{copy.verified}</span>
                            ) : null}
                            {isNew ? <span className="badge badge-light">{copy.newBadge}</span> : null}
                          </div>
                        </div>
                        <p>{post.summary}</p>
                      </div>

                      <button
                        type="button"
                        className={`partner-save-btn${isSaved ? " saved" : ""}`}
                        onClick={() => toggleSavePost(post.id)}
                        aria-label={isSaved ? copy.saved : copy.save}
                      >
                        {isSaved ? "★" : "☆"}
                      </button>
                    </div>

                    <div className="partner-result-meta">
                      <span className="partner-meta-item">
                        <span className="partner-meta-icon" aria-hidden>
                          ◎
                        </span>
                        <span>
                          {copy.location}: {post.locationLabel}
                        </span>
                      </span>
                      <span className="partner-meta-item">
                        <span className="partner-meta-icon" aria-hidden>
                          ◍
                        </span>
                        <span>{commitmentLabel}</span>
                      </span>
                      <span className="partner-meta-item">
                        <span className="partner-meta-icon" aria-hidden>
                          ◷
                        </span>
                        <span>{post.timezone}</span>
                      </span>
                    </div>

                    <div className="partner-result-skills">
                      {post.tags.slice(0, 8).map((tag) => (
                        <span key={`${postId}-${tag}`} className="partner-skill-chip">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="partner-budget-line">
                      <strong>
                        {copy.budget}: {formatBudget(post, copy)}
                      </strong>
                    </p>

                    <div className="partner-result-actions">
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => navigate(`/messages?partner=${post.id}`)}
                      >
                        {copy.message}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => navigate(`/partner/${post.id}`)}
                      >
                        {copy.details}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {hasMorePosts ? (
            <div className="partner-load-more-wrap">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                {copy.loadMore}
              </button>
            </div>
          ) : null}
        </div>

        <aside className="partner-filter-column">
          <form className="partner-filter-panel" onSubmit={applyFilters}>
            <h2>{copy.filters}</h2>

            <div className="partner-presets-box">
              <label className="field-group">
                <span>{copy.presetName}</span>
                <div className="partner-preset-save-row">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(event) => setPresetName(event.target.value)}
                    placeholder={copy.presetName}
                  />
                  <button type="button" className="btn btn-ghost" onClick={saveCurrentPreset}>
                    🔖 {copy.savePreset}
                  </button>
                </div>
              </label>
              {savedPresets.length > 0 ? (
                <div className="partner-presets-list">
                  <strong>{copy.savedFilters}</strong>
                  {savedPresets.map((preset) => (
                    <div key={preset.name} className="partner-preset-item">
                      <button type="button" className="partner-preset-apply" onClick={() => applyPreset(preset)}>
                        {preset.name}
                      </button>
                      <button
                        type="button"
                        className="partner-preset-remove"
                        onClick={() => deletePreset(preset.name)}
                        aria-label={`${copy.removeFilter}: ${preset.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <label className="field-group">
              <span>{copy.quickSearch}</span>
              <input
                type="search"
                value={draftFilters.query}
                onChange={(event) => setDraftValue("query", event.target.value)}
                placeholder={copy.quickSearchPlaceholder}
              />
            </label>

            <label className="field-group">
              <span>{copy.role}</span>
              <select
                value={draftFilters.role}
                onChange={(event) => setDraftValue("role", event.target.value)}
              >
                <option value="">{copy.all}</option>
                {PARTNER_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {getLabel(option, language)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>{copy.stage}</span>
              <select
                value={draftFilters.stage}
                onChange={(event) => setDraftValue("stage", event.target.value)}
              >
                <option value="">{copy.all}</option>
                {STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {getLabel(option, language)}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-group">
              <span>{copy.skills}</span>
              <input
                type="search"
                value={skillsQuery}
                onChange={(event) => {
                  setSkillsQuery(event.target.value);
                  setShowAllSkills(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomSkill(event.currentTarget.value);
                  }
                }}
                placeholder={copy.skillsSearchPlaceholder}
              />

              <div className="partner-skill-chip-wrap">
                {visibleSkillOptions.map((skill) => {
                  const selected = draftFilters.selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      className={`partner-skill-chip-btn${selected ? " active" : ""}`}
                      onClick={() => toggleDraftSkill(skill)}
                    >
                      {skill}
                    </button>
                  );
                })}

                {hasMoreSkills ? (
                  <button
                    type="button"
                    className="partner-skill-more"
                    onClick={() => setShowAllSkills(true)}
                  >
                    {copy.moreSkills}
                  </button>
                ) : null}
              </div>
            </div>

            <label className="field-group">
              <span>{copy.budget}</span>
              <div className="partner-budget-grid">
                <input
                  type="number"
                  placeholder={copy.min}
                  value={draftFilters.minBudget}
                  onChange={(event) => setDraftValue("minBudget", event.target.value)}
                />
                <input
                  type="number"
                  placeholder={copy.max}
                  value={draftFilters.maxBudget}
                  onChange={(event) => setDraftValue("maxBudget", event.target.value)}
                />
              </div>
            </label>

            <label className="field-group">
              <span>{copy.country}</span>
              <select
                value={draftFilters.country}
                onChange={(event) => onCountryChange(event.target.value)}
              >
                <option value="">{copy.all}</option>
                {countryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>{copy.city}</span>
              <select
                value={draftFilters.city}
                onChange={(event) => setDraftValue("city", event.target.value)}
              >
                <option value="">{copy.all}</option>
                {cityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>{copy.timezone}</span>
              <select
                value={draftFilters.timezone}
                onChange={(event) => setDraftValue("timezone", event.target.value)}
              >
                <option value="">{copy.all}</option>
                {timezoneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>{copy.commitment}</span>
              <select
                value={draftFilters.commitment}
                onChange={(event) => setDraftValue("commitment", event.target.value)}
              >
                <option value="">{copy.all}</option>
                {PARTNER_COMMITMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {getLabel(option, language)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>{copy.experience}</span>
              <select
                value={draftFilters.experience}
                onChange={(event) => setDraftValue("experience", event.target.value)}
              >
                <option value="">{copy.all}</option>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {getLabel(option, language)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>{copy.remote}</span>
              <select
                value={draftFilters.remote}
                onChange={(event) => setDraftValue("remote", event.target.value)}
              >
                <option value="">{copy.all}</option>
                {REMOTE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {getLabel(option, language)}
                  </option>
                ))}
              </select>
            </label>

            <div className="partner-filter-actions">
              <button className="btn btn-dark" type="submit">
                {copy.apply}
              </button>
              <button className="btn btn-ghost" type="button" onClick={resetFilters}>
                {copy.reset}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}

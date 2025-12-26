const STORAGE_KEY = "sm-partner-listings";

export const DEFAULT_PARTNER_LISTINGS = [
  {
    id: "p1",
    projectName: "Shark Studio",
    projectType: "Marketplace",
    targetMarket: "SMBs in GCC",
    location: "Riyadh, KSA",
    status: "MVP",
    imageUrl: "",
    summary:
      "A curated marketplace for buying and selling digital assets in the GCC.",
    problem:
      "SMEs lack a trusted marketplace to buy and sell profitable digital businesses.",
    solution:
      "A verified marketplace with escrow, analytics, and secure messaging.",
    currentStage: "MVP with early pilot sellers",
    vision:
      "Scale supply-side, onboard 200 listings, and launch premium buyer plans.",
    requiredSkills: "React, Growth, Marketplace Ops",
    partnerType: "Technical",
    roleNeeded: "Frontend Lead",
    responsibilities: ["product", "engineering", "growth"],
    commitment: "part-time",
    commitmentHours: "12",
    founderType: "cofounder",
    equityPercent: 18,
    workEquityPercent: 12,
    cashBudget: 0,
    vesting: "6m",
    credibility: {
      whyNow: "We have initial demand and need a partner to scale delivery.",
      whyRole: "Frontend leadership is critical for the buyer experience.",
      founderExperience: "Founder built two SaaS products in the region.",
    },
  },
  {
    id: "p2",
    projectName: "Desert Commerce",
    projectType: "Ecom",
    targetMarket: "Saudi consumers",
    location: "Jeddah, KSA",
    status: "Revenue",
    imageUrl: "",
    summary:
      "D2C ecommerce brand focused on eco-friendly home essentials.",
    problem:
      "Customers want sustainable products but lack curated local options.",
    solution:
      "A focused ecommerce brand with vetted suppliers and strong storytelling.",
    currentStage: "Consistent monthly revenue, repeat buyers",
    vision: "Launch subscription box and expand into GCC marketplaces.",
    requiredSkills: "Branding, Performance Marketing, CRM",
    partnerType: "Marketing",
    roleNeeded: "Growth Marketer",
    responsibilities: ["marketing", "growth", "sales"],
    commitment: "full-time",
    commitmentHours: "",
    founderType: "executor",
    equityPercent: 12,
    workEquityPercent: 10,
    cashBudget: 15000,
    vesting: "1y",
    credibility: {
      whyNow: "CAC is rising and we need a partner to own growth.",
      whyRole: "Marketing is the main lever for scale.",
      founderExperience: "7 years in ecommerce operations.",
    },
  },
  {
    id: "p3",
    projectName: "FinPulse",
    projectType: "SaaS",
    targetMarket: "Finance teams in MENA",
    location: "Dubai, UAE",
    status: "Users",
    imageUrl: "",
    summary:
      "A SaaS analytics dashboard for finance teams with automated insights.",
    problem:
      "Finance teams rely on manual reports and fragmented spreadsheets.",
    solution:
      "Unified dashboards with real-time KPIs and forecasting.",
    currentStage: "200+ active users, pilots with mid-market firms",
    vision: "Launch enterprise tier and hire sales team.",
    requiredSkills: "Fundraising, Partnerships, Enterprise Sales",
    partnerType: "Investor",
    roleNeeded: "Strategic Investor",
    responsibilities: ["fundraising", "partnerships"],
    commitment: "hours",
    commitmentHours: "6",
    founderType: "cofounder",
    equityPercent: 25,
    workEquityPercent: 0,
    cashBudget: 80000,
    vesting: "none",
    credibility: {
      whyNow: "We are preparing for regional expansion.",
      whyRole: "Need capital and industry access.",
      founderExperience: "Ex-fintech PM with 10 years of experience.",
    },
  },
  {
    id: "p4",
    projectName: "OpsCraft",
    projectType: "Marketplace",
    targetMarket: "Local delivery startups",
    location: "Cairo, Egypt",
    status: "MVP",
    imageUrl: "",
    summary:
      "Operations toolkit for on-demand delivery businesses.",
    problem:
      "Delivery startups struggle with inefficient routing and staffing.",
    solution:
      "Workflow automations and SOP templates for lean teams.",
    currentStage: "MVP validated with 3 pilot clients",
    vision: "Expand to 50 teams and introduce analytics add-ons.",
    requiredSkills: "Ops, Logistics, Process Design",
    partnerType: "Operations",
    roleNeeded: "Ops Lead",
    responsibilities: ["operations", "product"],
    commitment: "part-time",
    commitmentHours: "10",
    founderType: "executor",
    equityPercent: 10,
    workEquityPercent: 10,
    cashBudget: 0,
    vesting: "6m",
    credibility: {
      whyNow: "We need operational leadership to serve new clients.",
      whyRole: "Ops expertise is essential for retention.",
      founderExperience: "Former logistics manager at a delivery startup.",
    },
  },
  {
    id: "p5",
    projectName: "EduSpark",
    projectType: "App",
    targetMarket: "Students in MENA",
    location: "Amman, Jordan",
    status: "Idea",
    imageUrl: "",
    summary:
      "Mobile-first learning platform with gamified lessons.",
    problem:
      "Students lose motivation with traditional e-learning.",
    solution:
      "Short interactive lessons with rewards and community challenges.",
    currentStage: "Validated demand through 500 survey responses",
    vision: "Build MVP and onboard first 1,000 users.",
    requiredSkills: "React Native, Product Design, Growth",
    partnerType: "Technical",
    roleNeeded: "Mobile Engineer",
    responsibilities: ["engineering", "product"],
    commitment: "part-time",
    commitmentHours: "8",
    founderType: "cofounder",
    equityPercent: 20,
    workEquityPercent: 15,
    cashBudget: 10000,
    vesting: "1y",
    credibility: {
      whyNow: "We need a technical partner to build MVP fast.",
      whyRole: "Mobile delivery is core to the experience.",
      founderExperience: "Education consultant with 6 years in edtech.",
    },
  },
  {
    id: "p6",
    projectName: "GreenCart",
    projectType: "Ecom",
    targetMarket: "GCC consumers",
    location: "Dammam, KSA",
    status: "Revenue",
    imageUrl: "",
    summary:
      "Eco-friendly marketplace for sustainable daily products.",
    problem:
      "Sustainable products are expensive and hard to find locally.",
    solution:
      "Bulk sourcing and curated bundles for affordability.",
    currentStage: "Stable revenue with strong repeat rate",
    vision: "Expand supplier network and launch subscription bundles.",
    requiredSkills: "Branding, Social Media, Community",
    partnerType: "Marketing",
    roleNeeded: "Brand Lead",
    responsibilities: ["marketing", "growth"],
    commitment: "full-time",
    commitmentHours: "",
    founderType: "executor",
    equityPercent: 14,
    workEquityPercent: 9,
    cashBudget: 7000,
    vesting: "6m",
    credibility: {
      whyNow: "We are ready to scale and need brand leadership.",
      whyRole: "Brand trust is key in the sustainability niche.",
      founderExperience: "Former marketing lead at a retail brand.",
    },
  },
  {
    id: "p7",
    projectName: "ClinicFlow",
    projectType: "SaaS",
    targetMarket: "Clinics in Saudi",
    location: "Riyadh, KSA",
    status: "Revenue",
    imageUrl: "",
    summary:
      "Clinic management SaaS with appointment and billing modules.",
    problem:
      "Clinics lose revenue due to missed follow-ups and manual scheduling.",
    solution:
      "Automation for reminders, scheduling, and billing.",
    currentStage: "20+ clinics onboarded",
    vision: "Scale across KSA and add telehealth features.",
    requiredSkills: "Healthtech, Partnerships, Fundraising",
    partnerType: "Investor",
    roleNeeded: "Strategic Investor",
    responsibilities: ["fundraising", "partnerships", "growth"],
    commitment: "hours",
    commitmentHours: "5",
    founderType: "cofounder",
    equityPercent: 30,
    workEquityPercent: 0,
    cashBudget: 120000,
    vesting: "none",
    credibility: {
      whyNow: "We want to accelerate expansion with capital.",
      whyRole: "Access to healthcare networks is critical.",
      founderExperience: "Founder previously scaled a healthcare SaaS.",
    },
  },
  {
    id: "p8",
    projectName: "HostLink",
    projectType: "Marketplace",
    targetMarket: "Travel hosts in GCC",
    location: "Doha, Qatar",
    status: "Users",
    imageUrl: "",
    summary:
      "Marketplace connecting hosts with property management tools.",
    problem:
      "Hosts struggle to manage listings across multiple platforms.",
    solution:
      "Unified dashboard for bookings, pricing, and guest comms.",
    currentStage: "1,200 active hosts",
    vision: "Launch AI pricing assistant and scale in GCC.",
    requiredSkills: "Customer Success, Support, Ops",
    partnerType: "Operations",
    roleNeeded: "Customer Ops Lead",
    responsibilities: ["operations", "customer-success"],
    commitment: "part-time",
    commitmentHours: "14",
    founderType: "executor",
    equityPercent: 8,
    workEquityPercent: 8,
    cashBudget: 0,
    vesting: "6m",
    credibility: {
      whyNow: "Customer retention is a priority for growth.",
      whyRole: "Ops leadership will improve support quality.",
      founderExperience: "Former hospitality product manager.",
    },
  },
  {
    id: "p9",
    projectName: "Analytics Bay",
    projectType: "AI",
    targetMarket: "SMEs in GCC",
    location: "Manama, Bahrain",
    status: "MVP",
    imageUrl: "",
    summary:
      "AI analytics assistant for ecommerce teams.",
    problem:
      "SMEs lack affordable analytics and forecasting tools.",
    solution:
      "Conversational AI that answers business questions in seconds.",
    currentStage: "MVP ready with pilot clients",
    vision: "Integrate with Shopify and launch paid tier.",
    requiredSkills: "Data, Python, ML Ops",
    partnerType: "Technical",
    roleNeeded: "ML Engineer",
    responsibilities: ["engineering", "product"],
    commitment: "part-time",
    commitmentHours: "10",
    founderType: "cofounder",
    equityPercent: 22,
    workEquityPercent: 16,
    cashBudget: 20000,
    vesting: "1y",
    credibility: {
      whyNow: "Need AI expertise to ship integrations.",
      whyRole: "ML is core to the product promise.",
      founderExperience: "Founder built BI tools for retailers.",
    },
  },
  {
    id: "p10",
    projectName: "RetailPulse",
    projectType: "Content",
    targetMarket: "Retail founders",
    location: "Kuwait City, Kuwait",
    status: "Idea",
    imageUrl: "",
    summary:
      "Content platform with insights for retail operators.",
    problem:
      "Retail founders lack localized insights and playbooks.",
    solution:
      "Weekly insights, interviews, and tactical guides.",
    currentStage: "Content roadmap ready, audience surveys complete",
    vision: "Launch newsletter + community and monetize via sponsorships.",
    requiredSkills: "Content, Partnerships, Community",
    partnerType: "Marketing",
    roleNeeded: "Content Lead",
    responsibilities: ["marketing", "community", "growth"],
    commitment: "hours",
    commitmentHours: "6",
    founderType: "executor",
    equityPercent: 15,
    workEquityPercent: 10,
    cashBudget: 5000,
    vesting: "6m",
    credibility: {
      whyNow: "We have demand and want to build content fast.",
      whyRole: "Content leadership is critical for credibility.",
      founderExperience: "Ex-retail strategist with regional network.",
    },
  },
];

export const getPartnerListings = () => {
  if (typeof window === "undefined") return DEFAULT_PARTNER_LISTINGS;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_PARTNER_LISTINGS;
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    return DEFAULT_PARTNER_LISTINGS;
  }
  return DEFAULT_PARTNER_LISTINGS;
};

export const savePartnerListings = (listings) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
};


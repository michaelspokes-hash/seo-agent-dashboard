import { useState, useEffect, useCallback, useRef } from "react";

const COLORS = {
  bg: "#0a0f1a",
  surface: "#111827",
  surfaceAlt: "#1a2332",
  border: "#1e2d3d",
  borderActive: "#2dd4bf",
  text: "#e2e8f0",
  textMuted: "#64748b",
  textDim: "#475569",
  accent: "#2dd4bf",
  accentDim: "rgba(45, 212, 191, 0.15)",
  accentGlow: "rgba(45, 212, 191, 0.3)",
  warning: "#f59e0b",
  warningDim: "rgba(245, 158, 11, 0.15)",
  danger: "#ef4444",
  dangerDim: "rgba(239, 68, 68, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.15)",
  purple: "#a78bfa",
  purpleDim: "rgba(167, 139, 250, 0.15)",
};

const FONT = `'JetBrains Mono', 'Fira Code', 'SF Mono', monospace`;
const FONT_SANS = `'DM Sans', 'Segoe UI', sans-serif`;

// ── Backend API ──
const API_BASE = "https://seo-agent-backend-euqu.onrender.com";

// ── Site Data ──
const MOCK_SITES = [
  { id: 1, name: "hataadvising.com", url: "https://www.hataadvising.com", platform: "wordpress", status: "connected", pages: 38, score: 64 },
  { id: 2, name: "greencleansaltlake.com", url: "https://www.greencleansaltlake.com", platform: "wordpress", status: "connected", pages: 22, score: 55 },
  { id: 3, name: "builtcontractors.com", url: "https://www.builtcontractors.com", platform: "wordpress", status: "connected", pages: 47, score: 68 },
  { id: 4, name: "edgecarpetrepair.com", url: "https://www.edgecarpetrepair.com", platform: "wordpress", status: "connected", pages: 18, score: 59 },
];

const MOCK_AUDIT_ITEMS = [
  // Hata Advising
  { id: 1, siteId: 1, type: "meta", severity: "high", page: "/", title: "Missing meta description on homepage", description: "Homepage lacks a meta description. Search engines will auto-generate one, reducing CTR for 'business advising' queries.", fix: 'Add meta description: "Hata Advising — expert business consulting and advisory services in Salt Lake City. Strategy, growth, and operational excellence."', status: "pending", impact: "+15% CTR est." },
  { id: 2, siteId: 1, type: "schema", severity: "high", page: "/", title: "Missing LocalBusiness schema markup", description: "No structured data found. Adding LocalBusiness schema enables rich results with address, hours, and ratings across Wasatch Front.", fix: "Add LocalBusiness JSON-LD schema with name, address, phone, hours, and areaServed covering Salt Lake City, Provo, Ogden, Murray, Sandy, Draper, Lehi", status: "pending", impact: "+25% rich snippet eligibility" },
  { id: 3, siteId: 1, type: "content", severity: "medium", page: "/services", title: "Thin content — under 200 words", description: "Services page has minimal content. Google may classify as thin content, reducing ranking potential.", fix: "Expand each service description to 300+ words with benefits, process details, and client outcomes", status: "pending", impact: "+18% topical authority" },
  { id: 4, siteId: 1, type: "performance", severity: "medium", page: "/", title: "Large Contentful Paint > 3.5s", description: "LCP is 3.8s. Google recommends under 2.5s for good Core Web Vitals.", fix: "Optimize hero image: convert to WebP, add explicit width/height, preload above-fold assets", status: "approved", impact: "+10% page experience" },

  // Green Clean Salt Lake
  { id: 5, siteId: 2, type: "meta", severity: "high", page: "/", title: "Generic title tag — 'Home'", description: "Title tag is just 'Home'. Missing primary keywords like 'cleaning service Salt Lake City'.", fix: 'Update title to: "Green Clean Salt Lake | Eco-Friendly Cleaning Services in Salt Lake City, UT"', status: "pending", impact: "+20% CTR est." },
  { id: 6, siteId: 2, type: "heading", severity: "high", page: "/services", title: "No H1 tag on services page", description: "Services page is missing an H1 heading entirely. Critical for keyword targeting.", fix: 'Add H1: "Professional Eco-Friendly Cleaning Services in Salt Lake City"', status: "pending", impact: "+12% ranking signal" },
  { id: 7, siteId: 2, type: "schema", severity: "medium", page: "/", title: "Missing LocalBusiness + Service schema", description: "No structured data. Cleaning services benefit heavily from local schema for map pack visibility across the Wasatch Front.", fix: "Add LocalBusiness JSON-LD with serviceType, areaServed (Salt Lake City, Murray, Sandy, Provo, Ogden, Draper, Lehi, Bountiful), and priceRange", status: "pending", impact: "+30% local pack eligibility" },
  { id: 8, siteId: 2, type: "image", severity: "medium", page: "/gallery", title: "14 images missing alt text", description: "Gallery images lack alt attributes. Missing image search traffic and accessibility compliance.", fix: 'Add descriptive alt text like "eco-friendly kitchen deep cleaning Salt Lake City" to each image', status: "pending", impact: "+8% image traffic" },
  { id: 9, siteId: 2, type: "link", severity: "low", page: "/about", title: "No internal links to service pages", description: "About page doesn't link to any service pages, missing internal link equity distribution.", fix: "Add contextual links to residential cleaning, commercial cleaning, and deep cleaning pages", status: "applied", impact: "+5% crawl efficiency" },

  // Built Contractors
  { id: 10, siteId: 3, type: "meta", severity: "high", page: "/", title: "Duplicate title tags across 8 pages", description: "Multiple pages share the same title 'Built Contractors'. Each page needs a unique, keyword-rich title.", fix: 'Generate unique titles per page: "[Service] Contractor in [City] | Built Contractors"', status: "pending", impact: "+22% indexation" },
  { id: 11, siteId: 3, type: "content", severity: "high", page: "/services/remodeling", title: "Thin content — 65 words on remodeling page", description: "Remodeling service page has only 65 words. Competitors average 800+ words for this keyword.", fix: "Expand to 600+ words covering process, materials, timeline, pricing factors, before/after examples, and FAQ", status: "pending", impact: "+25% topical authority" },
  { id: 12, siteId: 3, type: "schema", severity: "medium", page: "/", title: "Missing HomeImprovement schema", description: "No structured data for contractor services. Schema enables rich results and builds trust.", fix: "Add LocalBusiness (HomeAndConstructionBusiness) JSON-LD with services, license info, and service area", status: "approved", impact: "+20% rich snippet eligibility" },
  { id: 13, siteId: 3, type: "performance", severity: "medium", page: "/portfolio", title: "Portfolio images unoptimized — 12MB total", description: "Portfolio page loads 12MB of images. Causing 6s+ load time on mobile.", fix: "Convert all images to WebP, resize to max 1200px width, implement lazy loading", status: "pending", impact: "+15% mobile experience" },
  { id: 14, siteId: 3, type: "link", severity: "low", page: "/blog", title: "Blog posts lack internal linking strategy", description: "Blog posts don't link to relevant service pages or each other.", fix: "Add 2-3 contextual internal links per blog post to service pages and related articles", status: "pending", impact: "+7% link equity" },

  // Edge Carpet Repair
  { id: 15, siteId: 4, type: "meta", severity: "high", page: "/", title: "Missing meta description on all pages", description: "No meta descriptions found on any page. Critical for CTR on carpet repair searches.", fix: 'Homepage: "Edge Carpet Repair — professional carpet stretching, patching & repair in Salt Lake City. Free estimates. Same-day service available."', status: "pending", impact: "+18% CTR est." },
  { id: 16, siteId: 4, type: "heading", severity: "high", page: "/services", title: "Multiple H1 tags — 4 found", description: "Services page has 4 H1 tags. Only one H1 should exist per page for proper heading hierarchy.", fix: "Keep primary H1 'Carpet Repair Services', convert others to H2: 'Carpet Stretching', 'Carpet Patching', 'Seam Repair'", status: "pending", impact: "+8% ranking signal" },
  { id: 17, siteId: 4, type: "schema", severity: "medium", page: "/", title: "Missing Service + LocalBusiness schema", description: "No structured data. Carpet repair is highly local — schema is critical for map pack.", fix: "Add LocalBusiness JSON-LD with serviceType: 'Carpet Repair', areaServed, and aggregateRating if reviews exist", status: "pending", impact: "+28% local pack eligibility" },
  { id: 18, siteId: 4, type: "content", severity: "medium", page: "/", title: "Homepage lacks geo-targeted content", description: "Homepage doesn't mention service areas in body content. Critical for Wasatch Front visibility.", fix: "Add service area section listing Salt Lake City, Murray, Sandy, West Jordan, Draper, Provo, Ogden, Lehi, Orem, Bountiful, Riverton, and Herriman", status: "pending", impact: "+20% local relevance" },
  { id: 19, siteId: 4, type: "image", severity: "low", page: "/gallery", title: "Before/after images missing alt text", description: "Gallery images lack alt text. These are high-value for image search queries like 'carpet repair before after'.", fix: 'Add descriptive alt text: "carpet seam repair before and after Salt Lake City" for each image pair', status: "pending", impact: "+10% image traffic" },
];

const MOCK_KEYWORDS = [
  // ── Hata Advising: Business Consulting & Advisory ──
  { keyword: "business consulting salt lake city", position: 18, volume: 1300, difficulty: 52, change: +3, page: "/services", site: 1, cluster: "core", priority: "primary" },
  { keyword: "small business advisor utah", position: 24, volume: 880, difficulty: 44, change: +5, page: "/", site: 1, cluster: "core", priority: "primary" },
  { keyword: "fractional cfo utah", position: 32, volume: 590, difficulty: 35, change: +2, page: "/services/fractional-cfo", site: 1, cluster: "service", priority: "primary" },
  { keyword: "business growth consultant provo", position: 41, volume: 320, difficulty: 29, change: 0, page: "/areas/provo", site: 1, cluster: "geo", priority: "secondary" },
  { keyword: "strategic planning advisor ogden", position: 48, volume: 210, difficulty: 31, change: +1, page: "/areas/ogden", site: 1, cluster: "geo", priority: "secondary" },
  { keyword: "startup consulting wasatch front", position: 55, volume: 170, difficulty: 26, change: 0, page: "/services/startups", site: 1, cluster: "service", priority: "tertiary" },
  { keyword: "business advisor murray utah", position: 38, volume: 140, difficulty: 22, change: +3, page: "/areas/murray", site: 1, cluster: "geo", priority: "secondary" },
  { keyword: "operational efficiency consulting utah", position: 29, volume: 260, difficulty: 40, change: +4, page: "/blog/operational-efficiency", site: 1, cluster: "content", priority: "tertiary" },

  // ── Green Clean Salt Lake: Eco-Friendly Cleaning ──
  { keyword: "eco friendly cleaning salt lake city", position: 12, volume: 720, difficulty: 38, change: +2, page: "/services", site: 2, cluster: "core", priority: "primary" },
  { keyword: "green cleaning service near me", position: 31, volume: 4400, difficulty: 61, change: -1, page: "/", site: 2, cluster: "core", priority: "primary" },
  { keyword: "house cleaning salt lake city", position: 22, volume: 2900, difficulty: 55, change: +4, page: "/residential", site: 2, cluster: "core", priority: "primary" },
  { keyword: "move out cleaning salt lake city", position: 19, volume: 1400, difficulty: 42, change: +3, page: "/services/move-out", site: 2, cluster: "service", priority: "primary" },
  { keyword: "office cleaning provo ut", position: 44, volume: 680, difficulty: 39, change: 0, page: "/areas/provo", site: 2, cluster: "geo", priority: "secondary" },
  { keyword: "deep cleaning service sandy utah", position: 28, volume: 520, difficulty: 34, change: +5, page: "/areas/sandy", site: 2, cluster: "geo", priority: "secondary" },
  { keyword: "non toxic cleaning service murray", position: 35, volume: 310, difficulty: 28, change: +2, page: "/areas/murray", site: 2, cluster: "geo", priority: "secondary" },
  { keyword: "house cleaning draper utah", position: 26, volume: 440, difficulty: 32, change: +1, page: "/areas/draper", site: 2, cluster: "geo", priority: "secondary" },
  { keyword: "commercial cleaning ogden", position: 39, volume: 580, difficulty: 45, change: 0, page: "/areas/ogden", site: 2, cluster: "geo", priority: "secondary" },
  { keyword: "recurring maid service utah county", position: 42, volume: 390, difficulty: 37, change: +2, page: "/services/recurring", site: 2, cluster: "service", priority: "tertiary" },
  { keyword: "eco friendly cleaning products safe", position: 15, volume: 1800, difficulty: 48, change: +6, page: "/blog/eco-products", site: 2, cluster: "content", priority: "tertiary" },

  // ── Built Contractors: General Contracting & Remodeling ──
  { keyword: "general contractor salt lake city", position: 27, volume: 3600, difficulty: 68, change: +1, page: "/", site: 3, cluster: "core", priority: "primary" },
  { keyword: "home remodeling utah", position: 35, volume: 2200, difficulty: 58, change: +6, page: "/services/remodeling", site: 3, cluster: "core", priority: "primary" },
  { keyword: "kitchen remodel salt lake city", position: 19, volume: 1900, difficulty: 53, change: +3, page: "/services/kitchen", site: 3, cluster: "service", priority: "primary" },
  { keyword: "bathroom remodel provo", position: 33, volume: 1100, difficulty: 50, change: +2, page: "/areas/provo", site: 3, cluster: "geo", priority: "primary" },
  { keyword: "basement finishing utah", position: 22, volume: 2100, difficulty: 55, change: +4, page: "/services/basement", site: 3, cluster: "service", priority: "primary" },
  { keyword: "home addition contractor ogden", position: 45, volume: 480, difficulty: 42, change: 0, page: "/areas/ogden", site: 3, cluster: "geo", priority: "secondary" },
  { keyword: "licensed contractor murray ut", position: 18, volume: 260, difficulty: 22, change: +5, page: "/areas/murray", site: 3, cluster: "geo", priority: "secondary" },
  { keyword: "custom home builder sandy utah", position: 38, volume: 720, difficulty: 51, change: +1, page: "/areas/sandy", site: 3, cluster: "geo", priority: "secondary" },
  { keyword: "contractor lehi utah", position: 41, volume: 390, difficulty: 35, change: +3, page: "/areas/lehi", site: 3, cluster: "geo", priority: "secondary" },
  { keyword: "deck building salt lake city", position: 30, volume: 880, difficulty: 44, change: +2, page: "/services/decks", site: 3, cluster: "service", priority: "tertiary" },
  { keyword: "remodel cost estimator utah", position: 16, volume: 1500, difficulty: 38, change: +7, page: "/blog/cost-guide", site: 3, cluster: "content", priority: "tertiary" },

  // ── Edge Carpet Repair: Carpet Services ──
  { keyword: "carpet repair salt lake city", position: 8, volume: 1100, difficulty: 32, change: +2, page: "/", site: 4, cluster: "core", priority: "primary" },
  { keyword: "carpet stretching near me", position: 14, volume: 6600, difficulty: 41, change: +4, page: "/services/stretching", site: 4, cluster: "core", priority: "primary" },
  { keyword: "carpet patching service utah", position: 6, volume: 480, difficulty: 28, change: +1, page: "/services/patching", site: 4, cluster: "service", priority: "primary" },
  { keyword: "carpet seam repair", position: 21, volume: 3200, difficulty: 45, change: -2, page: "/services/seam-repair", site: 4, cluster: "service", priority: "primary" },
  { keyword: "carpet repair provo utah", position: 11, volume: 390, difficulty: 25, change: +3, page: "/areas/provo", site: 4, cluster: "geo", priority: "secondary" },
  { keyword: "carpet stretching ogden", position: 16, volume: 280, difficulty: 23, change: +2, page: "/areas/ogden", site: 4, cluster: "geo", priority: "secondary" },
  { keyword: "carpet repair sandy ut", position: 9, volume: 310, difficulty: 21, change: +4, page: "/areas/sandy", site: 4, cluster: "geo", priority: "secondary" },
  { keyword: "carpet burn repair utah", position: 13, volume: 390, difficulty: 25, change: +1, page: "/services/burn-repair", site: 4, cluster: "service", priority: "secondary" },
  { keyword: "berber carpet repair near me", position: 18, volume: 880, difficulty: 30, change: +5, page: "/services/berber", site: 4, cluster: "service", priority: "secondary" },
  { keyword: "carpet repair west jordan", position: 15, volume: 220, difficulty: 19, change: +2, page: "/areas/west-jordan", site: 4, cluster: "geo", priority: "tertiary" },
  { keyword: "carpet repair lehi utah", position: 20, volume: 170, difficulty: 18, change: 0, page: "/areas/lehi", site: 4, cluster: "geo", priority: "tertiary" },
  { keyword: "diy carpet repair vs professional", position: 7, volume: 2400, difficulty: 35, change: +8, page: "/blog/diy-vs-pro", site: 4, cluster: "content", priority: "tertiary" },
];

// ── Keyword Strategy Config per Site ──
const KEYWORD_STRATEGIES = {
  1: {
    name: "Hata Advising",
    focus: "Business Consulting & Advisory — Wasatch Front",
    goal: "Position as the go-to B2B advisor across the Wasatch Front corridor",
    pillars: [
      { name: "Core Services", keywords: 3, desc: "Business consulting, advising, fractional CFO", color: COLORS.accent },
      { name: "Geo Expansion", keywords: 3, desc: "Provo, Ogden, Murray, Sandy, Lehi city pages", color: COLORS.purple },
      { name: "Thought Leadership", keywords: 2, desc: "Blog content on operational efficiency, scaling, strategy", color: COLORS.warning },
    ],
    geoTargets: ["Salt Lake City", "Murray", "Sandy", "Provo", "Ogden", "Lehi", "Draper", "Orem"],
    contentPlan: [
      "Create service-area landing pages for each Wasatch Front city",
      "Publish weekly blog on Utah business growth topics",
      "Add case studies with local business client results",
      "Build FAQ pages targeting long-tail advisory queries",
    ],
  },
  2: {
    name: "Green Clean Salt Lake",
    focus: "Eco-Friendly Cleaning Services — Wasatch Front",
    goal: "Dominate 'green/eco cleaning' niche + expand residential & commercial across Wasatch Front",
    pillars: [
      { name: "Core Cleaning", keywords: 4, desc: "House cleaning, eco cleaning, green cleaning, move-out", color: COLORS.accent },
      { name: "Geo Expansion", keywords: 5, desc: "Provo, Sandy, Murray, Draper, Ogden city pages", color: COLORS.purple },
      { name: "Content Authority", keywords: 2, desc: "Eco product guides, cleaning tips, sustainability", color: COLORS.warning },
    ],
    geoTargets: ["Salt Lake City", "Murray", "Sandy", "Draper", "Provo", "Ogden", "West Jordan", "Lehi", "Orem", "Bountiful"],
    contentPlan: [
      "Build city-specific landing pages with unique local content",
      "Create service pages: residential, commercial, move-out, deep clean, recurring",
      "Publish bi-weekly eco cleaning tips blog targeting informational queries",
      "Add customer review schema to every service page",
    ],
  },
  3: {
    name: "Built Contractors",
    focus: "General Contracting & Remodeling — Wasatch Front",
    goal: "Win high-intent remodeling searches + build geo presence across all Wasatch Front cities",
    pillars: [
      { name: "Core Services", keywords: 3, desc: "General contracting, remodeling, kitchen & bath", color: COLORS.accent },
      { name: "Geo Expansion", keywords: 5, desc: "Provo, Ogden, Murray, Sandy, Lehi city pages", color: COLORS.purple },
      { name: "Content & Trust", keywords: 3, desc: "Cost guides, project portfolios, how-to content", color: COLORS.warning },
    ],
    geoTargets: ["Salt Lake City", "Murray", "Sandy", "Provo", "Ogden", "Lehi", "Draper", "West Jordan", "Herriman", "Riverton"],
    contentPlan: [
      "Create dedicated service pages: kitchen, bathroom, basement, additions, decks",
      "Build geo landing pages for each target city with local project examples",
      "Publish cost estimator guides for Utah remodeling projects",
      "Add portfolio case studies with before/after and project details",
    ],
  },
  4: {
    name: "Edge Carpet Repair",
    focus: "Carpet Repair & Stretching — Wasatch Front",
    goal: "Own carpet repair niche across entire Wasatch Front — low competition, high conversion",
    pillars: [
      { name: "Core Services", keywords: 4, desc: "Carpet repair, stretching, patching, seam repair", color: COLORS.accent },
      { name: "Geo Expansion", keywords: 5, desc: "Provo, Ogden, Sandy, West Jordan, Lehi city pages", color: COLORS.purple },
      { name: "Content & SEO", keywords: 3, desc: "DIY vs pro, carpet care guides, before/after content", color: COLORS.warning },
    ],
    geoTargets: ["Salt Lake City", "Murray", "Sandy", "Provo", "Ogden", "West Jordan", "Lehi", "Draper", "Riverton", "Bountiful", "Orem"],
    contentPlan: [
      "Create service pages for each repair type with detailed process descriptions",
      "Build city landing pages with local testimonials and service area maps",
      "Publish carpet care blog targeting informational queries with high search volume",
      "Add before/after gallery with alt-optimized images per service type",
    ],
  },
};

const SEV_COLORS = { high: COLORS.danger, medium: COLORS.warning, low: COLORS.accent };
const SEV_BG = { high: COLORS.dangerDim, medium: COLORS.warningDim, low: COLORS.accentDim };
const STATUS_COLORS = { pending: COLORS.warning, approved: COLORS.accent, applied: COLORS.success, rejected: COLORS.danger };

// ── Icons ──
const Icon = ({ name, size = 16, color = COLORS.textMuted }) => {
  const icons = {
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    bar: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    play: <polygon points="5 3 19 12 5 21 5 3"/>,
    wp: <><circle cx="12" cy="12" r="10"/><path d="M8 12l2 6 2-4 2 4 2-6"/></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    robot: <><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ── Components ──
const Badge = ({ children, color, bg }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
    fontFamily: FONT, letterSpacing: "0.05em", textTransform: "uppercase",
    color, background: bg,
  }}>{children}</span>
);

const ScoreRing = ({ score, size = 64, stroke = 5 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? COLORS.success : score >= 60 ? COLORS.warning : COLORS.danger;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight="700" fontFamily={FONT}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{score}</text>
    </svg>
  );
};

const Btn = ({ children, variant = "default", small, onClick, disabled, style: sx }) => {
  const styles = {
    primary: { background: COLORS.accent, color: COLORS.bg, borderColor: COLORS.accent },
    danger: { background: COLORS.dangerDim, color: COLORS.danger, borderColor: "transparent" },
    success: { background: COLORS.successDim, color: COLORS.success, borderColor: "transparent" },
    default: { background: COLORS.surfaceAlt, color: COLORS.text, borderColor: COLORS.border },
    ghost: { background: "transparent", color: COLORS.textMuted, borderColor: "transparent" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], display: "inline-flex", alignItems: "center", gap: 6,
      padding: small ? "4px 12px" : "8px 18px", borderRadius: 8,
      border: `1px solid`, fontSize: small ? 12 : 13, fontWeight: 600,
      fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1, transition: "all 0.2s", letterSpacing: "0.02em",
      ...sx,
    }}>{children}</button>
  );
};

const Card = ({ children, style: sx, glow }) => (
  <div style={{
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 14, padding: 20, position: "relative",
    boxShadow: glow ? `0 0 30px ${COLORS.accentGlow}` : "none",
    transition: "box-shadow 0.3s", ...sx,
  }}>{children}</div>
);

const SectionTitle = ({ icon, children, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon name={icon} size={18} color={COLORS.accent}/>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: FONT_SANS, color: COLORS.text, letterSpacing: "-0.01em" }}>{children}</h3>
    </div>
    {action}
  </div>
);

// ── Workflow Panel ──
const WorkflowSteps = () => {
  const steps = [
    { label: "Crawl & Audit", icon: "search", desc: "Agent scans all pages" },
    { label: "AI Analysis", icon: "robot", desc: "Identifies SEO issues" },
    { label: "Review & Approve", icon: "shield", desc: "You approve changes" },
    { label: "Apply via WP API", icon: "wp", desc: "Auto-pushed to WordPress" },
  ];
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          flex: 1, padding: "16px 14px", background: COLORS.surfaceAlt,
          borderRadius: i === 0 ? "12px 0 0 12px" : i === 3 ? "0 12px 12px 0" : 0,
          borderRight: i < 3 ? `1px solid ${COLORS.border}` : "none",
          position: "relative", textAlign: "center",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: COLORS.accentDim, border: `1.5px solid ${COLORS.accent}`,
          }}>
            <Icon name={s.icon} size={16} color={COLORS.accent}/>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, fontFamily: FONT, marginBottom: 2 }}>{s.label}</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONT_SANS }}>{s.desc}</div>
          {i < 3 && <div style={{
            position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
            zIndex: 2, width: 14, height: 14, borderRadius: "50%",
            background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center",
          }}><Icon name="arrow" size={10} color={COLORS.accent}/></div>}
        </div>
      ))}
    </div>
  );
};

// ── Tabs ──
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "bar" },
  { id: "audit", label: "Audit & Fixes", icon: "alert" },
  { id: "keywords", label: "Keywords", icon: "trending" },
  { id: "wordpress", label: "WordPress", icon: "wp" },
  { id: "settings", label: "Settings", icon: "settings" },
];

// ── Main App ──
export default function SEOAgent() {
  const [tab, setTab] = useState("dashboard");
  const [sites, setSites] = useState(MOCK_SITES);
  const [activeSite, setActiveSite] = useState(1);
  const [auditItems, setAuditItems] = useState(MOCK_AUDIT_ITEMS);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const [wpLog, setWpLog] = useState([]);
  const [filterSev, setFilterSev] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Derived site data (must be before GSC logic)
  const site = sites.find(s => s.id === activeSite);
  const siteAudit = auditItems.filter(a => a.siteId === activeSite);
  const filteredAudit = siteAudit
    .filter(a => filterSev === "all" || a.severity === filterSev)
    .filter(a => filterStatus === "all" || a.status === filterStatus);

  const stats = {
    high: siteAudit.filter(a => a.severity === "high").length,
    medium: siteAudit.filter(a => a.severity === "medium").length,
    low: siteAudit.filter(a => a.severity === "low").length,
    pending: siteAudit.filter(a => a.status === "pending").length,
    approved: siteAudit.filter(a => a.status === "approved").length,
    applied: siteAudit.filter(a => a.status === "applied").length,
  };

  // ── GSC Live Data State ──
  const [gscConnected, setGscConnected] = useState(false);
  const [gscKeywords, setGscKeywords] = useState([]);
  const [gscSummary, setGscSummary] = useState(null);
  const [gscPages, setGscPages] = useState([]);
  const [gscLoading, setGscLoading] = useState(false);
  const [gscSyncing, setGscSyncing] = useState(false);
  const [gscLastSync, setGscLastSync] = useState(null);
  const [gscError, setGscError] = useState(null);

  // Check GSC auth status on mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/status`)
      .then(r => r.json())
      .then(d => setGscConnected(d.authenticated))
      .catch(() => setGscConnected(false));
  }, []);

  // Fetch GSC data when site changes or after sync
  const fetchGscData = useCallback(async () => {
    if (!gscConnected || !site) return;
    setGscLoading(true);
    setGscError(null);
    const encodedUrl = encodeURIComponent(site.url + "/");
    try {
      const [kwRes, summaryRes, pagesRes] = await Promise.all([
        fetch(`${API_BASE}/api/keywords/${encodedUrl}?limit=100`).then(r => r.json()),
        fetch(`${API_BASE}/api/summary/${encodedUrl}`).then(r => r.json()),
        fetch(`${API_BASE}/api/pages/${encodedUrl}?limit=20`).then(r => r.json()),
      ]);
      setGscKeywords(kwRes.keywords || []);
      setGscSummary(summaryRes.summary || null);
      setGscPages(pagesRes.pages || []);
      setGscLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      setGscError(err.message);
    } finally {
      setGscLoading(false);
    }
  }, [gscConnected, site]);

  useEffect(() => { fetchGscData(); }, [fetchGscData, activeSite]);

  // Trigger a manual GSC sync
  const triggerGscSync = async () => {
    if (!gscConnected || !site) return;
    setGscSyncing(true);
    const encodedUrl = encodeURIComponent(site.url + "/");
    try {
      await fetch(`${API_BASE}/api/sync/${encodedUrl}`, { method: "POST" });
      await fetchGscData();
    } catch (err) {
      setGscError(err.message);
    } finally {
      setGscSyncing(false);
    }
  };

  // Merged keyword data: use live GSC data when available, fallback to mock
  const liveKeywords = gscConnected && gscKeywords.length > 0;
  const displayKeywordsForSite = liveKeywords
    ? gscKeywords.map(kw => ({
        keyword: kw.keyword,
        page: kw.page ? new URL(kw.page).pathname : "/",
        position: Math.round(kw.position),
        change: kw.change ? Math.round(kw.change * 10) / 10 : 0,
        clicks: kw.clicks,
        impressions: kw.impressions,
        ctr: kw.ctr,
        volume: kw.impressions, // GSC impressions as volume proxy
        difficulty: 0, // Not available from GSC
        cluster: "live",
        priority: kw.position <= 10 ? "primary" : kw.position <= 30 ? "secondary" : "tertiary",
        site: activeSite,
      }))
    : MOCK_KEYWORDS.filter(kw => kw.site === activeSite);

  const runScan = () => {
    setScanning(true);
    setScanProgress(0);
    const iv = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) { clearInterval(iv); setScanning(false); return 100; }
        return p + Math.random() * 8 + 2;
      });
    }, 200);
  };

  const runAI = () => {
    setAiThinking(true);
    setTimeout(() => setAiThinking(false), 3000);
  };

  const updateItem = (id, updates) => {
    setAuditItems(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const approveItem = (id) => {
    updateItem(id, { status: "approved" });
  };

  const rejectItem = (id) => {
    updateItem(id, { status: "rejected" });
  };

  const applyToWP = (item) => {
    updateItem(item.id, { status: "applied" });
    setWpLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action: `Applied fix: ${item.title}`,
      page: item.page,
      status: "success",
    }, ...prev]);
  };

  const approveAll = () => {
    setAuditItems(prev => prev.map(a => a.siteId === activeSite && a.status === "pending" ? { ...a, status: "approved" } : a));
  };

  const applyAllApproved = () => {
    const approved = siteAudit.filter(a => a.status === "approved");
    approved.forEach(item => applyToWP(item));
  };

  // ── Render Tabs ──
  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <WorkflowSteps />

      {gscError && (
        <div style={{ background: COLORS.dangerDim, border: `1px solid ${COLORS.danger}44`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="alert" size={14} color={COLORS.danger}/>
          <span style={{ fontSize: 12, color: COLORS.danger, fontFamily: FONT_SANS, flex: 1 }}>GSC Error: {gscError}</span>
          <Btn small variant="danger" onClick={() => setGscError(null)}>Dismiss</Btn>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {(gscConnected && gscSummary ? [
          { label: "Avg Position", value: gscSummary.avgPosition || "—", color: (gscSummary.avgPosition || 99) <= 20 ? COLORS.success : COLORS.warning, sub: `${gscSummary.top10Keywords || 0} keywords in top 10` },
          { label: "Total Clicks", value: (gscSummary.totalClicks || 0).toLocaleString(), color: COLORS.accent, sub: "Last 28 days via GSC" },
          { label: "Impressions", value: (gscSummary.totalImpressions || 0).toLocaleString(), color: COLORS.purple, sub: "Search appearances" },
          { label: "Keywords Tracked", value: gscSummary.totalKeywords || 0, color: COLORS.success, sub: gscSummary.dataThrough ? `Data through ${gscSummary.dataThrough}` : "Live from Search Console" },
        ] : [
          { label: "SEO Score", value: <ScoreRing score={site?.score || 0} size={56} stroke={4}/>, sub: "Overall health" },
          { label: "Critical Issues", value: stats.high, color: COLORS.danger, sub: "Need attention" },
          { label: "Pending Review", value: stats.pending, color: COLORS.warning, sub: "Awaiting approval" },
          { label: "Fixes Applied", value: stats.applied, color: COLORS.success, sub: "Via WordPress API" },
        ]).map((s, i) => (
          <Card key={i}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: typeof s.value === "number" ? 32 : undefined, fontWeight: 800, color: s.color || COLORS.text, fontFamily: FONT }}>{s.value}</div>
            <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: FONT_SANS, marginTop: 4 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionTitle icon="alert">Issue Breakdown</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "High Severity", count: stats.high, color: COLORS.danger, bg: COLORS.dangerDim },
              { label: "Medium Severity", count: stats.medium, color: COLORS.warning, bg: COLORS.warningDim },
              { label: "Low Severity", count: stats.low, color: COLORS.accent, bg: COLORS.accentDim },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, boxShadow: `0 0 8px ${r.color}` }}/>
                <span style={{ flex: 1, fontSize: 13, color: COLORS.text, fontFamily: FONT_SANS }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: r.color, fontFamily: FONT }}>{r.count}</span>
                <div style={{ width: 80, height: 6, borderRadius: 3, background: COLORS.bg, overflow: "hidden" }}>
                  <div style={{ width: `${(r.count / siteAudit.length) * 100}%`, height: "100%", borderRadius: 3, background: r.color, transition: "width 0.5s" }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon="zap">Quick Actions</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gscConnected ? (
              <Btn variant="primary" onClick={triggerGscSync} disabled={gscSyncing}>
                <Icon name="trending" size={14} color={COLORS.bg}/>
                {gscSyncing ? "Syncing Search Console..." : "Sync Search Console Data"}
              </Btn>
            ) : (
              <Btn variant="primary" onClick={() => window.open(`${API_BASE}/auth/login`, '_blank')}>
                <Icon name="link" size={14} color={COLORS.bg}/>
                Connect Google Search Console
              </Btn>
            )}
            <Btn onClick={runScan} disabled={scanning}>
              <Icon name="search" size={14} color={COLORS.textMuted}/>
              {scanning ? `Scanning... ${Math.min(100, Math.round(scanProgress))}%` : "Run Full SEO Audit"}
            </Btn>
            {scanning && <div style={{ height: 4, borderRadius: 2, background: COLORS.bg, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, scanProgress)}%`, height: "100%", background: COLORS.accent, borderRadius: 2, transition: "width 0.3s" }}/>
            </div>}
            <Btn onClick={runAI} disabled={aiThinking}>
              <Icon name="robot" size={14} color={COLORS.textMuted}/>
              {aiThinking ? "AI Analyzing..." : "Run AI Analysis"}
            </Btn>
            <Btn onClick={approveAll}>
              <Icon name="check" size={14} color={COLORS.textMuted}/>
              Approve All Pending
            </Btn>
            <Btn variant="success" onClick={applyAllApproved} disabled={stats.approved === 0}>
              <Icon name="wp" size={14} color={COLORS.success}/>
              Push {stats.approved} Approved to WordPress
            </Btn>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Icon name="trending" size={18} color={COLORS.accent}/>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: FONT_SANS, color: COLORS.text }}>Top Keywords</h3>
          {liveKeywords && <Badge color={COLORS.success} bg={COLORS.successDim}>LIVE</Badge>}
          {gscLastSync && <span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.textDim, fontFamily: FONT }}>Synced {gscLastSync}</span>}
        </div>
        {gscLoading ? (
          <div style={{ textAlign: "center", padding: 24, color: COLORS.textMuted, fontFamily: FONT }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${COLORS.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 8px" }}/>
            Loading Search Console data...
          </div>
        ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_SANS }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {(liveKeywords ? ["Keyword", "Position", "Clicks", "Impressions", "CTR", "Δ"] : ["Keyword", "Position", "Volume", "Difficulty", "Δ"]).map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: COLORS.textMuted, fontSize: 11, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayKeywordsForSite.slice(0, 8).map((kw, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
                <td style={{ padding: "10px 12px", color: COLORS.text, fontWeight: 500 }}>{kw.keyword}</td>
                <td style={{ padding: "10px 12px" }}><span style={{ fontFamily: FONT, fontWeight: 700, color: kw.position <= 10 ? COLORS.success : kw.position <= 20 ? COLORS.warning : COLORS.textMuted }}>#{kw.position}</span></td>
                {liveKeywords ? (<>
                  <td style={{ padding: "10px 12px", color: COLORS.accent, fontFamily: FONT, fontWeight: 600 }}>{kw.clicks.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px", color: COLORS.textMuted, fontFamily: FONT }}>{kw.impressions.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px", color: COLORS.textMuted, fontFamily: FONT }}>{kw.ctr}%</td>
                </>) : (<>
                  <td style={{ padding: "10px 12px", color: COLORS.textMuted, fontFamily: FONT }}>{kw.volume.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 4, borderRadius: 2, background: COLORS.bg }}>
                        <div style={{ width: `${kw.difficulty}%`, height: "100%", borderRadius: 2, background: kw.difficulty > 70 ? COLORS.danger : kw.difficulty > 50 ? COLORS.warning : COLORS.success }}/>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: FONT, color: COLORS.textMuted }}>{kw.difficulty}</span>
                    </div>
                  </td>
                </>)}
                <td style={{ padding: "10px 12px", fontFamily: FONT, fontWeight: 600, color: kw.change > 0 ? COLORS.success : kw.change < 0 ? COLORS.danger : COLORS.textMuted }}>
                  {kw.change > 0 ? `▲${kw.change}` : kw.change < 0 ? `▼${Math.abs(kw.change)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </Card>
    </div>
  );

  const renderAudit = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONT, textTransform: "uppercase", marginRight: 4 }}>Severity:</span>
        {["all", "high", "medium", "low"].map(s => (
          <Btn key={s} small variant={filterSev === s ? "primary" : "ghost"} onClick={() => setFilterSev(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Btn>
        ))}
        <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONT, textTransform: "uppercase", marginLeft: 12, marginRight: 4 }}>Status:</span>
        {["all", "pending", "approved", "applied"].map(s => (
          <Btn key={s} small variant={filterStatus === s ? "primary" : "ghost"} onClick={() => setFilterStatus(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Btn>
        ))}
      </div>

      {filteredAudit.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <Icon name="check" size={32} color={COLORS.success}/>
          <p style={{ color: COLORS.textMuted, fontFamily: FONT_SANS, marginTop: 12 }}>No items match your filters.</p>
        </Card>
      ) : filteredAudit.map(item => (
        <Card key={item.id} style={{ borderLeft: `3px solid ${SEV_COLORS[item.severity]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge color={SEV_COLORS[item.severity]} bg={SEV_BG[item.severity]}>{item.severity}</Badge>
              <Badge color={STATUS_COLORS[item.status]} bg={`${STATUS_COLORS[item.status]}22`}>{item.status}</Badge>
              <span style={{ fontSize: 11, color: COLORS.accent, fontFamily: FONT, background: COLORS.accentDim, padding: "2px 8px", borderRadius: 4 }}>{item.impact}</span>
            </div>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONT }}>{item.page}</span>
          </div>

          <h4 style={{ margin: "0 0 6px", fontSize: 15, color: COLORS.text, fontFamily: FONT_SANS, fontWeight: 600 }}>{item.title}</h4>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.textMuted, fontFamily: FONT_SANS, lineHeight: 1.5 }}>{item.description}</p>

          <div style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px", marginBottom: 12, borderLeft: `2px solid ${COLORS.accent}` }}>
            <div style={{ fontSize: 10, color: COLORS.accent, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Suggested Fix</div>
            <div style={{ fontSize: 12, color: COLORS.text, fontFamily: FONT, lineHeight: 1.6 }}>{item.fix}</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {item.status === "pending" && <>
              <Btn small variant="success" onClick={() => approveItem(item.id)}><Icon name="check" size={12} color={COLORS.success}/>Approve</Btn>
              <Btn small variant="danger" onClick={() => rejectItem(item.id)}><Icon name="x" size={12} color={COLORS.danger}/>Reject</Btn>
            </>}
            {item.status === "approved" && (
              <Btn small variant="primary" onClick={() => applyToWP(item)}><Icon name="wp" size={12} color={COLORS.bg}/>Push to WordPress</Btn>
            )}
            {item.status === "applied" && (
              <Badge color={COLORS.success} bg={COLORS.successDim}>✓ Applied successfully</Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const [clusterFilter, setClusterFilter] = useState("all");

  const renderKeywords = () => {
    const strategy = KEYWORD_STRATEGIES[activeSite];
    const siteKws = MOCK_KEYWORDS.filter(kw => kw.site === activeSite);
    const clusters = { core: siteKws.filter(k => k.cluster === "core"), service: siteKws.filter(k => k.cluster === "service"), geo: siteKws.filter(k => k.cluster === "geo"), content: siteKws.filter(k => k.cluster === "content") };
    const clusterMeta = { core: { label: "Core Keywords", color: COLORS.danger, icon: "zap" }, service: { label: "Service Keywords", color: COLORS.accent, icon: "layers" }, geo: { label: "Geo-Targeted", color: COLORS.purple, icon: "globe" }, content: { label: "Content / Blog", color: COLORS.warning, icon: "file" } };
    const displayKws = clusterFilter === "all" ? siteKws : siteKws.filter(k => k.cluster === clusterFilter);

    return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Live GSC Data Panel ── */}
      {gscConnected && (
        <Card glow style={{ borderColor: COLORS.success + "44" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, boxShadow: `0 0 8px ${COLORS.success}` }}/>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: FONT_SANS, color: COLORS.text }}>
                Live Search Console Data
              </h3>
              <Badge color={COLORS.success} bg={COLORS.successDim}>LIVE</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {gscLastSync && <span style={{ fontSize: 10, color: COLORS.textDim, fontFamily: FONT }}>Synced {gscLastSync}</span>}
              <Btn small variant="default" onClick={triggerGscSync} disabled={gscSyncing}>
                {gscSyncing ? "Syncing..." : "Refresh"}
              </Btn>
            </div>
          </div>

          {gscSummary && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Total Keywords", value: gscSummary.totalKeywords, color: COLORS.accent },
                { label: "Total Clicks", value: gscSummary.totalClicks?.toLocaleString(), color: COLORS.success },
                { label: "Impressions", value: gscSummary.totalImpressions?.toLocaleString(), color: COLORS.purple },
                { label: "Avg Position", value: gscSummary.avgPosition, color: gscSummary.avgPosition <= 20 ? COLORS.success : COLORS.warning },
              ].map((m, i) => (
                <div key={i} style={{ background: COLORS.bg, borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: FONT, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONT, textTransform: "uppercase" }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {gscLoading ? (
            <div style={{ textAlign: "center", padding: 16, color: COLORS.textMuted, fontFamily: FONT }}>Loading...</div>
          ) : gscKeywords.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_SANS }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {["Keyword", "Position", "Clicks", "Impressions", "CTR", "Δ", "Page"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: COLORS.textMuted, fontSize: 10, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayKeywordsForSite.slice(0, 20).map((kw, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
                    <td style={{ padding: "8px 10px", color: COLORS.text, fontWeight: 600, maxWidth: 200 }}>{kw.keyword}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 22, borderRadius: 6, fontFamily: FONT, fontWeight: 700, fontSize: 11,
                        background: kw.position <= 10 ? COLORS.successDim : kw.position <= 20 ? COLORS.warningDim : COLORS.surfaceAlt,
                        color: kw.position <= 10 ? COLORS.success : kw.position <= 20 ? COLORS.warning : COLORS.textMuted,
                      }}>{kw.position}</span>
                    </td>
                    <td style={{ padding: "8px 10px", color: COLORS.accent, fontFamily: FONT, fontWeight: 600 }}>{kw.clicks.toLocaleString()}</td>
                    <td style={{ padding: "8px 10px", color: COLORS.textMuted, fontFamily: FONT }}>{kw.impressions.toLocaleString()}</td>
                    <td style={{ padding: "8px 10px", color: COLORS.textMuted, fontFamily: FONT }}>{kw.ctr}%</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, color: kw.change > 0 ? COLORS.success : kw.change < 0 ? COLORS.danger : COLORS.textMuted }}>
                        {kw.change > 0 ? `▲${kw.change}` : kw.change < 0 ? `▼${Math.abs(kw.change)}` : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 11, color: COLORS.accent, fontFamily: FONT, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw.page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", padding: 16, color: COLORS.textDim, fontFamily: FONT_SANS }}>
              No keyword data yet. Click "Refresh" to sync from Search Console.
            </div>
          )}
        </Card>
      )}

      {!gscConnected && (
        <Card style={{ borderColor: COLORS.warning + "44", borderStyle: "dashed" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="alert" size={18} color={COLORS.warning}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: FONT_SANS }}>Search Console Not Connected</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONT_SANS }}>Connect GSC to see live keyword rankings, clicks, and impressions below.</div>
              </div>
            </div>
            <Btn small variant="primary" onClick={() => window.open(`${API_BASE}/auth/login`, '_blank')}>
              <Icon name="link" size={12} color={COLORS.bg}/>Connect GSC
            </Btn>
          </div>
        </Card>
      )}
      {/* Strategy Header */}
      <Card glow>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, color: COLORS.accent, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Keyword Strategy</div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: COLORS.text, fontFamily: FONT_SANS }}>{strategy.focus}</h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: COLORS.textMuted, fontFamily: FONT_SANS, lineHeight: 1.5 }}>{strategy.goal}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: FONT, color: COLORS.accent }}>{siteKws.length}</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONT, textTransform: "uppercase" }}>Keywords Tracked</div>
          </div>
        </div>

        {/* Pillar Summary */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${strategy.pillars.length}, 1fr)`, gap: 10 }}>
          {strategy.pillars.map((p, i) => (
            <div key={i} style={{ background: COLORS.bg, borderRadius: 10, padding: 14, borderLeft: `3px solid ${p.color}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: FONT_SANS, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONT_SANS, marginBottom: 6 }}>{p.desc}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT, color: p.color }}>{p.keywords}<span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}> keywords</span></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Geo Targets */}
      <Card>
        <SectionTitle icon="globe">Wasatch Front Geo Targets</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {strategy.geoTargets.map((city, i) => (
            <div key={i} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              fontFamily: FONT_SANS, color: COLORS.purple, background: COLORS.purpleDim,
              border: `1px solid ${COLORS.purple}33`,
            }}>
              📍 {city}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "10px 14px", background: COLORS.bg, borderRadius: 8, borderLeft: `2px solid ${COLORS.purple}` }}>
          <div style={{ fontSize: 10, color: COLORS.purple, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Geo Strategy</div>
          <div style={{ fontSize: 12, color: COLORS.text, fontFamily: FONT_SANS, lineHeight: 1.6 }}>
            Create dedicated landing pages for each city: <span style={{ color: COLORS.accent, fontFamily: FONT }}>/{"{city}"}</span> with unique local content, testimonials, and area-specific service details. Internal link from service pages to geo pages and vice versa.
          </div>
        </div>
      </Card>

      {/* Keyword Rankings Table with Cluster Filter */}
      <Card>
        <SectionTitle icon="trending">Keyword Rankings</SectionTitle>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <Btn small variant={clusterFilter === "all" ? "primary" : "ghost"} onClick={() => setClusterFilter("all")}>All ({siteKws.length})</Btn>
          {Object.entries(clusterMeta).map(([key, meta]) => {
            const count = clusters[key]?.length || 0;
            return count > 0 ? (
              <Btn key={key} small variant={clusterFilter === key ? "primary" : "ghost"} onClick={() => setClusterFilter(key)}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, display: "inline-block" }}/> {meta.label} ({count})
              </Btn>
            ) : null;
          })}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_SANS }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["Keyword", "Cluster", "Pos", "Vol", "KD", "Δ", "Priority", "Target Page"].map(h => (
                <th key={h} style={{ padding: "10px 8px", textAlign: "left", color: COLORS.textMuted, fontSize: 10, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayKws.map((kw, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
                <td style={{ padding: "10px 8px", color: COLORS.text, fontWeight: 600, maxWidth: 200 }}>{kw.keyword}</td>
                <td style={{ padding: "10px 8px" }}>
                  <Badge color={clusterMeta[kw.cluster]?.color} bg={`${clusterMeta[kw.cluster]?.color}22`}>{kw.cluster}</Badge>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 22, borderRadius: 6, fontFamily: FONT, fontWeight: 700, fontSize: 11,
                    background: kw.position <= 10 ? COLORS.successDim : kw.position <= 20 ? COLORS.warningDim : COLORS.surfaceAlt,
                    color: kw.position <= 10 ? COLORS.success : kw.position <= 20 ? COLORS.warning : COLORS.textMuted,
                  }}>{kw.position}</span>
                </td>
                <td style={{ padding: "10px 8px", color: COLORS.textMuted, fontFamily: FONT, fontSize: 12 }}>{kw.volume.toLocaleString()}</td>
                <td style={{ padding: "10px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: COLORS.bg, overflow: "hidden" }}>
                      <div style={{ width: `${kw.difficulty}%`, height: "100%", borderRadius: 2, background: kw.difficulty > 60 ? COLORS.danger : kw.difficulty > 40 ? COLORS.warning : COLORS.success }}/>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: FONT, color: COLORS.textMuted }}>{kw.difficulty}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, color: kw.change > 0 ? COLORS.success : kw.change < 0 ? COLORS.danger : COLORS.textMuted }}>
                    {kw.change > 0 ? `▲${kw.change}` : kw.change < 0 ? `▼${Math.abs(kw.change)}` : "—"}
                  </span>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <Badge color={kw.priority === "primary" ? COLORS.danger : kw.priority === "secondary" ? COLORS.warning : COLORS.textMuted}
                    bg={kw.priority === "primary" ? COLORS.dangerDim : kw.priority === "secondary" ? COLORS.warningDim : COLORS.surfaceAlt}>
                    {kw.priority}
                  </Badge>
                </td>
                <td style={{ padding: "10px 8px", fontSize: 11, color: COLORS.accent, fontFamily: FONT }}>{kw.page}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Content Plan */}
      <Card>
        <SectionTitle icon="file">Content & Page Creation Plan</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {strategy.contentPlan.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
              background: COLORS.bg, borderRadius: 10, border: `1px solid ${COLORS.border}`,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: COLORS.accentDim, color: COLORS.accent, fontSize: 12, fontWeight: 800, fontFamily: FONT,
              }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: COLORS.text, fontFamily: FONT_SANS, lineHeight: 1.5 }}>{item}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Suggestions */}
      <Card>
        <SectionTitle icon="robot">AI Keyword Opportunities</SectionTitle>
        <p style={{ color: COLORS.textMuted, fontFamily: FONT_SANS, fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>
          High-opportunity keywords identified by analyzing content gaps, competitor rankings, and Wasatch Front search patterns.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {(activeSite === 1 ? [
            { kw: "fractional cfo provo", vol: 210, diff: 28, opp: "High" },
            { kw: "business exit planning utah", vol: 170, diff: 32, opp: "High" },
            { kw: "executive coaching salt lake", vol: 440, diff: 38, opp: "Medium" },
          ] : activeSite === 2 ? [
            { kw: "airbnb cleaning salt lake city", vol: 590, diff: 35, opp: "High" },
            { kw: "post construction cleaning utah", vol: 320, diff: 30, opp: "High" },
            { kw: "cleaning service lehi utah", vol: 280, diff: 26, opp: "High" },
          ] : activeSite === 3 ? [
            { kw: "adu construction salt lake city", vol: 720, diff: 45, opp: "Medium" },
            { kw: "aging in place remodel utah", vol: 340, diff: 28, opp: "High" },
            { kw: "home addition cost utah 2026", vol: 510, diff: 33, opp: "High" },
          ] : [
            { kw: "pet damage carpet repair utah", vol: 460, diff: 22, opp: "High" },
            { kw: "carpet to tile transition repair", vol: 720, diff: 29, opp: "High" },
            { kw: "landlord carpet repair salt lake", vol: 280, diff: 20, opp: "High" },
          ]).map((s, i) => (
            <div key={i} style={{ background: COLORS.bg, borderRadius: 10, padding: 14, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: FONT_SANS, marginBottom: 8 }}>{s.kw}</div>
              <div style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: FONT }}>
                <span style={{ color: COLORS.textMuted }}>{s.vol.toLocaleString()}/mo</span>
                <span style={{ color: s.diff < 45 ? COLORS.success : COLORS.warning }}>KD {s.diff}</span>
                <Badge color={s.opp === "High" ? COLORS.success : COLORS.warning} bg={s.opp === "High" ? COLORS.successDim : COLORS.warningDim}>{s.opp}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
  };

  const renderWordPress = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card glow>
        <SectionTitle icon="wp">WordPress Integration</SectionTitle>
        <p style={{ color: COLORS.textMuted, fontFamily: FONT_SANS, fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
          The SEO agent connects to your WordPress sites via the REST API. Approved fixes are automatically applied — meta tags, headings, schema markup, alt text, and more.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {sites.map(s => (
            <div key={s.id} style={{
              background: COLORS.bg, borderRadius: 10, padding: 16,
              border: `1px solid ${s.status === "connected" ? COLORS.success + "44" : COLORS.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: FONT_SANS }}>{s.name}</span>
                <Badge color={s.status === "connected" ? COLORS.success : COLORS.warning}
                  bg={s.status === "connected" ? COLORS.successDim : COLORS.warningDim}>
                  {s.status}
                </Badge>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONT }}>{s.url}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: FONT_SANS, marginTop: 6 }}>{s.pages} pages indexed</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle icon="layers">What the Agent Can Update via WP API</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Title Tags", desc: "Update <title> for each page/post", icon: "file" },
            { label: "Meta Descriptions", desc: "Set meta description via Yoast/RankMath", icon: "search" },
            { label: "Heading Structure", desc: "Fix H1-H6 hierarchy in post content", icon: "bar" },
            { label: "Schema Markup", desc: "Inject JSON-LD structured data", icon: "layers" },
            { label: "Image Alt Text", desc: "Update alt attributes on media", icon: "globe" },
            { label: "Internal Links", desc: "Fix broken links, add suggested links", icon: "link" },
            { label: "Redirects", desc: "Create 301 redirects for dead pages", icon: "arrow" },
            { label: "Sitemap", desc: "Regenerate and ping search engines", icon: "settings" },
          ].map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: COLORS.bg, borderRadius: 10, padding: 14,
              border: `1px solid ${COLORS.border}`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: COLORS.accentDim,
              }}>
                <Icon name={c.icon} size={14} color={COLORS.accent}/>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: FONT_SANS }}>{c.label}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONT_SANS }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle icon="zap">Deployment Log</SectionTitle>
        {wpLog.length === 0 ? (
          <p style={{ color: COLORS.textDim, fontFamily: FONT_SANS, fontSize: 13, margin: 0 }}>No deployments yet. Approve and push fixes to see activity here.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {wpLog.map((log, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                background: COLORS.bg, borderRadius: 8, fontSize: 12,
              }}>
                <span style={{ color: COLORS.success, fontFamily: FONT, fontSize: 11 }}>✓</span>
                <span style={{ color: COLORS.textMuted, fontFamily: FONT, fontSize: 11, width: 70, flexShrink: 0 }}>{log.time}</span>
                <span style={{ color: COLORS.text, fontFamily: FONT_SANS, flex: 1 }}>{log.action}</span>
                <span style={{ color: COLORS.accent, fontFamily: FONT, fontSize: 11 }}>{log.page}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const [settingsToggles, setSettingsToggles] = useState({
    autoApprove: false, notifyCritical: true, weeklyAudit: true, twoPersonApproval: false, backupBeforeApply: true,
  });
  const toggleSetting = (key) => setSettingsToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const renderSettings = () => {
    const settingsOptions = [
      { key: "autoApprove", label: "Auto-approve low severity fixes", desc: "Skip manual approval for low-risk changes" },
      { key: "notifyCritical", label: "Notify on new critical issues", desc: "Email alerts when high-severity issues are found" },
      { key: "weeklyAudit", label: "Schedule weekly audits", desc: "Automatically run full SEO audit every Monday" },
      { key: "twoPersonApproval", label: "Require 2-person approval for content changes", desc: "Content edits need a second reviewer" },
      { key: "backupBeforeApply", label: "Backup before applying changes", desc: "Create WordPress revision before each update" },
    ];
    return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle icon="settings">Agent Configuration</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {settingsOptions.map((opt, i) => {
            const on = settingsToggles[opt.key];
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}22` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, fontFamily: FONT_SANS }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONT_SANS, marginTop: 2 }}>{opt.desc}</div>
                </div>
                <div onClick={() => toggleSetting(opt.key)} style={{
                  width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                  background: on ? COLORS.accent : COLORS.surfaceAlt,
                  border: `1px solid ${on ? COLORS.accent : COLORS.border}`,
                  position: "relative", transition: "all 0.2s",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: on ? COLORS.bg : COLORS.textMuted,
                    position: "absolute", top: 2, left: on ? 22 : 2,
                    transition: "all 0.2s",
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle icon="link">API Connections</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "WordPress REST API", status: "Connected", connected: true },
            { label: "Google Search Console", status: gscConnected ? "Connected" : "Connect", connected: gscConnected, action: () => window.open(`${API_BASE}/auth/login`, '_blank') },
            { label: "Google Analytics 4", status: "Connect", connected: false },
            { label: "Ahrefs / SEMrush", status: "Connect", connected: false },
          ].map((api, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: COLORS.bg, borderRadius: 10, padding: "12px 16px",
              border: api.connected ? `1px solid ${COLORS.success}33` : `1px solid ${COLORS.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {api.connected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.success, boxShadow: `0 0 6px ${COLORS.success}` }}/>}
                <span style={{ fontSize: 13, color: COLORS.text, fontFamily: FONT_SANS, fontWeight: 500 }}>{api.label}</span>
              </div>
              <Btn small variant={api.connected ? "success" : "default"} onClick={api.action}>
                {api.connected && <Icon name="check" size={12} color={COLORS.success}/>}
                {api.status}
              </Btn>
            </div>
          ))}
        </div>
        {gscConnected && gscLastSync && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: COLORS.successDim, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: COLORS.success, fontFamily: FONT_SANS }}>Search Console last synced at {gscLastSync}</span>
            <Btn small variant="default" onClick={triggerGscSync} disabled={gscSyncing}>{gscSyncing ? "Syncing..." : "Sync Now"}</Btn>
          </div>
        )}
      </Card>
    </div>
  );
  };

  const panels = { dashboard: renderDashboard, audit: renderAudit, keywords: renderKeywords, wordpress: renderWordPress, settings: renderSettings };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: FONT_SANS, color: COLORS.text }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{
        background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="zap" size={18} color={COLORS.bg}/>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>SEO Agent</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONT, letterSpacing: "0.06em" }}>AUDIT → APPROVE → DEPLOY</div>
          </div>
        </div>

        {/* Site Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {sites.map(s => (
            <div key={s.id} onClick={() => setActiveSite(s.id)} style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              background: activeSite === s.id ? COLORS.accentDim : "transparent",
              border: `1px solid ${activeSite === s.id ? COLORS.accent : "transparent"}`,
              color: activeSite === s.id ? COLORS.accent : COLORS.textMuted,
              fontSize: 12, fontWeight: 600, fontFamily: FONT, transition: "all 0.2s",
            }}>
              {s.name}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{
          width: 200, minHeight: "calc(100vh - 63px)", background: COLORS.surface,
          borderRight: `1px solid ${COLORS.border}`, padding: "16px 10px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
              background: tab === t.id ? COLORS.accentDim : "transparent",
              borderLeft: `2px solid ${tab === t.id ? COLORS.accent : "transparent"}`,
            }}>
              <Icon name={t.icon} size={16} color={tab === t.id ? COLORS.accent : COLORS.textMuted}/>
              <span style={{
                fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? COLORS.accent : COLORS.textMuted,
                fontFamily: FONT_SANS,
              }}>{t.label}</span>
              {t.id === "audit" && stats.pending > 0 && (
                <span style={{
                  marginLeft: "auto", background: COLORS.warning, color: COLORS.bg,
                  fontSize: 10, fontWeight: 800, fontFamily: FONT,
                  padding: "1px 6px", borderRadius: 10, minWidth: 18, textAlign: "center",
                }}>{stats.pending}</span>
              )}
            </div>
          ))}

          <div style={{ flex: 1 }}/>
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${COLORS.border}`, marginTop: 8 }}>
            <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Connections</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.success, boxShadow: `0 0 6px ${COLORS.success}` }}/>
              <span style={{ fontSize: 11, color: COLORS.success, fontFamily: FONT }}>Agent Online</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: gscConnected ? COLORS.success : COLORS.warning, boxShadow: `0 0 6px ${gscConnected ? COLORS.success : COLORS.warning}` }}/>
              <span style={{ fontSize: 11, color: gscConnected ? COLORS.success : COLORS.warning, fontFamily: FONT }}>
                GSC {gscConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 24, maxWidth: 960, overflowY: "auto" }}>
          {panels[tab]?.()}
        </div>
      </div>

      {/* AI Thinking Overlay */}
      {aiThinking && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "14px 20px",
          background: COLORS.surface, border: `1px solid ${COLORS.accent}`,
          borderRadius: 12, boxShadow: `0 0 40px ${COLORS.accentGlow}`,
          display: "flex", alignItems: "center", gap: 12, zIndex: 200,
        }}>
          <div style={{
            width: 20, height: 20, border: `2px solid ${COLORS.accent}`,
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}/>
          <span style={{ fontSize: 13, color: COLORS.accent, fontFamily: FONT }}>AI analyzing SEO issues...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}

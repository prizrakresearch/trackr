const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:9696"
const DEFAULT_USER_ID = import.meta.env.VITE_USER_ID ?? "u1"

const DEFAULT_COMPANIES = [
  {
    name: "Apollo Tyres Limited",
    symbol: "APOLLOTYRE",
    avatarUrl: "https://logo.clearbit.com/apollotyres.com",
    keywords: ["Apollo", "Apollo Tyres", "Apollo Tyre", "APOLLOTYRE"],
  },
  {
    name: "Indag Rubber Limited",
    symbol: "INDAG",
    avatarUrl: "https://logo.clearbit.com/indagrubber.com",
    keywords: ["Indag", "Indag Rubber", "INDAG", "retread", "retreading", "precured tread"],
  },
  {
    name: "MRF Limited",
    symbol: "MRF",
    avatarUrl: "https://logo.clearbit.com/mrftyres.com",
    keywords: ["MRF", "MRF Limited", "MRF Ltd", "MRF Tyres"],
  },
  {
    name: "CEAT Limited",
    symbol: "CEATLTD",
    avatarUrl: "https://logo.clearbit.com/ceat.com",
    keywords: ["CEAT", "CEATLTD", "CEAT Limited", "CEAT Tyres"],
  },
  {
    name: "JK Tyre & Industries Limited",
    symbol: "JKTYRE",
    avatarUrl: "https://logo.clearbit.com/jktyre.com",
    keywords: ["JK Tyre", "JKTYRE", "JK Tyre & Industries", "JK Tyres"],
  },
  {
    name: "Midas Touch Investors Association Pvt Ltd",
    symbol: "MIDAS",
    avatarUrl: null,
    keywords: [
      "Midas",
      "Midas Touch",
      "Midas Touch Investors",
      "Midas Touch Investors Association",
      "Midas Touch Investors Association Pvt Ltd",
      "Midas Touch Investors Association Private Limited",
      "MIDAS",
      "MTIA",
    ],
  },
]

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}

async function requestBlob(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }

  const contentDisposition = res.headers.get("Content-Disposition") || ""
  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
  const fileName = fileNameMatch?.[1] || "feed-sources.csv"

  return {
    blob: await res.blob(),
    fileName,
    contentType: res.headers.get("Content-Type") || "text/csv",
  }
}

// ── Feed ──────────────────────────────────────────────────────────────────────

function mapBackendItemToFeedItem(item = {}) {
  const url = item.link ?? item.url ?? ""
  const published = item.published ?? item.published_at ?? new Date().toISOString()

  return {
    id: item.id ?? url ?? crypto.randomUUID(),
    company_id: item.company_id ?? null,
    matched_keyword: item.matched_keyword ?? null,
    title: item.title ?? "Untitled",
    summary: item.summary ?? "",
    content: item.summary ?? "",
    source: item.source ?? "Unknown Source",
    type: item.type ?? "news",
    url,
    link: url,
    published,
    published_at: published,
  }
}

function getPersistedUserId() {
  try {
    const value = localStorage.getItem("trackr_user_id")
    if (value && value.trim()) return value.trim()
  } catch {
    // Ignore storage read errors and fall back to defaults.
  }
  return DEFAULT_USER_ID
}

export async function getFeed(params = {}) {
  const query = new URLSearchParams()
  query.set("user_id", params.user_id ?? getPersistedUserId())
  query.set("limit", String(params.limit ?? 100))
  query.set("offset", String(params.offset ?? 0))

  if (params.search) query.set("search", params.search)
  if (params.refresh) query.set("refresh", "true")

  const response = await request(`/api/feed?${query.toString()}`)
  const items = Array.isArray(response?.items) ? response.items : []
  return items.map(mapBackendItemToFeedItem)
}

export async function getArticleRead(url) {
  const query = new URLSearchParams()
  query.set("url", url)
  return request(`/api/article/read?${query.toString()}`)
}

// ── RSS Feed Sources ─────────────────────────────────────────────────────────

function mapFeedSource(item = {}) {
  const rawCategory = String(item.category || "news").toLowerCase()
  const category =
    rawCategory === "filings" ? "filing" :
    rawCategory === "pressrelease" || rawCategory === "pressreleases" ? "press" :
    rawCategory

  return {
    id: String(item.id || ""),
    url: String(item.url || ""),
    label: String(item.label || ""),
    enabled: Boolean(item.enabled ?? true),
    category: ["news", "filing", "press"].includes(category) ? category : "news",
  }
}

export async function getFeedSources(userId = getPersistedUserId()) {
  const query = new URLSearchParams()
  query.set("user_id", userId)
  const response = await request(`/api/feed-sources?${query.toString()}`)
  const sources = Array.isArray(response?.sources) ? response.sources : []
  return sources.map(mapFeedSource)
}

export async function createFeedSource(payload) {
  const response = await request("/api/feed-sources", {
    method: "POST",
    body: JSON.stringify({
      user_id: payload.user_id ?? getPersistedUserId(),
      url: payload.url,
      label: payload.label ?? "",
      enabled: payload.enabled ?? true,
      category: payload.category ?? "news",
    }),
  })
  return mapFeedSource(response)
}

export async function updateFeedSource(sourceId, payload) {
  const response = await request(`/api/feed-sources/${encodeURIComponent(sourceId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      user_id: payload.user_id ?? getPersistedUserId(),
      ...(payload.url !== undefined ? { url: payload.url } : {}),
      ...(payload.label !== undefined ? { label: payload.label } : {}),
      ...(payload.enabled !== undefined ? { enabled: payload.enabled } : {}),
      ...(payload.category !== undefined ? { category: payload.category } : {}),
    }),
  })
  return mapFeedSource(response)
}

export async function deleteFeedSource(sourceId, userId = getPersistedUserId()) {
  const query = new URLSearchParams()
  query.set("user_id", userId)
  query.set("source_id", sourceId)
  const response = await request(`/api/feed-sources?${query.toString()}`, {
    method: "DELETE",
  })
  const sources = Array.isArray(response?.sources) ? response.sources : []
  return sources.map(mapFeedSource)
}

export async function exportFeedSources(userId = getPersistedUserId()) {
  const query = new URLSearchParams()
  query.set("user_id", userId)
  return requestBlob(`/api/feed-sources/export?${query.toString()}`)
}

// ── Watchlist ────────────────────────────────────────────────────────────────

function buildWatchlistKeywordsFromCompanies(companies = []) {
  const seen = new Set()
  const keywords = []

  for (const company of companies) {
    const extraKeywords = Array.isArray(company?.keywords)
      ? company.keywords
      : String(company?.keywords || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)

    const candidates = [company?.name, company?.symbol, ...extraKeywords]
    for (const value of candidates) {
      const cleaned = String(value || "").trim()
      if (!cleaned) continue
      const marker = cleaned.toLowerCase()
      if (seen.has(marker)) continue
      seen.add(marker)
      keywords.push(cleaned)
    }
  }

  return keywords
}

export async function saveWatchlistKeywords(keywords, userId = getPersistedUserId()) {
  return request("/api/watchlist", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      keywords,
    }),
  })
}

async function syncWatchlistFromCompanies(companies = [], userId = getPersistedUserId()) {
  const keywords = buildWatchlistKeywordsFromCompanies(companies)
  await saveWatchlistKeywords(keywords, userId)
}

function withCompanyIds(companies = []) {
  return companies.map((company, index) => ({
    id: String(company?.id || `seed-${index + 1}`),
    name: String(company?.name || "").trim(),
    symbol: String(company?.symbol || "").trim() || undefined,
    avatarUrl: company?.avatarUrl ? String(company.avatarUrl) : null,
    keywords: Array.isArray(company?.keywords)
      ? company.keywords.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
  }))
}

function bootstrapCompaniesIfEmpty(companies = []) {
  if (Array.isArray(companies) && companies.length > 0) {
    return withCompanyIds(companies)
  }
  return withCompanyIds(DEFAULT_COMPANIES)
}

function normalizeCompanyKey(name = "", symbol = "") {
  const normalizedSymbol = String(symbol || "").trim().toLowerCase()
  if (normalizedSymbol) return `symbol:${normalizedSymbol}`

  const normalizedName = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return `name:${normalizedName}`
}

function mergeCompaniesWithDefaults(companies = []) {
  const current = withCompanyIds(Array.isArray(companies) ? companies : [])
  const defaults = withCompanyIds(DEFAULT_COMPANIES)

  const byKey = new Map()
  for (const company of current) {
    byKey.set(normalizeCompanyKey(company.name, company.symbol), company)
  }

  for (const preset of defaults) {
    const key = normalizeCompanyKey(preset.name, preset.symbol)
    const existing = byKey.get(key)

    if (!existing) {
      byKey.set(key, preset)
      continue
    }

    const mergedKeywords = Array.from(
      new Set([...(existing.keywords || []), ...(preset.keywords || [])].map((item) => String(item || "").trim()).filter(Boolean))
    )

    byKey.set(key, {
      ...existing,
      name: existing.name || preset.name,
      symbol: existing.symbol || preset.symbol,
      avatarUrl: existing.avatarUrl || preset.avatarUrl || null,
      keywords: mergedKeywords,
    })
  }

  return Array.from(byKey.values())
}

// ── Companies ─────────────────────────────────────────────────────────────────


// Mocked getCompanies for offline development
export function getCompanies() {
  const key = "trackr_mock_companies";
  let companies = [];
  try {
    companies = JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    companies = [];
  }

  companies = mergeCompaniesWithDefaults(bootstrapCompaniesIfEmpty(companies))
  localStorage.setItem(key, JSON.stringify(companies))

  // Keep backend keyword scan list aligned to company name + ticker.
  syncWatchlistFromCompanies(companies).catch(() => {})
  return Promise.resolve(companies)
}


// Mocked addCompany for offline development
export async function addCompany(company) {
  const key = "trackr_mock_companies";
  let companies = [];
  try {
    companies = JSON.parse(localStorage.getItem(key)) || [];
  } catch {}
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const created = { ...company, id };
  companies.push(created);
  localStorage.setItem(key, JSON.stringify(companies));

  try {
    await syncWatchlistFromCompanies(companies)
  } catch {
    // Keep local add successful even if backend sync is temporarily unavailable.
  }

  return created
}


// Mocked removeCompany for offline development
export async function removeCompany(id) {
  const key = "trackr_mock_companies";
  let companies = [];
  try {
    companies = JSON.parse(localStorage.getItem(key)) || [];
  } catch {}
  companies = companies.filter((c) => c.id !== id);
  localStorage.setItem(key, JSON.stringify(companies));

  try {
    await syncWatchlistFromCompanies(companies)
  } catch {
    // Keep local remove successful even if backend sync is temporarily unavailable.
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function getSettings() {
  return request("/api/settings")
}

export function saveSettings(settings) {
  return request("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  })
}
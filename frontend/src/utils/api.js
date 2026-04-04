const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:9696"
const DEFAULT_USER_ID = import.meta.env.VITE_USER_ID ?? "u1"

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

  const response = await request(`/api/feed?${query.toString()}`)
  const items = Array.isArray(response?.items) ? response.items : []
  return items.map(mapBackendItemToFeedItem)
}

// ── Companies ─────────────────────────────────────────────────────────────────


// Mocked getCompanies for offline development
export function getCompanies() {
  const key = "trackr_mock_companies";
  try {
    return Promise.resolve(JSON.parse(localStorage.getItem(key)) || []);
  } catch {
    return Promise.resolve([]);
  }
}


// Mocked addCompany for offline development
export function addCompany(company) {
  const key = "trackr_mock_companies";
  let companies = [];
  try {
    companies = JSON.parse(localStorage.getItem(key)) || [];
  } catch {}
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const created = { ...company, id };
  companies.push(created);
  localStorage.setItem(key, JSON.stringify(companies));
  return Promise.resolve(created);
}


// Mocked removeCompany for offline development
export function removeCompany(id) {
  const key = "trackr_mock_companies";
  let companies = [];
  try {
    companies = JSON.parse(localStorage.getItem(key)) || [];
  } catch {}
  companies = companies.filter((c) => c.id !== id);
  localStorage.setItem(key, JSON.stringify(companies));
  return Promise.resolve();
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
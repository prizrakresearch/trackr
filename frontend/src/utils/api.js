const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

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


// Mocked getFeed for offline development
export function getFeed(params = {}) {
  // Optionally, you can filter by params, but for now return all
  const key = "trackr_mock_feed";
  try {
    const feed = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(feed)) {
      return Promise.resolve(feed);
    }
  } catch {}
  // Fallback: static mock data
  return Promise.resolve([
    {
      id: "1",
      company_id: "mock1",
      title: "Welcome to Trackr!",
      type: "info",
      date: new Date().toISOString(),
      content: "This is a mock feed item. Your real feed will appear here when the backend is connected.",
    },
  ]);
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
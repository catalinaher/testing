// API helper
// - On Vercel: use relative /api routes (serverless functions)
// - Locally with Live Server: keep a backend running at http://localhost:3000

const IS_LOCAL_STATIC = location.hostname === "127.0.0.1" || location.hostname === "localhost";
const API_BASE = IS_LOCAL_STATIC ? "http://localhost:3000/api" : "/api";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed: ${res.status} ${msg}`);
  }
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`POST ${path} failed: ${res.status} ${msg}`);
  }
  return res.json();
}

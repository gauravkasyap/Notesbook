// src/services/api.js
const API_URL = "http://localhost:5000"; // your local backend
const ZENODO_API_KEY = "Gy38t2FYDvn68mSZAN0k1dU68qQJRmvu5sOeQjGDNcpZHewaxn6iRbLntDJn";
const ZENODO_BASE = "https://zenodo.org/api/records";

/* ---------- helpers ---------- */
function dedupe(arr, keyFn = (x) => x.id || x._id || x.pdfUrl || `${x.title}-${x.userId}`) {
  const seen = new Set();
  const out = [];
  for (const item of arr || []) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function normalizeLocalNote(n) {
  return {
    id: n._id || n.id,
    title: n.title || "Untitled",
    description: n.description || "",
    upload_date: n.createdAt || n.upload_date || null,
    language: n.language || "English",
    pdfUrl: n.pdfUrl,
    userId: n.userId,
    price: n.price ?? 0,
    isFree: !!(n.isFree === true || n.price === undefined || Number(n.price) === 0),
    likes: n.likes || 0,
    source: "local",
    raw: n,
  };
}

function normalizeZenodoHit(hit) {
  // pick a PDF file if available
  const files = Array.isArray(hit.files) ? hit.files : [];
  const pdfFile =
    files.find(
      (f) =>
        (f.type && f.type.toLowerCase().includes("pdf")) ||
        (f.key && f.key.toLowerCase().endsWith(".pdf")) ||
        (f.filename && f.filename.toLowerCase().endsWith(".pdf"))
    ) || files[0] || null;

  const pdfUrl = pdfFile?.links?.self || pdfFile?.links?.download || null;

  return {
    id: String(hit.id),
    title: hit.metadata?.title || "Untitled",
    description: hit.metadata?.description || "",
    upload_date: hit.metadata?.publication_date || hit.created || null,
    language: hit.metadata?.language || "Unknown",
    pdfUrl,
    userId: hit.owner || "zenodo",
    price: 0,
    isFree: true,
    likes: 0,
    source: "zenodo",
    raw: hit,
  };
}

/* ---------- Zenodo functions (client-side) ---------- */
/* NOTE: Zenodo CORS can block client-side requests. If you see CORS errors,
   implement a server-side proxy (/api/zenodo/search) and call that instead. */
export async function searchZenodo(query, limit = 8) {
  if (!query || !query.trim()) return [];
  try {
    const url = `${ZENODO_BASE}?access_token=${ZENODO_API_KEY}&q=${encodeURIComponent(query)}&size=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      // return empty instead of throwing so caller can fallback
      console.warn("Zenodo search failed", res.status, await res.text().catch(()=>""));
      return [];
    }
    const json = await res.json();
    const hits = json.hits?.hits || [];
    return hits.map(normalizeZenodoHit);
  } catch (err) {
    console.warn("Zenodo search error", err);
    return [];
  }
}

export async function getPopularNotes(limit = 10) {
  try {
    const url = `${ZENODO_BASE}?access_token=${ZENODO_API_KEY}&sort=mostviewed&size=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Zenodo getPopular failed", res.status, await res.text().catch(()=>""));
      return [];
    }
    const json = await res.json();
    const hits = json.hits?.hits || [];
    return hits.map(normalizeZenodoHit);
  } catch (err) {
    console.warn("Zenodo getPopular error", err);
    return [];
  }
}

/* ---------- Local backend helper ---------- */
export async function searchLocalBackend(query, limit = 50) {
  if (!query || !query.trim()) return [];
  try {
    const url = `${API_URL}/api/notes?${new URLSearchParams({ q: query, limit }).toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Local backend search failed", res.status, await res.text().catch(()=>""));
      return [];
    }
    const json = await res.json();
    if (!Array.isArray(json)) return [];
    return json.map(normalizeLocalNote);
  } catch (err) {
    console.warn("Local backend search error", err);
    return [];
  }
}

/* ---------- Merged search (public function used by pages) ---------- */
/**
 * searchNotes(query, opts)
 * queries both local backend and Zenodo in parallel, merges and dedupes results
 * returns normalized note objects (source, isFree, price, etc.)
 */
export async function searchNotes(query, opts = {}) {
  const limit = opts.limit ?? 50;
  if (!query || !query.trim()) return [];

  // run both in parallel and tolerate failures
  const [local, zenodo] = await Promise.allSettled([
    searchLocalBackend(query, limit),
    searchZenodo(query, Math.min(12, limit)),
  ]);

  const localResults = local.status === "fulfilled" ? local.value : [];
  const zenodoResults = zenodo.status === "fulfilled" ? zenodo.value : [];

  // prefer local first, then zenodo, then dedupe
  const merged = dedupe([...localResults, ...zenodoResults], (x) => x.id || x.pdfUrl || `${x.title}-${x.userId}`);
  return merged.slice(0, limit);
}

/* ---------- Suggestions helper (lightweight) ---------- */
export async function suggestNotes(query, opts = {}) {
  const limit = opts.limit ?? 8;
  if (!query || !query.trim()) return [];
  // Use the merged search but smaller limit and map to suggestion shape
  try {
    const results = await searchNotes(query, { limit });
    return results.map((n) => ({
      id: n.id,
      title: n.title,
      snippet: (n.description || "").slice(0, 120),
      isFree: !!n.isFree,
      price: n.price ?? 0,
      source: n.source,
      pdfUrl: n.pdfUrl,
    }));
  } catch (err) {
    console.warn("suggestNotes error", err);
    return [];
  }
}

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const usernameFilter = document.getElementById("usernameFilter");
const refreshBtn = document.getElementById("refreshBtn");

function stars(rating) {
  const n = Number(rating);
  if (!n) return "";
  return `★ ${n}/5`;
}

function renderReview(r) {
  const title = r.artist_name || "Unknown Artist";
  const metaParts = [r.venue_name, r.event_date].filter(Boolean);
  const meta = metaParts.join(" • " );
  const user = r.username ? `by ${r.username}` : "";

  return `
    <div class="reviewCard">
      <h3>${title}</h3>
      <div class="meta">${meta}</div>
      <div class="meta">${user}</div>
      <div class="stars">${stars(r.rating)}</div>
      <div class="text">${(r.review_text || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</div>
    </div>
  `;
}

async function load() {
  empty.textContent = "Loading…";
  grid.innerHTML = "";

  const filter = (usernameFilter.value || "").trim().toLowerCase();

  try {
    let data = await apiGet("/reviews");
    if (filter) {
      data = data.filter((r) => String(r.username || "").toLowerCase() === filter);
    }

    grid.innerHTML = data.map(renderReview).join("");
    count.textContent = `${data.length} review(s)`;
    empty.textContent = data.length ? "" : "No reviews yet. Post one from Explore!";
  } catch (err) {
    console.error(err);
    empty.textContent = "Couldn’t load reviews. Check that your Vercel env vars + Supabase table exist.";
  }
}

// Prefill the filter with whatever username the user last used
const saved = localStorage.getItem("consee_username");
if (saved) usernameFilter.value = saved;

refreshBtn.addEventListener("click", load);
usernameFilter.addEventListener("change", load);

load();

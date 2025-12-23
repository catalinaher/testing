const eventsDiv = document.getElementById("events");
const reviewsDiv = document.getElementById("reviews");
const form = document.getElementById("searchForm");

const nearbyForm = document.getElementById("nearbyForm");
const nearbyEventsDiv = document.getElementById("nearbyEvents");

function loadFeaturedSlides() {
  const slides = [
    { artist: "Taylor Swift", venue: "Stadium Tour", city: "Various", date: "2025" },
    { artist: "Bad Bunny", venue: "Arena Night", city: "Chicago", date: "2025" },
    { artist: "Billie Eilish", venue: "World Tour", city: "Minneapolis", date: "2025" }
  ];

  const container = document.getElementById("featuredSlides");
  if (!container) return;

  container.innerHTML = slides.map(s => `
    <div class="swiper-slide">
      <div class="slideCard">
        <div class="slideTitle">${s.artist}</div>
        <div class="slideMeta">${s.venue} • ${s.city} • ${s.date}</div>
      </div>
    </div>
  `).join("");

  new Swiper("#featuredSwiper", {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 12,
    pagination: { el: ".swiper-pagination" },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
  });
}

function renderEvent(e) {
  const link = e.url ? `<a href="${e.url}" target="_blank" rel="noreferrer" class="small">Open</a>` : "";
  return `
    <div class="item">
      <div class="row">
        <strong>${e.artist}</strong>
        <span class="badge">${e.date || "Unknown date"}</span>
      </div>
      <div class="small">${e.venue || ""} — ${e.city || ""}</div>
      ${link}
    </div>
  `;
}

function renderReview(r) {
  const user = r.username ? ` • ${r.username}` : "";
  return `
    <div class="item">
      <div class="row">
        <strong>${r.artist_name}</strong>
        <span class="badge">★ ${r.rating}/5${user}</span>
      </div>
      <div class="small">${r.venue_name || ""} — ${r.event_date || ""}</div>
      <div style="margin-top:8px;">${(r.review_text || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</div>
    </div>
  `;
}

let chartInstance = null;

function buildRatingsChart(reviews) {
  const ctx = document.getElementById("ratingsChart");
  if (!ctx || typeof Chart === "undefined") return;

  const counts = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const rating = Number(r.rating);
    if (rating >= 1 && rating <= 5) counts[rating - 1]++;
  }

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["1", "2", "3", "4", "5"],
      datasets: [{ label: "Number of Reviews", data: counts }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

async function loadRecentReviews() {
  reviewsDiv.innerHTML = `<div class="small">Loading…</div>`;
  try {
    const data = await apiGet("/reviews");
    reviewsDiv.innerHTML = data.map(renderReview).join("") || `<div class="small">No reviews yet.</div>`;
    buildRatingsChart(data);
  } catch (err) {
    console.error(err);
    reviewsDiv.innerHTML = `<div class="small">Couldn’t load reviews. Check Vercel env vars + Supabase table.</div>`;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const artist = document.getElementById("artist").value.trim();
  const location = document.getElementById("location").value.trim();

  eventsDiv.innerHTML = `<div class="small">Searching…</div>`;
  try {
    const results = await apiGet(`/events/search?artist=${encodeURIComponent(artist)}&location=${encodeURIComponent(location)}`);
    eventsDiv.innerHTML = results.map(renderEvent).join("") || `<div class="small">No events found.</div>`;
  } catch (err) {
    console.error(err);
    eventsDiv.innerHTML = `<div class="small">Search failed. Check your Bandsintown settings.</div>`;
  }
});

if (nearbyForm) {
  nearbyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    nearbyEventsDiv.innerHTML = `<div class="small">Loading…</div>`;

    const city = document.getElementById("nearbyCity").value.trim();
    const postalCode = document.getElementById("nearbyZip").value.trim();

    try {
      const resp = await apiGet(`/events/nearby?city=${encodeURIComponent(city)}&postalCode=${encodeURIComponent(postalCode)}`);
      const results = resp.results || [];
      if (resp.note) {
        nearbyEventsDiv.innerHTML = `<div class="small">${resp.note}</div>`;
        return;
      }
      nearbyEventsDiv.innerHTML = results.map(renderEvent).join("") || `<div class="small">No nearby concerts found.</div>`;
    } catch (err) {
      console.error(err);
      nearbyEventsDiv.innerHTML = `<div class="small">Nearby lookup failed. Did you set TICKETMASTER_API_KEY?</div>`;
    }
  });
}

loadFeaturedSlides();
loadRecentReviews();

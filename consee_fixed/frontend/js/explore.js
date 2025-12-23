const xForm = document.getElementById("exploreSearch");
const xEvents = document.getElementById("xEvents");

const reviewForm = document.getElementById("reviewForm");
const statusDiv = document.getElementById("reviewStatus");

function renderClickableEvent(ev) {
  // Store the event payload safely in a data attribute
  const payload = encodeURIComponent(JSON.stringify(ev));
  return `
    <div class="item" style="cursor:pointer" data-payload="${payload}">
      <div class="row">
        <strong>${ev.artist}</strong>
        <span class="badge">${ev.date || "Unknown date"}</span>
      </div>
      <div class="small">${ev.venue || ""} — ${ev.city || ""}</div>
      <div class="small">Click to review</div>
    </div>
  `;
}

xForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const artist = document.getElementById("xArtist").value.trim();
  const location = document.getElementById("xLocation").value.trim();

  if (!artist) {
    xEvents.innerHTML = `<div class="small">Please enter an artist name.</div>`;
    return;
  }

  xEvents.innerHTML = `<div class="small">Searching…</div>`;

  try {
    const results = await apiGet(
      `/events/search?artist=${encodeURIComponent(artist)}&location=${encodeURIComponent(location)}`
    );

    xEvents.innerHTML =
      results.map(renderClickableEvent).join("") || `<div class="small">No events found.</div>`;
  } catch (err) {
    xEvents.innerHTML = `<div class="small">Search failed. Check your API settings.</div>`;
    console.error(err);
  }
});

xEvents.addEventListener("click", (e) => {
  const item = e.target.closest(".item");
  if (!item) return;

  try {
    const payload = JSON.parse(decodeURIComponent(item.dataset.payload));

    document.getElementById("eventId").value = payload.eventId || "";
    document.getElementById("artistName").value = payload.artist || "";
    document.getElementById("venueName").value = payload.venue || "";
    document.getElementById("eventDate").value = payload.date || "";

    // Gentle UX: scroll to the review form on click
    reviewForm.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    console.error(err);
  }
});

reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusDiv.textContent = "Posting…";

  try {
    const username = document.getElementById("username").value.trim();
    if (!username) {
      statusDiv.textContent = "Please enter a username.";
      return;
    }

    const body = {
      username,
      artist_name: document.getElementById("artistName").value,
      venue_name: document.getElementById("venueName").value,
      event_date: document.getElementById("eventDate").value,
      event_id: document.getElementById("eventId").value,
      rating: Number(document.getElementById("rating").value),
      review_text: document.getElementById("reviewText").value
    };

    await apiPost("/reviews", body);

    // Save username for Journal filtering
    localStorage.setItem("consee_username", username);

    statusDiv.textContent = "✅ Review posted!";
    reviewForm.reset();
  } catch (err) {
    console.error(err);
    statusDiv.textContent = "❌ Post failed. Check Vercel env vars + Supabase table.";
  }
});

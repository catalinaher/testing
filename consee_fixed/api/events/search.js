module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const artist = (req.query.artist || "").trim();
  const location = (req.query.location || "").trim().toLowerCase();
  if (!artist) return res.status(400).json({ error: "artist is required" });

  try {
    const appId = process.env.BANDSINTOWN_APP_ID || "consee";
    const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(artist)}/events?app_id=${encodeURIComponent(appId)}`;

    const r = await fetch(url, { headers: { Accept: "application/json" } });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({
        error: "Bandsintown request failed",
        status: r.status,
        statusText: r.statusText,
        url,
        bodyPreview: text.slice(0, 500)
      });
    }

    const data = await r.json();

    const results = (Array.isArray(data) ? data : [])
      .map((ev) => {
        const city = ev?.venue?.city || "";
        const region = ev?.venue?.region || "";
        const country = ev?.venue?.country || "";
        const cityText = [city, region, country].filter(Boolean).join(", ");

        return {
          source: "bandsintown",
          eventId: `bandsintown_${ev?.id ?? ""}`,
          artist,
          venue: ev?.venue?.name || "",
          city: cityText,
          date: ev?.datetime ? String(ev.datetime).slice(0, 10) : "",
          url: ev?.url || ""
        };
      })
      .filter((ev) => {
        if (!location) return true;
        return (ev.city || "").toLowerCase().includes(location);
      });

    results.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ error: "Server failed to fetch events" });
  }
};

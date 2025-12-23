module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ results: [], note: "Set TICKETMASTER_API_KEY in Vercel to enable nearby concerts." });
  }

  const city = String(req.query.city || "").trim();
  const postalCode = String(req.query.postalCode || "").trim();
  const radius = String(req.query.radius || "50").trim();
  const unit = String(req.query.unit || "miles").trim();

  try {
    const qs = new URLSearchParams({
      apikey: apiKey,
      size: "12",
      classificationName: "music",
      sort: "date,asc",
      radius,
      unit
    });

    if (postalCode) qs.set("postalCode", postalCode);
    if (city) qs.set("city", city);

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${qs.toString()}`;
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: "Ticketmaster request failed", status: r.status, bodyPreview: text.slice(0, 500) });
    }

    const json = await r.json();
    const events = (json && json._embedded && json._embedded.events) ? json._embedded.events : [];

    const results = events.map((ev) => {
      const venue = ev && ev._embedded && ev._embedded.venues ? ev._embedded.venues[0] : null;
      const cityText = [venue?.city?.name, venue?.state?.stateCode].filter(Boolean).join(", ");
      return {
        source: "ticketmaster",
        eventId: `ticketmaster_${ev?.id || ""}`,
        artist: ev?.name || "",
        venue: venue?.name || "",
        city: cityText,
        date: ev?.dates?.start?.localDate || "",
        url: ev?.url || ""
      };
    });

    return res.status(200).json({ results });
  } catch (e) {
    return res.status(500).json({ error: "Server failed to fetch nearby concerts" });
  }
};

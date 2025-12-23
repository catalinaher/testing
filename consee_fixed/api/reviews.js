const { getSupabase } = require("./_supabase");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  let supabase;
  try {
    supabase = getSupabase();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      const payload = {
        artist_name: body.artist_name ?? null,
        venue_name: body.venue_name ?? null,
        event_date: body.event_date ?? null,
        event_id: body.event_id ?? null,
        rating: body.rating ?? null,
        review_text: body.review_text ?? null,
        username: body.username ?? null
      };

      const { data, error } = await supabase.from("reviews").insert([payload]).select();
      if (error) return res.status(500).json({ error: error.message });

      return res.status(200).json((data && data[0]) ? data[0] : payload);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

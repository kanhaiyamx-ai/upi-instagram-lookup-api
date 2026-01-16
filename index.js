import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ================= INSTAGRAM LOOKUP (PURE PROXY) ================= */
app.get("/api/instagram", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "username_required" });
  }

  try {
    const upstreamUrl =
      "http://osintx.site/insta.php/info?username=" +
      encodeURIComponent(username);

    const response = await axios.get(upstreamUrl, {
      timeout: 15000,
      responseType: "text",        // 🔥 IMPORTANT
      validateStatus: () => true,  // 🔥 NEVER THROW
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    // Forward EXACT upstream response
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(response.data);

  } catch (err) {
    return res.status(500).json({
      error: "proxy_error"
    });
  }
});

/* ================= IMAGE PROXY ================= */
app.get("/api/image-proxy", async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).send("Missing image URL");
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "image/*"
      }
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(response.data);

  } catch {
    return res.status(500).send("Image fetch failed");
  }
});

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= START ================= */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ================= INSTAGRAM LOOKUP ================= */
app.get("/api/instagram", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "username_required" });
  }

  try {
    const apiUrl = `http://osintx.site/insta.php/info?username=${encodeURIComponent(username)}`;

    const response = await axios.get(apiUrl, {
      timeout: 15000,
      validateStatus: () => true, // 🔥 IMPORTANT: do NOT throw on 400/404
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    // If upstream returns usable data → forward it
    if (response.data && response.data.username) {
      return res.json(response.data);
    }

    // If upstream explicitly says error
    if (response.data && response.data.error) {
      return res.status(404).json({
        error: "user_not_found"
      });
    }

    // Fallback
    return res.status(404).json({
      error: "user_not_found"
    });

  } catch (err) {
    return res.status(500).json({
      error: "server_error"
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
    res.send(response.data);

  } catch {
    res.status(500).send("Image fetch failed");
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

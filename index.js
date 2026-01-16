import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*",
  methods: ["GET"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ================= INSTAGRAM LOOKUP ================= */
app.get("/api/instagram", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        error: "username_required"
      });
    }

    const apiUrl = `http://osintx.site/insta.php/info?username=${username}`;
    const response = await axios.get(apiUrl, {
      timeout: 15000
    });

    return res.json(response.data);

  } catch (error) {
    return res.status(500).json({
      error: "http_error",
      message: error.message
    });
  }
});

/* ================= IMAGE PROXY (FIXES PROFILE PIC) ================= */
app.get("/api/image-proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.status(400).send("Missing image URL");
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "image/*"
      },
      timeout: 15000
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(response.data);

  } catch (error) {
    res.status(500).send("Image fetch failed");
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({
    status: "UP",
    service: "UPI + Instagram Lookup API"
  });
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

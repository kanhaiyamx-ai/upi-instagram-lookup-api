import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

// Home
app.get('/', (req, res) => {
  res.send('UPI & Instagram Lookup API running 🚀 | @KILL4R_UR')
})

/* =========================
   🔥 UPI LOOKUP API
   ========================= */
app.get('/api/upi', async (req, res) => {
  const vpa = req.query.vpa

  if (!vpa) {
    return res.status(400).json({ error: 'Missing vpa parameter' })
  }

  try {
    const response = await fetch(
      `https://osintx.site/upi-info.php?vpa=${encodeURIComponent(vpa)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )

    const data = await response.text()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.type('json').send(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch UPI info' })
  }
})

/* =========================
   🔥 INSTAGRAM LOOKUP API
   ========================= */
app.get('/api/instagram', async (req, res) => {
  const username = req.query.username

  if (!username) {
    return res.status(400).json({ error: 'Missing username parameter' })
  }

  try {
    const response = await fetch(
      `http://osintx.site/insta.php/info?username=${encodeURIComponent(username)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )

    const data = await response.text()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.type('json').send(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Instagram data' })
  }
})

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

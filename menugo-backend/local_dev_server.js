const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

const UPLOADS_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g,'')}`
    cb(null, unique)
  }
})

const upload = multer({ storage })

const app = express()
app.use(cors())
app.use(express.json())

// Serve uploads statically
app.use('/uploads', express.static(UPLOADS_DIR))

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Minimal notifications endpoint so frontend polling doesn't flood console
app.get('/api/notifications', (req, res) => {
  return res.json({ data: [], total: 0 })
})

// Upload endpoint used by frontend when backend is unavailable
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const host = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`
  const url = `${host.replace(/\/$/, '')}/uploads/${req.file.filename}`
  return res.json({ data: { url } })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Local dev API listening on http://localhost:${port}`))

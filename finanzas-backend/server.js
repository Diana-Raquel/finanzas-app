const express  = require("express");
const cors     = require("cors");
const multer   = require("multer");
const path     = require("path");
const db       = require("./database");

const app  = express();
const PORT = 3001;

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Multer (subida de imágenes) ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ════════════════════════════════════════════════════════════
//  RUTAS — ENTRADAS
// ════════════════════════════════════════════════════════════

// GET /api/entradas — obtener todas las entradas
app.get("/api/entradas", (req, res) => {
  db.query("SELECT * FROM entradas ORDER BY fecha DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/entradas — registrar nueva entrada
app.post("/api/entradas", upload.single("factura"), (req, res) => {
  const { tipo, monto, fecha } = req.body;
  const factura = req.file ? `/uploads/${req.file.filename}` : null;

  if (!tipo || !monto || !fecha)
    return res.status(400).json({ error: "Faltan campos obligatorios" });

  db.query(
    "INSERT INTO entradas (tipo, monto, fecha, factura) VALUES (?, ?, ?, ?)",
    [tipo, monto, fecha, factura],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, tipo, monto, fecha, factura });
    }
  );
});

// DELETE /api/entradas/:id — eliminar entrada
app.delete("/api/entradas/:id", (req, res) => {
  db.query("DELETE FROM entradas WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Entrada eliminada" });
  });
});

// ════════════════════════════════════════════════════════════
//  RUTAS — SALIDAS
// ════════════════════════════════════════════════════════════

// GET /api/salidas — obtener todas las salidas
app.get("/api/salidas", (req, res) => {
  db.query("SELECT * FROM salidas ORDER BY fecha DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/salidas — registrar nueva salida
app.post("/api/salidas", upload.single("factura"), (req, res) => {
  const { tipo, monto, fecha } = req.body;
  const factura = req.file ? `/uploads/${req.file.filename}` : null;

  if (!tipo || !monto || !fecha)
    return res.status(400).json({ error: "Faltan campos obligatorios" });

  db.query(
    "INSERT INTO salidas (tipo, monto, fecha, factura) VALUES (?, ?, ?, ?)",
    [tipo, monto, fecha, factura],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, tipo, monto, fecha, factura });
    }
  );
});

// DELETE /api/salidas/:id — eliminar salida
app.delete("/api/salidas/:id", (req, res) => {
  db.query("DELETE FROM salidas WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Salida eliminada" });
  });
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

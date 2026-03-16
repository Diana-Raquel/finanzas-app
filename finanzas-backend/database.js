const mysql = require("mysql2");

const db = mysql.createConnection({
  host:     "localhost",
  user:     "root",        // cambia por tu usuario de MySQL
  password: "Najarro_21*09...",            // cambia por tu contraseña de MySQL
  database: "finanzas_db"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err.message);
    process.exit(1);
  }
  console.log("✅ Conectado a MySQL correctamente");
});

module.exports = db;

import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getEntradas, getSalidas, createEntrada, createSalida } from "./api";

// ─── Colores y estilos globales ───────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0b0f1a; color: #e8e6df; }

  :root {
    --bg:       #0b0f1a;
    --surface:  #131929;
    --card:     #192035;
    --border:   #253050;
    --accent:   #4f8ef7;
    --green:    #3ecf8e;
    --red:      #f76f6f;
    --muted:    #8492b0;
    --text:     #e8e6df;
    --heading:  'DM Serif Display', serif;
  }

  .app { min-height: 100vh; background: var(--bg); }

  /* ── LOGIN ── */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at 60% 40%, #1a2545 0%, #0b0f1a 70%);
  }
  .login-box {
    width: 380px; background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 48px 40px; box-shadow: 0 24px 80px #0007;
  }
  .login-logo { font-family: var(--heading); font-size: 2rem; color: var(--accent); margin-bottom: 8px; }
  .login-sub  { color: var(--muted); font-size: .85rem; margin-bottom: 36px; }
  .field { margin-bottom: 20px; }
  .field label { display: block; font-size: .78rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
  .field input {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; color: var(--text); font-size: .95rem;
    outline: none; transition: border-color .2s;
  }
  .field input:focus { border-color: var(--accent); }
  .btn-primary {
    width: 100%; background: var(--accent); color: #fff; border: none;
    border-radius: 10px; padding: 13px; font-size: .95rem; font-weight: 600;
    cursor: pointer; transition: opacity .2s, transform .1s;
  }
  .btn-primary:hover  { opacity: .88; }
  .btn-primary:active { transform: scale(.98); }
  .error-msg { color: var(--red); font-size: .82rem; margin-top: 12px; text-align: center; }

  /* ── LAYOUT ── */
  .layout { display: flex; min-height: 100vh; }
  .sidebar {
    width: 240px; background: var(--surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 32px 0; flex-shrink: 0;
  }
  .sidebar-logo { font-family: var(--heading); font-size: 1.5rem; color: var(--accent); padding: 0 28px 32px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 28px;
    color: var(--muted); font-size: .9rem; font-weight: 500; cursor: pointer;
    border-left: 3px solid transparent; transition: all .15s;
  }
  .nav-item:hover { color: var(--text); background: #ffffff08; }
  .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: #4f8ef712; }
  .nav-icon { font-size: 1.1rem; width: 20px; text-align: center; }
  .sidebar-footer { margin-top: auto; padding: 0 28px; }
  .logout-btn {
    width: 100%; background: transparent; border: 1px solid var(--border);
    border-radius: 8px; padding: 10px; color: var(--muted); font-size: .85rem;
    cursor: pointer; transition: all .15s;
  }
  .logout-btn:hover { border-color: var(--red); color: var(--red); }

  .main { flex: 1; overflow-y: auto; padding: 40px 48px; }
  .page-title { font-family: var(--heading); font-size: 2rem; margin-bottom: 8px; }
  .page-sub   { color: var(--muted); font-size: .88rem; margin-bottom: 32px; }

  /* ── DASHBOARD CARDS ── */
  .stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-bottom: 36px; }
  .stat-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    padding: 24px 28px;
  }
  .stat-label { font-size: .78rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; }
  .stat-value { font-family: var(--heading); font-size: 2rem; }
  .stat-value.green { color: var(--green); }
  .stat-value.red   { color: var(--red); }
  .stat-value.blue  { color: var(--accent); }

  /* ── FORM ── */
  .form-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 36px 40px; max-width: 600px;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .form-grid .full { grid-column: 1/-1; }
  .field select {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; color: var(--text); font-size: .95rem;
    outline: none; cursor: pointer;
  }
  .upload-zone {
    border: 2px dashed var(--border); border-radius: 10px; padding: 28px;
    text-align: center; cursor: pointer; transition: border-color .2s;
  }
  .upload-zone:hover { border-color: var(--accent); }
  .upload-zone p { color: var(--muted); font-size: .85rem; margin-top: 8px; }
  .upload-preview { width: 100%; border-radius: 8px; margin-top: 10px; max-height: 160px; object-fit: cover; }
  .submit-row { margin-top: 28px; display: flex; gap: 12px; }
  .btn-secondary {
    background: transparent; border: 1px solid var(--border); border-radius: 10px;
    padding: 12px 24px; color: var(--muted); font-size: .9rem; cursor: pointer;
    transition: all .15s;
  }
  .btn-secondary:hover { border-color: var(--text); color: var(--text); }
  .success-banner {
    background: #3ecf8e18; border: 1px solid #3ecf8e44; color: var(--green);
    border-radius: 10px; padding: 14px 20px; margin-bottom: 24px; font-size: .9rem;
  }

  /* ── TABLE ── */
  .table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
  .table-header { padding: 24px 28px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .table-title { font-weight: 600; font-size: 1rem; }
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; padding: 14px 20px; font-size: .75rem; font-weight: 600;
    color: var(--muted); text-transform: uppercase; letter-spacing: .08em;
    border-bottom: 1px solid var(--border); background: var(--surface);
  }
  td { padding: 16px 20px; font-size: .88rem; border-bottom: 1px solid #ffffff08; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #ffffff04; }
  .badge {
    display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: .75rem; font-weight: 600;
  }
  .badge-green { background: #3ecf8e20; color: var(--green); }
  .badge-red   { background: #f76f6f20; color: var(--red);   }
  .img-thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; cursor: pointer; }
  .img-modal-overlay {
    position: fixed; inset: 0; background: #000a; display: flex;
    align-items: center; justify-content: center; z-index: 999;
  }
  .img-modal-overlay img { max-width: 90vw; max-height: 85vh; border-radius: 12px; }

  /* ── BALANCE ── */
  .balance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .balance-table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
  .balance-table-title { padding: 18px 24px; font-weight: 600; border-bottom: 1px solid var(--border); }
  .balance-total { padding: 14px 24px; font-weight: 700; border-top: 1px solid var(--border); display: flex; justify-content: space-between; }
  .balance-result {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    padding: 28px 32px; margin-bottom: 32px; display: flex; align-items: center; gap: 20px;
  }
  .balance-result-label { color: var(--muted); font-size: .85rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; }
  .balance-result-value { font-family: var(--heading); font-size: 2.4rem; }
  .chart-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 32px; }
  .chart-title { font-weight: 600; margin-bottom: 20px; }
  .pie-svg { display: block; margin: 0 auto; }
  .legend { display: flex; gap: 28px; justify-content: center; margin-top: 16px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: .85rem; color: var(--muted); }
  .legend-dot { width: 12px; height: 12px; border-radius: 50%; }
  .export-btn {
    background: var(--accent); color: #fff; border: none; border-radius: 10px;
    padding: 12px 28px; font-size: .9rem; font-weight: 600; cursor: pointer; transition: opacity .2s;
  }
  .export-btn:hover { opacity: .85; }
`;


// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = n => {
  const num = parseFloat(n) || 0;
  return `$${num.toLocaleString("es-SV", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const today = () => new Date().toISOString().slice(0,10);

function PieChart({ income, expense, canvasRef }) {
  const total = income + expense;

  const draw = (canvas) => {
    if (!canvas) return;
    if (canvasRef) canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    const W = 300, H = 380;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    if (total === 0) {
      ctx.fillStyle = "#8492b0";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sin datos", W/2, H/2);
      return;
    }

    const cx = W/2, cy = 130, r = 100;
    const incomeAngle  = (income  / total) * 2 * Math.PI;
    const expenseAngle = (expense / total) * 2 * Math.PI;
    const startAngle   = -Math.PI / 2;

    // Rebanada Entradas (azul)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + incomeAngle);
    ctx.closePath();
    ctx.fillStyle = "#4f8ef7";
    ctx.fill();

    // Rebanada Salidas (rojo)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle + incomeAngle, startAngle + incomeAngle + expenseAngle);
    ctx.closePath();
    ctx.fillStyle = "#f76f6f";
    ctx.fill();

    // Texto central
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${((income/total)*100).toFixed(1)}%`, cx, cy - 8);
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#cce4ff";
    ctx.fillText("Entradas", cx, cy + 12);
    ctx.fillStyle = "#ffaaaa";
    ctx.fillText(`${((expense/total)*100).toFixed(1)}% Salidas`, cx, cy + 30);

    // ── Leyenda debajo del gráfico ──
    const legendY = cy + r + 35;

    // Punto y texto Entradas
    ctx.beginPath();
    ctx.arc(40, legendY, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#4f8ef7";
    ctx.fill();
    ctx.fillStyle = "#cce4ff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Entradas: $${income.toLocaleString()}`, 54, legendY + 5);

    // Punto y texto Salidas
    ctx.beginPath();
    ctx.arc(40, legendY + 28, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#f76f6f";
    ctx.fill();
    ctx.fillStyle = "#ffaaaa";
    ctx.fillText(`Salidas: $${expense.toLocaleString()}`, 54, legendY + 33);
  };

  return (
    <canvas
      ref={draw}
      style={{ display:"block", margin:"0 auto" }}
    />
  );
}

// ─── App principal ─────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn]   = useState(false);
  const [user, setUser]           = useState("");
  const [loginErr, setLoginErr]   = useState("");
  const [page, setPage]           = useState("dashboard");
  const [entradas, setEntradas]   = useState([]);
  const [salidas, setSalidas]     = useState([]);
  const [success, setSuccess]     = useState("");
  const [imgModal, setImgModal]   = useState(null);
  const [loading, setLoading]     = useState(false);

  // ── Cargar datos desde la API al hacer login ─────────────────────────────
  useEffect(() => {
    if (!loggedIn) return;
    // Consulta GET /api/entradas — trae todas las entradas de la base de datos
    getEntradas()
      .then(data => setEntradas(data))
      .catch(err => console.error("Error cargando entradas:", err));

    // Consulta GET /api/salidas — trae todas las salidas de la base de datos
    getSalidas()
      .then(data => setSalidas(data))
      .catch(err => console.error("Error cargando salidas:", err));
  }, [loggedIn]);

  // login form
  const [lUser, setLUser] = useState("");
  const [lPass, setLPass] = useState("");

  // entrada form
  const [eForm, setEForm] = useState({ tipo:"", monto:"", fecha:today(), factura:null, preview:null });
  // salida form
  const [sForm, setSForm] = useState({ tipo:"", monto:"", fecha:today(), factura:null, preview:null });

  const eFileRef  = useRef();
  const sFileRef  = useRef();
  const chartRef  = useRef();
  const canvasRef = useRef();

  function handleLogin() {
    if (lUser === "admin" && lPass === "admin123") {
      setLoggedIn(true); setUser(lUser); setLoginErr("");
    } else {
      setLoginErr("Usuario o contraseña incorrectos.");
    }
  }

  function handleFile(e, which) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (which === "entrada")
        setEForm(f => ({...f, factura: ev.target.result, preview: ev.target.result, facturaFile: file}));
      else
        setSForm(f => ({...f, factura: ev.target.result, preview: ev.target.result, facturaFile: file}));
    };
    reader.readAsDataURL(file);
  }

  async function submitEntrada() {
    if (!eForm.tipo || !eForm.monto) return;
    setLoading(true);
    try {
      // Consulta POST /api/entradas — guarda la entrada en la base de datos
      const data = await createEntrada(eForm.tipo, eForm.monto, eForm.fecha, eForm.facturaFile);
      setEntradas(prev => [...prev, data]);
      setEForm({ tipo:"", monto:"", fecha:today(), factura:null, preview:null, facturaFile:null });
      setSuccess("✅ Entrada registrada exitosamente.");
      setTimeout(() => setSuccess(""), 3000);
      setPage("ver-entradas");
    } catch (err) {
      setSuccess("❌ Error al guardar entrada. Verifica que el servidor esté corriendo.");
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setLoading(false);
    }
  }

  async function submitSalida() {
    if (!sForm.tipo || !sForm.monto) return;
    setLoading(true);
    try {
      // Consulta POST /api/salidas — guarda la salida en la base de datos
      const data = await createSalida(sForm.tipo, sForm.monto, sForm.fecha, sForm.facturaFile);
      setSalidas(prev => [...prev, data]);
      setSForm({ tipo:"", monto:"", fecha:today(), factura:null, preview:null, facturaFile:null });
      setSuccess("✅ Salida registrada exitosamente.");
      setTimeout(() => setSuccess(""), 3000);
      setPage("ver-salidas");
    } catch (err) {
      setSuccess("❌ Error al guardar salida. Verifica que el servidor esté corriendo.");
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setLoading(false);
    }
  }

  const totalIn  = entradas.reduce((s,e) => s + parseFloat(e.monto || 0), 0);
  const totalOut = salidas.reduce((s,e)  => s + parseFloat(e.monto || 0), 0);
  const balance  = totalIn - totalOut;

  async function exportPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const fechaHoy = new Date().toLocaleDateString("es-ES");
    const pageW = doc.internal.pageSize.getWidth();

    // Encabezado
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 40, "F");
    doc.setTextColor(79, 142, 247);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("FinanzApp", 14, 18);
    doc.setTextColor(200, 210, 230);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte Mensual de Balance", 14, 28);
    doc.text(`Generado: ${fechaHoy}`, pageW - 14, 28, { align: "right" });

    // Resumen
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen General", 14, 52);
    autoTable(doc, {
      startY: 56,
      head: [["Concepto", "Monto"]],
      body: [
        ["Total Entradas", `$${totalIn.toLocaleString()}`],
        ["Total Salidas",  `$${totalOut.toLocaleString()}`],
        ["Balance Neto",   `$${balance.toLocaleString()}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42], textColor: [79, 142, 247], fontStyle: "bold" },
      bodyStyles: { fontSize: 10 },
      didParseCell(data) {
        if (data.row.index === 0 && data.column.index === 1) data.cell.styles.textColor = [62, 207, 142];
        if (data.row.index === 1 && data.column.index === 1) data.cell.styles.textColor = [247, 111, 111];
        if (data.row.index === 2 && data.column.index === 1)
          data.cell.styles.textColor = balance >= 0 ? [62, 207, 142] : [247, 111, 111];
      },
      margin: { left: 14, right: 14 },
    });

    // Tabla Entradas
    const y1 = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.setTextColor(62, 207, 142);
    doc.text("Entradas", 14, y1);
    autoTable(doc, {
      startY: y1 + 4,
      head: [["#", "Tipo", "Monto", "Fecha"]],
      body: entradas.map((e, i) => [i + 1, e.tipo, `$${e.monto.toLocaleString()}`, e.fecha]),
      theme: "striped",
      headStyles: { fillColor: [25, 50, 40], textColor: [62, 207, 142] },
      bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
      foot: [["", "TOTAL", `$${totalIn.toLocaleString()}`, ""]],
      footStyles: { fillColor: [240, 255, 248], textColor: [30, 30, 30], fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    // Tabla Salidas
    const y2 = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.setTextColor(247, 111, 111);
    doc.text("Salidas", 14, y2);
    autoTable(doc, {
      startY: y2 + 4,
      head: [["#", "Tipo", "Monto", "Fecha"]],
      body: salidas.map((s, i) => [i + 1, s.tipo, `$${s.monto.toLocaleString()}`, s.fecha]),
      theme: "striped",
      headStyles: { fillColor: [50, 25, 25], textColor: [247, 111, 111] },
      bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
      foot: [["", "TOTAL", `$${totalOut.toLocaleString()}`, ""]],
      footStyles: { fillColor: [255, 245, 245], textColor: [30, 30, 30], fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    // Gráfico de pastel — directo desde canvas
    if (canvasRef.current) {
      const imgData = canvasRef.current.toDataURL("image/png");
      const y3 = doc.lastAutoTable.finalY + 14;
      const pageH = doc.internal.pageSize.getHeight();
      const remaining = pageH - y3 - 20;

      if (remaining < 80) {
        doc.addPage();
        doc.setFontSize(13); doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Gráfico Entradas vs Salidas", 14, 20);
        doc.addImage(imgData, "PNG", (pageW - 80) / 2, 26, 80, 80);
      } else {
        doc.setFontSize(13); doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Gráfico Entradas vs Salidas", 14, y3);
        doc.addImage(imgData, "PNG", (pageW - 80) / 2, y3 + 6, 80, 80);
      }
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(150);
      doc.text(`FinanzApp — Página ${i} de ${pageCount}`, pageW / 2, 290, { align: "center" });
    }

    doc.save(`reporte-balance-${fechaHoy.replace(/\//g, "-")}.pdf`);
  }

  // ── VIEWS ──────────────────────────────────────────────────────────────────
  const views = {
    dashboard: (
      <>
        <div className="page-title">Bienvenido, {user} 👋</div>
        <div className="page-sub">Panel de control de finanzas personales</div>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total Entradas</div>
            <div className="stat-value green">{fmt(totalIn)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Salidas</div>
            <div className="stat-value red">{fmt(totalOut)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Balance</div>
            <div className={`stat-value ${balance >= 0 ? "blue" : "red"}`}>{fmt(balance)}</div>
          </div>
        </div>
        <div style={{color:"var(--muted)",fontSize:".85rem"}}>
          Utiliza el menú lateral para registrar movimientos, ver el historial o consultar tu balance.
        </div>
      </>
    ),

    "registrar-entrada": (
      <>
        <div className="page-title">Registrar Entrada</div>
        <div className="page-sub">Añade un nuevo ingreso al sistema</div>
        {success && <div className="success-banner">{success}</div>}
        <div className="form-card">
          <div className="form-grid">
            <div className="field full">
              <label>Tipo de entrada</label>
              <select value={eForm.tipo} onChange={e => setEForm(f=>({...f,tipo:e.target.value}))}>
                <option value="">Seleccionar...</option>
                {["Sueldo del mes","Cheque de sistema","Remesa","Freelance","Otros"].map(t=>(
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Monto ($)</label>
              <input type="number" min="0" placeholder="0.00"
                value={eForm.monto} onChange={e=>setEForm(f=>({...f,monto:e.target.value}))} />
            </div>
            <div className="field">
              <label>Fecha</label>
              <input type="date" value={eForm.fecha} onChange={e=>setEForm(f=>({...f,fecha:e.target.value}))} />
            </div>
            <div className="field full">
              <label>Factura (foto)</label>
              <div className="upload-zone" onClick={()=>eFileRef.current.click()}>
                <span style={{fontSize:"1.8rem"}}>📎</span>
                <p>Haz clic para subir imagen de factura</p>
                {eForm.preview && <img src={eForm.preview} alt="preview" className="upload-preview" />}
              </div>
              <input type="file" accept="image/*" ref={eFileRef} style={{display:"none"}}
                onChange={e=>handleFile(e,"entrada")} />
            </div>
          </div>
          <div className="submit-row">
            <button className="btn-primary" style={{flex:1}} onClick={submitEntrada} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Entrada"}
            </button>
            <button className="btn-secondary" onClick={()=>setEForm({tipo:"",monto:"",fecha:today(),factura:null,preview:null,facturaFile:null})}>
              Limpiar
            </button>
          </div>
        </div>
      </>
    ),

    "registrar-salida": (
      <>
        <div className="page-title">Registrar Salida</div>
        <div className="page-sub">Añade un nuevo gasto al sistema</div>
        {success && <div className="success-banner">{success}</div>}
        <div className="form-card">
          <div className="form-grid">
            <div className="field full">
              <label>Tipo de salida</label>
              <select value={sForm.tipo} onChange={e => setSForm(f=>({...f,tipo:e.target.value}))}>
                <option value="">Seleccionar...</option>
                {["Luz","Agua","Gas","Ropa","Comida","Casa","Otras"].map(t=>(
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Monto de salida ($)</label>
              <input type="number" min="0" placeholder="0.00"
                value={sForm.monto} onChange={e=>setSForm(f=>({...f,monto:e.target.value}))} />
            </div>
            <div className="field">
              <label>Fecha de salida</label>
              <input type="date" value={sForm.fecha} onChange={e=>setSForm(f=>({...f,fecha:e.target.value}))} />
            </div>
            <div className="field full">
              <label>Factura de salida (foto)</label>
              <div className="upload-zone" onClick={()=>sFileRef.current.click()}>
                <span style={{fontSize:"1.8rem"}}>📎</span>
                <p>Haz clic para subir imagen de factura</p>
                {sForm.preview && <img src={sForm.preview} alt="preview" className="upload-preview" />}
              </div>
              <input type="file" accept="image/*" ref={sFileRef} style={{display:"none"}}
                onChange={e=>handleFile(e,"salida")} />
            </div>
          </div>
          <div className="submit-row">
            <button className="btn-primary" style={{flex:1}} onClick={submitSalida} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Salida"}
            </button>
            <button className="btn-secondary" onClick={()=>setSForm({tipo:"",monto:"",fecha:today(),factura:null,preview:null,facturaFile:null})}>
              Limpiar
            </button>
          </div>
        </div>
      </>
    ),

    "ver-entradas": (
      <>
        <div className="page-title">Ver Entradas</div>
        <div className="page-sub">{entradas.length} registros encontrados</div>
        {success && <div className="success-banner">{success}</div>}
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">Historial de Entradas</span>
            <span style={{color:"var(--green)",fontWeight:700}}>Total: {fmt(totalIn)}</span>
          </div>
          <table>
            <thead><tr>
              <th>#</th><th>Tipo</th><th>Monto</th><th>Fecha</th><th>Factura</th>
            </tr></thead>
            <tbody>
              {entradas.map((e,i) => (
                <tr key={e.id}>
                  <td style={{color:"var(--muted)"}}>{i+1}</td>
                  <td><span className="badge badge-green">{e.tipo}</span></td>
                  <td style={{color:"var(--green)",fontWeight:600}}>{fmt(e.monto)}</td>
                  <td style={{color:"var(--muted)"}}>{e.fecha}</td>
                  <td>{e.factura
                    ? <img src={`http://localhost:5000${e.factura}`} alt="factura" className="img-thumb" onClick={()=>setImgModal(`http://localhost:5000${e.factura}`)} />
                    : <span style={{color:"var(--muted)",fontSize:".8rem"}}>Sin imagen</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),

    "ver-salidas": (
      <>
        <div className="page-title">Ver Salidas</div>
        <div className="page-sub">{salidas.length} registros encontrados</div>
        {success && <div className="success-banner">{success}</div>}
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">Historial de Salidas</span>
            <span style={{color:"var(--red)",fontWeight:700}}>Total: {fmt(totalOut)}</span>
          </div>
          <table>
            <thead><tr>
              <th>#</th><th>Tipo</th><th>Monto</th><th>Fecha</th><th>Factura</th>
            </tr></thead>
            <tbody>
              {salidas.map((s,i) => (
                <tr key={s.id}>
                  <td style={{color:"var(--muted)"}}>{i+1}</td>
                  <td><span className="badge badge-red">{s.tipo}</span></td>
                  <td style={{color:"var(--red)",fontWeight:600}}>{fmt(s.monto)}</td>
                  <td style={{color:"var(--muted)"}}>{s.fecha}</td>
                  <td>{s.factura
                    ? <img src={s.factura} alt="factura" className="img-thumb" onClick={()=>setImgModal(s.factura)} />
                    : <span style={{color:"var(--muted)",fontSize:".8rem"}}>Sin imagen</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),

    "balance": (
      <>
        <div className="page-title">Reporte de Balance</div>
        <div className="page-sub">Resumen financiero del período actual</div>

        <div className="balance-result">
          <div>
            <div className="balance-result-label">Balance Mensual</div>
            <div className={`balance-result-value ${balance>=0?"green":"red"}`}>{fmt(balance)}</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:24}}>
            <div>
              <div style={{color:"var(--muted)",fontSize:".75rem",fontWeight:600,textTransform:"uppercase"}}>Entradas</div>
              <div style={{color:"var(--green)",fontWeight:700,fontSize:"1.1rem"}}>{fmt(totalIn)}</div>
            </div>
            <div>
              <div style={{color:"var(--muted)",fontSize:".75rem",fontWeight:600,textTransform:"uppercase"}}>Salidas</div>
              <div style={{color:"var(--red)",fontWeight:700,fontSize:"1.1rem"}}>{fmt(totalOut)}</div>
            </div>
          </div>
        </div>

        <div className="balance-grid">
          <div className="balance-table-wrap">
            <div className="balance-table-title" style={{color:"var(--green)"}}>📈 Entradas</div>
            <table>
              <thead><tr><th>Tipo</th><th>Monto</th></tr></thead>
              <tbody>
                {entradas.map(e=>(
                  <tr key={e.id}><td>{e.tipo}</td><td style={{color:"var(--green)"}}>{fmt(e.monto)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="balance-total"><span>TOTAL</span><span style={{color:"var(--green)"}}>{fmt(totalIn)}</span></div>
          </div>

          <div className="balance-table-wrap">
            <div className="balance-table-title" style={{color:"var(--red)"}}>📉 Salidas</div>
            <table>
              <thead><tr><th>Tipo</th><th>Monto</th></tr></thead>
              <tbody>
                {salidas.map(s=>(
                  <tr key={s.id}><td>{s.tipo}</td><td style={{color:"var(--red)"}}>{fmt(s.monto)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="balance-total"><span>TOTAL</span><span style={{color:"var(--red)"}}>{fmt(totalOut)}</span></div>
          </div>
        </div>

        <div className="chart-wrap" ref={chartRef}>
          <div className="chart-title">Gráfico de balance — Entradas vs Salidas</div>
          <PieChart income={totalIn} expense={totalOut} canvasRef={canvasRef} />
        </div>

        <button className="export-btn" onClick={exportPDF}>⬇ Descargar PDF</button>
      </>
    ),
  };

  const NAV = [
    { key:"dashboard",           icon:"🏠", label:"Dashboard" },
    { key:"registrar-entrada",   icon:"➕", label:"Registrar Entrada" },
    { key:"registrar-salida",    icon:"➖", label:"Registrar Salida" },
    { key:"ver-entradas",        icon:"📋", label:"Ver Entradas" },
    { key:"ver-salidas",         icon:"📄", label:"Ver Salidas" },
    { key:"balance",             icon:"📊", label:"Mostrar Balance" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <style>{STYLES}</style>

      {imgModal && (
        <div className="img-modal-overlay" onClick={()=>setImgModal(null)}>
          <img src={imgModal} alt="factura grande" />
        </div>
      )}

      {!loggedIn ? (
        <div className="login-wrap">
          <div className="login-box">
            <div className="login-logo">FinanzApp</div>
            <div className="login-sub">Control de entradas y salidas</div>
            <div className="field">
              <label>Usuario</label>
              <input value={lUser} onChange={e=>setLUser(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="admin" />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input type="password" value={lPass} onChange={e=>setLPass(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••" />
            </div>
            <button className="btn-primary" onClick={handleLogin}>Iniciar Sesión</button>
            {loginErr && <div className="error-msg">{loginErr}</div>}
            <div style={{marginTop:16,color:"var(--muted)",fontSize:".78rem",textAlign:"center"}}>
              Demo: admin / admin123
            </div>
          </div>
        </div>
      ) : (
        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-logo">FinanzApp</div>
            {NAV.map(n=>(
              <div key={n.key} className={`nav-item ${page===n.key?"active":""}`}
                onClick={()=>setPage(n.key)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </div>
            ))}
            <div className="sidebar-footer">
              <button className="logout-btn" onClick={()=>{setLoggedIn(false);setLUser("");setLPass("");}}>
                ↩ Cerrar Sesión
              </button>
            </div>
          </aside>
          <main className="main">
            {views[page]}
          </main>
        </div>
      )}
    </div>
  );
}

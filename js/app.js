/**
 * SIMP-SP — Sistema Integrado de Monitoramento Pluvial
 * Lógica de telemetria, simulação e interface — VERSÃO LIMPA
 */

// ============================================================
// 1. DADOS DA FROTA DE BUEIROS
// ============================================================
const DRAINS_DATA = [
  {
    id: "bueiro-01", name: "Vale do Anhangabaú",
    basin: "Bacia do Tamanduateí", depthCm: 200,
    waterLevelCm: 32, waterLevelPct: 16, rateOfRise: 0.2,
    battery: 98, rssi: -58, drainCapacity: 0.8,
    isBlocked: false, status: "NORMAL"
  },
  {
    id: "bueiro-02", name: "Av. 23 de Maio x Tutóia",
    basin: "Córrego do Ibirapuera", depthCm: 200,
    waterLevelCm: 45, waterLevelPct: 22.5, rateOfRise: 0.4,
    battery: 94, rssi: -65, drainCapacity: 0.65,
    isBlocked: false, status: "NORMAL"
  },
  {
    id: "bueiro-03", name: "Marginal Tietê (Pte. Bandeiras)",
    basin: "Calha Principal Rio Tietê", depthCm: 220,
    waterLevelCm: 50, waterLevelPct: 22.7, rateOfRise: 0.3,
    battery: 96, rssi: -61, drainCapacity: 1.1,
    isBlocked: false, status: "NORMAL"
  },
  {
    id: "bueiro-04", name: "Bixiga (R. 13 de Maio)",
    basin: "Microbacia do Saracura", depthCm: 180,
    waterLevelCm: 28, waterLevelPct: 15.5, rateOfRise: 0.1,
    battery: 91, rssi: -72, drainCapacity: 0.5,
    isBlocked: false, status: "NORMAL"
  },
  {
    id: "bueiro-05", name: "Pompeia (Av. F. Matarazzo)",
    basin: "Córrego Água Preta", depthCm: 200,
    waterLevelCm: 38, waterLevelPct: 19, rateOfRise: 0.3,
    battery: 95, rssi: -64, drainCapacity: 0.7,
    isBlocked: false, status: "NORMAL"
  },
  {
    id: "bueiro-06", name: "Radial Leste (Tatuapé)",
    basin: "Córrego do Tatuapé", depthCm: 200,
    waterLevelCm: 30, waterLevelPct: 15, rateOfRise: 0.2,
    battery: 97, rssi: -60, drainCapacity: 0.85,
    isBlocked: false, status: "NORMAL"
  }
];

// ============================================================
// 2. ESTADO GLOBAL
// ============================================================
let selectedDrainId = "bueiro-01";
let rainIntensityMmH = 0;
let audioEnabled = true;
let audioCtx = null;
let lastBeepTime = 0;

// ============================================================
// 3. REFERÊNCIAS DO DOM
// ============================================================
const $ = (id) => document.getElementById(id);

const rainSlider       = $("rainSlider");
const rainValueDisplay = $("rainValueDisplay");
const emergencyBanner  = $("emergencyBanner");
const emergencyDetails = $("emergencyDetails");
const selectedDrainName   = $("selectedDrainName");
const selectedDrainBasin  = $("selectedDrainBasin");
const cutawayWaterLevel   = $("cutawayWaterLevel");
const cutawayDistance     = $("cutawayDistance");
const cutawayRate         = $("cutawayRate");
const cutawayStatus       = $("cutawayStatus");
const waterContainer      = $("waterContainer");
const fleetCardsContainer = $("fleetCardsContainer");
const terminalBody        = $("terminalBody");
const liveClock           = $("liveClock");
const toggleAudioBtn      = $("toggleAudioBtn");
const openModalBtn        = $("openModalBtn");
const closeModalBtn       = $("closeModalBtn");
const codeModal           = $("codeModal");
const toggleBlockageBtn   = $("toggleBlockageBtn");
const resetSystemBtn      = $("resetSystemBtn");
const rainOverlay         = $("rainOverlay");
const auditTableBody      = $("auditTableBody");

// ============================================================
// 4. SIMULAÇÃO DE CHUVA NO CANVAS
// ============================================================
let drops = [];
const rainCtx = rainOverlay ? rainOverlay.getContext("2d") : null;

function resizeCanvas() {
  if (!rainOverlay) return;
  rainOverlay.width = window.innerWidth;
  rainOverlay.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function makeDrops() {
  drops = [];
  const n = Math.min(Math.floor(rainIntensityMmH * 2.5), 350);
  for (let i = 0; i < n; i++) {
    drops.push({
      x: Math.random() * (rainOverlay ? rainOverlay.width : 1366),
      y: Math.random() * (rainOverlay ? rainOverlay.height : 768),
      speed: 14 + Math.random() * 14,
      len: 10 + Math.random() * 18
    });
  }
}

function animateRain() {
  if (!rainCtx || !rainOverlay) { requestAnimationFrame(animateRain); return; }
  rainCtx.clearRect(0, 0, rainOverlay.width, rainOverlay.height);

  if (rainIntensityMmH > 5) {
    rainOverlay.style.opacity = Math.min(0.9, rainIntensityMmH / 70).toString();
    rainCtx.strokeStyle = "rgba(37, 99, 235, 0.25)";
    rainCtx.lineWidth = 1;
    for (const d of drops) {
      rainCtx.beginPath();
      rainCtx.moveTo(d.x, d.y);
      rainCtx.lineTo(d.x - 1.5, d.y + d.len);
      rainCtx.stroke();
      d.y += d.speed;
      d.x -= 1;
      if (d.y > rainOverlay.height) {
        d.y = -d.len;
        d.x = Math.random() * rainOverlay.width;
      }
    }
  } else {
    rainOverlay.style.opacity = "0";
  }
  requestAnimationFrame(animateRain);
}
animateRain();

// ============================================================
// 5. MOTOR DE FÍSICA HIDROLÓGICA
// ============================================================
function stepHydrology() {
  let anyCritical = false;
  let criticalDrain = null;

  DRAINS_DATA.forEach(drain => {
    const runoff = (rainIntensityMmH / 20) * 0.85;
    const drainCap = drain.isBlocked ? drain.drainCapacity * 0.08 : drain.drainCapacity;
    const outflow = (drain.waterLevelCm / 60) * drainCap;
    const delta = (runoff - outflow) * 0.45 + (Math.random() * 0.4 - 0.2);

    drain.waterLevelCm = Math.max(12, Math.min(drain.depthCm, drain.waterLevelCm + delta));
    drain.waterLevelPct = parseFloat(((drain.waterLevelCm / drain.depthCm) * 100).toFixed(1));
    drain.rateOfRise = parseFloat((delta * 20).toFixed(1));

    if (drain.waterLevelPct >= 85 || drain.rateOfRise >= 10) {
      drain.status = "CRITICAL";
      anyCritical = true;
      criticalDrain = drain;
    } else if (drain.waterLevelPct >= 65 || drain.rateOfRise >= 4) {
      drain.status = "WARNING";
    } else {
      drain.status = "NORMAL";
    }

    if (Math.random() > 0.98) drain.battery = Math.max(20, drain.battery - 0.05);
  });

  if (anyCritical && criticalDrain && emergencyBanner) {
    emergencyBanner.classList.add("show");
    if (emergencyDetails) {
      emergencyDetails.textContent = `${criticalDrain.name} (${criticalDrain.basin}) — ${criticalDrain.waterLevelPct}% da cota máxima. Gradiente: ${criticalDrain.rateOfRise} cm/min.`;
    }
    playBeep();
    logAuditEvent(criticalDrain);
  } else if (emergencyBanner) {
    emergencyBanner.classList.remove("show");
  }

  renderAll();
}

// ============================================================
// 6. RENDERIZAÇÃO DA INTERFACE
// ============================================================
function renderAll() {
  renderCutaway();
  renderFleetCards();
  renderMapMarkers();
}

function renderCutaway() {
  const drain = DRAINS_DATA.find(d => d.id === selectedDrainId) || DRAINS_DATA[0];

  if (selectedDrainName) selectedDrainName.textContent = drain.name;
  if (selectedDrainBasin) {
    selectedDrainBasin.textContent = `${drain.basin} • ${drain.id}${drain.isBlocked ? " • OBSTRUÇÃO DETECTADA" : ""}`;
  }

  const dist = (drain.depthCm - drain.waterLevelCm).toFixed(1);
  if (cutawayWaterLevel) {
    cutawayWaterLevel.textContent = `${drain.waterLevelPct}%`;
    cutawayWaterLevel.style.color = drain.status === "CRITICAL" ? "#dc2626" : drain.status === "WARNING" ? "#d97706" : "#2563eb";
  }
  if (cutawayDistance) cutawayDistance.textContent = `${dist} cm`;
  if (cutawayRate)     cutawayRate.textContent      = `${drain.rateOfRise >= 0 ? "+" : ""}${drain.rateOfRise} cm/min`;

  if (cutawayStatus) {
    if (drain.status === "CRITICAL") {
      cutawayStatus.textContent = "CRÍTICO";
      cutawayStatus.style.color = "#dc2626";
    } else if (drain.status === "WARNING") {
      cutawayStatus.textContent = "ATENÇÃO";
      cutawayStatus.style.color = "#d97706";
    } else {
      cutawayStatus.textContent = "NORMAL";
      cutawayStatus.style.color = "#16a34a";
    }
  }

  if (waterContainer) {
    const pct = Math.min(95, Math.max(5, drain.waterLevelPct));
    waterContainer.style.height = `${pct}%`;
    // Muda cor da água conforme criticidade
    if (drain.status === "CRITICAL") {
      waterContainer.style.background = "linear-gradient(180deg, rgba(239,68,68,0.6) 0%, rgba(185,28,28,0.7) 100%)";
    } else if (drain.status === "WARNING") {
      waterContainer.style.background = "linear-gradient(180deg, rgba(251,191,36,0.6) 0%, rgba(217,119,6,0.7) 100%)";
    } else {
      waterContainer.style.background = "linear-gradient(180deg, rgba(96,165,250,0.75) 0%, rgba(37,99,235,0.65) 100%)";
    }
  }
}

function renderFleetCards() {
  if (!fleetCardsContainer) return;
  fleetCardsContainer.innerHTML = "";

  DRAINS_DATA.forEach(drain => {
    const card = document.createElement("div");
    card.className = `drain-tile${drain.id === selectedDrainId ? " selected" : ""}`;

    // Clique no card seleciona o bueiro — sem bug de cursor
    card.addEventListener("click", () => {
      selectedDrainId = drain.id;
      renderAll();
    });

    let barColor = "#2563eb";
    let badgeClass = "normal";
    let statusLabel = "NORMAL";

    if (drain.status === "CRITICAL") {
      barColor = "#ef4444"; badgeClass = "critical"; statusLabel = "CRÍTICO";
    } else if (drain.status === "WARNING") {
      barColor = "#f59e0b"; badgeClass = "warning"; statusLabel = "ATENÇÃO";
    }

    card.innerHTML = `
      <div class="drain-tile-top">
        <div>
          <div class="drain-tile-title">${drain.name}</div>
          <div class="drain-tile-sub">${drain.id} • ${drain.basin}</div>
        </div>
        <span class="status-tag ${badgeClass}">${statusLabel}</span>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;">
          <span style="color:#64748b;">Ocupação</span>
          <strong style="font-family:'JetBrains Mono',monospace;color:#0f172a;font-size:12px;">${drain.waterLevelPct}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${drain.waterLevelPct}%;background:${barColor};"></div>
        </div>
      </div>
      <div class="drain-tile-footer">
        <span>Bat: ${Math.round(drain.battery)}%</span>
        <span>${drain.rssi} dBm</span>
        <span>${drain.rateOfRise >= 0 ? "▲" : "▼"} ${Math.abs(drain.rateOfRise)} cm/min</span>
      </div>
    `;
    fleetCardsContainer.appendChild(card);
  });
}

function renderMapMarkers() {
  DRAINS_DATA.forEach(drain => {
    const group = document.getElementById(`marker-${drain.id}`);
    if (!group) return;

    const core  = group.querySelector(".core-circle");
    const pulse = group.querySelector(".pin-pulse");
    const label = group.querySelector(".marker-text");
    const rect  = group.querySelector("rect");

    let color = "#16a34a";
    if (drain.status === "CRITICAL") color = "#dc2626";
    else if (drain.status === "WARNING") color = "#d97706";

    if (core)  core.setAttribute("fill", color);
    if (pulse) pulse.setAttribute("stroke", color);
    if (label) label.textContent = `${Math.round(drain.waterLevelPct)}%`;

    if (drain.id === selectedDrainId) {
      group.setAttribute("opacity", "1");
      if (core) core.setAttribute("stroke-width", "2.5");
      if (rect) { rect.setAttribute("fill", "rgba(239,246,255,0.97)"); rect.setAttribute("stroke", "#bfdbfe"); }
    } else {
      group.setAttribute("opacity", "0.88");
      if (core) core.setAttribute("stroke-width", "2");
      if (rect) { rect.setAttribute("fill", "rgba(255,255,255,0.9)"); rect.setAttribute("stroke", "#e2e8f0"); }
    }
  });
}

// ============================================================
// 7. AUDITORIA DE EVENTOS
// ============================================================
let lastAuditDrainId = null;
let lastAuditTime = 0;

function logAuditEvent(drain) {
  if (!auditTableBody) return;
  const now = Date.now();
  // Evita spam: só registra se mudou de bueiro ou passaram 10s
  if (drain.id === lastAuditDrainId && now - lastAuditTime < 10000) return;
  lastAuditDrainId = drain.id;
  lastAuditTime = now;

  const timeStr = new Date().toLocaleTimeString("pt-BR");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td style="font-family:'JetBrains Mono',monospace;color:#dc2626;font-weight:600;">${timeStr}</td>
    <td style="color:#0f172a;font-weight:600;">${drain.name}</td>
    <td>${drain.waterLevelPct}%</td>
    <td><span class="status-tag critical">ALERTA SNS</span></td>
  `;
  auditTableBody.insertBefore(row, auditTableBody.firstChild);
  while (auditTableBody.children.length > 8) {
    auditTableBody.removeChild(auditTableBody.lastChild);
  }
}

// ============================================================
// 8. TERMINAL MQTT
// ============================================================
function pushMqttLog() {
  if (!terminalBody) return;
  const drain = DRAINS_DATA.find(d => d.id === selectedDrainId) || DRAINS_DATA[0];
  const time  = new Date().toTimeString().slice(0, 8);
  const dist  = parseFloat((drain.depthCm - drain.waterLevelCm).toFixed(1));

  const payload = {
    sensor_id: drain.id,
    distancia_cm: dist,
    timestamp: Date.now()
  };

  const topic = `cidades_inteligentes/enchentes/${drain.id}`;
  const line  = document.createElement("div");

  if (drain.status === "CRITICAL") {
    line.innerHTML = `<span style="color:#64748b;">[${time}]</span> <span style="color:#ef4444;font-weight:700;">[URGENTE]</span> <span style="color:#38bdf8;">${topic}</span>: <code>${JSON.stringify(payload)}</code>`;
  } else {
    line.innerHTML = `<span style="color:#64748b;">[${time}]</span> <span style="color:#38bdf8;">${topic}</span>: <code>${JSON.stringify(payload)}</code>`;
  }

  terminalBody.appendChild(line);
  terminalBody.scrollTop = terminalBody.scrollHeight;
  while (terminalBody.children.length > 40) terminalBody.removeChild(terminalBody.firstChild);
}

// ============================================================
// 9. WEB AUDIO API — SIRENE
// ============================================================
function initAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
}

function playBeep() {
  if (!audioEnabled) return;
  const now = Date.now();
  if (now - lastBeepTime < 4000) return;
  lastBeepTime = now;
  initAudio();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (e) { /* silencioso */ }
}

// ============================================================
// 10. RELÓGIO
// ============================================================
function updateClock() {
  if (liveClock) liveClock.textContent = new Date().toLocaleTimeString("pt-BR") + " UTC-3";
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// 11. CONTROLES: CHUVA, ENTUPIMENTO, RESET
// ============================================================
if (rainSlider) {
  rainSlider.addEventListener("input", () => {
    rainIntensityMmH = parseInt(rainSlider.value);
    if (rainValueDisplay) rainValueDisplay.textContent = `${rainIntensityMmH} mm/h`;
    makeDrops();
    document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
  });
}

document.querySelectorAll(".preset-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    rainIntensityMmH = parseInt(pill.dataset.rain || "0");
    if (rainSlider) rainSlider.value = rainIntensityMmH;
    if (rainValueDisplay) rainValueDisplay.textContent = `${rainIntensityMmH} mm/h`;
    makeDrops();
  });
});

if (toggleBlockageBtn) {
  toggleBlockageBtn.addEventListener("click", () => {
    const drain = DRAINS_DATA.find(d => d.id === selectedDrainId);
    if (!drain) return;
    drain.isBlocked = !drain.isBlocked;
    toggleBlockageBtn.textContent = drain.isBlocked ? "Remover Obstrução" : "Simular Obstrução por Detritos";
    renderAll();
  });
}

if (resetSystemBtn) {
  resetSystemBtn.addEventListener("click", () => {
    rainIntensityMmH = 0;
    if (rainSlider) rainSlider.value = 0;
    if (rainValueDisplay) rainValueDisplay.textContent = "0 mm/h";
    document.querySelectorAll(".preset-pill").forEach((p, i) => p.classList.toggle("active", i === 0));
    DRAINS_DATA.forEach(d => {
      d.waterLevelCm  = 20 + Math.random() * 15;
      d.waterLevelPct = parseFloat(((d.waterLevelCm / d.depthCm) * 100).toFixed(1));
      d.rateOfRise    = 0.1;
      d.isBlocked     = false;
      d.status        = "NORMAL";
    });
    if (toggleBlockageBtn) toggleBlockageBtn.textContent = "Simular Obstrução por Detritos";
    if (emergencyBanner)   emergencyBanner.classList.remove("show");
    makeDrops();
    renderAll();
  });
}

if (toggleAudioBtn) {
  toggleAudioBtn.addEventListener("click", () => {
    audioEnabled = !audioEnabled;
    toggleAudioBtn.textContent = audioEnabled ? "Sirene de Alerta: Ativa" : "Sirene de Alerta: Silenciada";
    if (audioEnabled) initAudio();
  });
}

// ============================================================
// 12. MODAL DE DOCUMENTAÇÃO TÉCNICA
// ============================================================
if (openModalBtn && codeModal) {
  openModalBtn.addEventListener("click", () => codeModal.classList.add("open"));
}
if (closeModalBtn && codeModal) {
  closeModalBtn.addEventListener("click", () => codeModal.classList.remove("open"));
}
if (codeModal) {
  codeModal.addEventListener("click", (e) => {
    if (e.target === codeModal) codeModal.classList.remove("open");
  });
}

// Abas do modal
document.querySelectorAll(".tab-pill").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-pill").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");
    btn.classList.add("active");
    const panel = document.getElementById(btn.dataset.tab);
    if (panel) panel.style.display = "block";
  });
});

// Copiar código
document.querySelectorAll(".copy-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const code = btn.closest(".code-box").querySelector("code");
    if (!code) return;
    navigator.clipboard.writeText(code.textContent).then(() => {
      const original = btn.textContent;
      btn.textContent = "Copiado!";
      setTimeout(() => btn.textContent = original, 2000);
    });
  });
});

// ============================================================
// 13. CLIQUE NOS MARCADORES DO MAPA (SVG)
// ============================================================
// Delegação de eventos no SVG — evita bugs de CSS transform em grupos
document.querySelectorAll(".sensor-pin").forEach(group => {
  group.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = group.id.replace("marker-", "");
    selectedDrainId = id;
    renderAll();
  });
  // Remove qualquer :hover de transform via JS (evita o bug de girar)
  group.addEventListener("mouseenter", () => {
    group.style.transform = "";
  });
});

// ============================================================
// 14. INICIALIZAÇÃO & LOOPS
// ============================================================
renderAll();
setInterval(stepHydrology, 1200);
setInterval(pushMqttLog, 2000);

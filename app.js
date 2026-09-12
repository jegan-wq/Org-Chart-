// ============================================================================
// APP LOGIC — renders the org chart from state, wires up editing.
// State lives in localStorage under STORAGE_KEY. Default data comes from
// DEFAULT_DATA in data.js.
// ============================================================================

const STORAGE_KEY = "zensciences-org-chart-v1";

const ICONS = {
  finance: "💰",
  cbo: "👤",
  bu: "👥",
  martech: "📈",
  hr: "🧑\u200d🤝\u200d🧑",
  operations: "⚙️",
  strategy: "🤝",
  advisory: "🧭",
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read saved data, falling back to defaults.", e);
  }
  return clone(DEFAULT_DATA);
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save data.", e);
  }
}

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
  cur[keys[keys.length - 1]] = value;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function esc(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function personBox(namePath, val, namePh = "(Add name)", titlePh = "(Add designation)", cls = "") {
  return `<div class="person-box ${cls}">
    <input class="name-input" data-path="${namePath}.name" value="${esc(val.name)}" placeholder="${namePh}" />
    <input class="title-input" data-path="${namePath}.title" value="${esc(val.title)}" placeholder="${titlePh}" />
  </div>`;
}

function removablePersonBox(basePath, index, val, cls = "") {
  return `<div class="person-box ${cls}">
    <button class="remove-x" data-action="remove-item" data-path="${basePath}" data-index="${index}" title="Remove">×</button>
    <input class="name-input" data-path="${basePath}.${index}.name" value="${esc(val.name)}" placeholder="(Add name)" />
    <input class="title-input" data-path="${basePath}.${index}.title" value="${esc(val.title)}" placeholder="(Add designation)" />
  </div>`;
}

function multiline(path, val, placeholder) {
  return `<textarea class="multiline" rows="2" data-path="${path}" placeholder="${placeholder}">${esc(val)}</textarea>`;
}

function addLink(label, action, path, extra = "") {
  return `<button class="add-link" data-action="${action}" data-path="${path}" ${extra}>+ ${label}</button>`;
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------
function renderMasthead() {
  const m = state.meta;
  return `
  <div class="masthead">
    <div class="masthead-left">
      <h1><input class="bu-name-input" style="color:var(--navy); background:transparent; border:none; font-size:30px; font-weight:800; padding:0; width:auto; min-width:240px;" data-path="meta.orgName" value="${esc(m.orgName)}" placeholder="Company name" /><br/>
      <input class="bu-name-input" style="color:var(--navy); background:transparent; border:none; font-size:22px; font-weight:700; padding:0; width:auto; min-width:240px;" data-path="meta.title" value="${esc(m.title)}" placeholder="Organization Map" /></h1>
      <hr class="rule" />
      <input class="title-input" style="font-size:14px; padding:0; width:auto; min-width:220px;" data-path="meta.subtitle" value="${esc(m.subtitle)}" placeholder="Tagline" />
    </div>
    <div class="masthead-right">
      <input class="title-input" style="text-align:right; font-style:italic; color:var(--teal); font-family:'Manrope',cursive;" data-path="meta.tagline" value="${esc(m.tagline)}" placeholder="Create. Communicate. Convert." />
    </div>
  </div>`;
}

function renderFounders() {
  return `
  <div class="founders-wrap">
    <div class="founders-card">
      <div class="founders-title">Founders</div>
      <div class="founders-people">
        ${state.founders.map((f, i) => personBox(`founders.${i}`, f)).join("")}
      </div>
    </div>
    <div class="connector v-18"></div>
  </div>`;
}

function renderSecondRow() {
  const fin = state.finance;
  const cbo = state.cbo;
  return `
  <div class="second-row">
    <div class="dept-card node">
      <div class="node-header">${ICONS.finance} ${esc(fin.label)}</div>
      <div class="people-row">
        ${fin.people.map((p, i) => removablePersonBox("finance.people", i, p)).join("")}
      </div>
      <div style="padding:0 12px 12px;">${addLink("Add Person", "add-item", "finance.people")}</div>
    </div>
    <div class="cbo-solid">
      <div class="cbo-avatar">${ICONS.cbo}</div>
      <div style="flex:1;">
        <input class="name-input" data-path="cbo.name" value="${esc(cbo.name)}" placeholder="(Add name)" />
        <input class="title-input" data-path="cbo.title" value="${esc(cbo.title)}" placeholder="Chief Business Officer (CBO)" />
      </div>
    </div>
  </div>`;
}

function buColorClass(color) {
  return { purple: "bu1", green: "bu2", blue: "bu3", orange: "bu4" }[color] || "bu1";
}

function renderBUColumn(bu, idx) {
  const base = `businessUnits.${idx}`;
  const cls = buColorClass(bu.color);

  const track = (leadObj, leadPath, leadPh, clusters, leadKey, teamKey, teamLabel, teamPh, addLabel) => {
    const rows = clusters
      .map((c, i) => {
        const cl = c[leadKey];
        return `
        ${personBox(`${base}.clusters.${i}.${leadKey}`, cl, `(Add name)`, `(Add designation)`, "cluster-col-box")}
        ${multiline(`${base}.clusters.${i}.${teamKey}`, c[teamKey], teamPh)}
      `;
      })
      .join("");
    return `
    <div class="track">
      ${personBox(leadPath, leadObj, `(Add name)`, leadPh, "cluster-col-box")}
      ${rows}
      ${addLink(addLabel, "add-cluster", base)}
    </div>`;
  };

  return `
  <div class="column wide ${cls}">
    <div class="col-header">
      <span>${ICONS.bu}</span>
      <div class="col-header-text">
        <span class="col-header-fixed">${esc(bu.label)}</span>
        <input class="bu-name-input" data-path="${base}.customName" value="${esc(bu.customName)}" placeholder="(Add BU name)" />
      </div>
    </div>
    <div class="col-body">
      <div class="tracks-row">
        ${track(bu.leads.buLead, `${base}.leads.buLead`, "(BU Lead)", bu.clusters, "clusterLead", "accountManagers", "Account Manager(s)", "Account Manager(s)", "Add Cluster Lead")}
        ${track(bu.leads.cdDesign, `${base}.leads.cdDesign`, "(CD – Design)", bu.clusters, "designLead", "designers", "Designer(s)", "Designer(s)", "Add Design Lead")}
        ${track(bu.leads.cdContent, `${base}.leads.cdContent`, "(CD – Content)", bu.clusters, "contentLead", "contentWriters", "Content Writer(s)", "Content Writer(s)", "Add Content Lead")}
      </div>
    </div>
  </div>`;
}

function renderMartechColumn() {
  const mt = state.martech;
  return `
  <div class="column martech">
    <div class="col-header">
      <span>${ICONS.martech}</span>
      <div class="col-header-text">
        <span class="col-header-fixed">${esc(mt.label)}</span>
        <input class="bu-name-input" data-path="martech.customName" value="${esc(mt.customName)}" placeholder="(Add name)" />
      </div>
    </div>
    <div class="col-body">
      <div class="martech-roles">
        ${mt.roles
          .map(
            (r, i) => `
          <div class="martech-role">
            <div class="martech-role-title">${esc(r.title)}</div>
            ${personBox(`martech.roles.${i}.lead`, r.lead, "(Add name)", "(Add designation)")}
            ${multiline(`martech.roles.${i}.teamMembers`, r.teamMembers, "Team Member(s)")}
          </div>`
          )
          .join("")}
      </div>
    </div>
  </div>`;
}

function renderSimpleDeptColumn(dept, idx) {
  return `
  <div class="column ${dept.id}">
    <div class="col-header">
      <span>${ICONS[dept.id] || "•"}</span>
      <div class="col-header-text">
        <span class="col-header-fixed">${esc(dept.label)}</span>
        <input class="bu-name-input" data-path="simpleDepts.${idx}.customName" value="${esc(dept.customName)}" placeholder="(Add name)" />
      </div>
    </div>
    <div class="col-body">
      <div class="simple-people">
        ${dept.people.map((p, i) => removablePersonBox(`simpleDepts.${idx}.people`, i, p)).join("")}
      </div>
      ${addLink("Add Person", "add-item", `simpleDepts.${idx}.people`)}
    </div>
  </div>`;
}

function renderColumnsRow() {
  const bus = state.businessUnits.map((bu, i) => renderBUColumn(bu, i)).join("");
  const martech = renderMartechColumn();
  const simple = state.simpleDepts.map((d, i) => renderSimpleDeptColumn(d, i)).join("");
  return `<div class="columns-row">${bus}${martech}${simple}</div>`;
}

function renderCoverageTable(bu, idx) {
  const base = `businessUnits.${idx}.accountCoverage`;
  const cls = buColorClass(bu.color);
  const rows = bu.accountCoverage
    .map(
      (row, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td><input data-path="${base}.${i}.account" value="${esc(row.account)}" placeholder="(Add name)" /></td>
      <td><input data-path="${base}.${i}.manager" value="${esc(row.manager)}" placeholder="(Add name)" /></td>
      <td><input data-path="${base}.${i}.designer" value="${esc(row.designer)}" placeholder="(Add name)" /></td>
      <td><input data-path="${base}.${i}.writer" value="${esc(row.writer)}" placeholder="(Add name)" /></td>
      <td class="actions"><button class="row-del" data-action="remove-item" data-path="${base}" data-index="${i}" title="Delete row">🗑</button></td>
    </tr>`
    )
    .join("");

  return `
  <div class="coverage-card">
    <div class="coverage-head" style="background:var(--${cls});">
      <span>📊 ${esc(bu.label)} – Account Coverage</span>
      <button class="add-account" data-action="add-item" data-path="${base}">+ Add Account / Brand</button>
    </div>
    <table class="coverage-table">
      <thead><tr><th>#</th><th>Account / Brand</th><th>Account Manager(s)</th><th>Designer(s)</th><th>Content Writer(s)</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function renderTablesRow() {
  return `<div class="tables-row">${state.businessUnits.map((bu, i) => renderCoverageTable(bu, i)).join("")}</div>`;
}

function renderFooter() {
  const m = state.meta;
  return `
  <div class="page-footer">
    <div>
      <span class="footer-brand">${esc(m.orgName)}</span>
      <span style="color:var(--line); margin:0 8px;">|</span>
      <input class="title-input footer-tag" style="display:inline-block; width:auto; min-width:220px;" data-path="meta.footer" value="${esc(m.footer)}" placeholder="Footer tagline" />
    </div>
    <div class="footer-links"><span>People</span><span>Ideas</span><span>Impact</span></div>
  </div>`;
}

// ---------------------------------------------------------------------------
// New-item templates for generic "add-item" action
// ---------------------------------------------------------------------------
function templateFor(path) {
  if (path.endsWith("accountCoverage")) return { account: "", manager: "", designer: "", writer: "" };
  return { name: "", title: "" }; // finance.people / simpleDepts[i].people
}

// ---------------------------------------------------------------------------
// Render + wire up
// ---------------------------------------------------------------------------
const root = document.getElementById("chart-root");

function render() {
  root.innerHTML =
    renderMasthead() +
    renderFounders() +
    renderSecondRow() +
    renderColumnsRow() +
    renderTablesRow() +
    renderFooter();
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => (t.hidden = true), 2200);
}

// Text/textarea edits: update state only, no re-render (keeps focus/cursor).
root.addEventListener("input", (e) => {
  const target = e.target;
  if (target.dataset && target.dataset.path) {
    setPath(state, target.dataset.path, target.value);
    saveState();
  }
});

// Buttons: add/remove actions require a structural re-render.
root.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const path = btn.dataset.path;

  if (action === "add-item") {
    const arr = getPath(state, path);
    arr.push(templateFor(path));
    saveState();
    render();
  } else if (action === "remove-item") {
    const arr = getPath(state, path);
    const idx = parseInt(btn.dataset.index, 10);
    if (arr.length <= 1) {
      showToast("Keep at least one row — clear the fields instead.");
      return;
    }
    arr.splice(idx, 1);
    saveState();
    render();
  } else if (action === "add-cluster") {
    const bu = getPath(state, path);
    bu.clusters.push({
      clusterLead: { name: "", title: "" },
      accountManagers: "",
      designLead: { name: "", title: "" },
      designers: "",
      contentLead: { name: "", title: "" },
      contentWriters: "",
    });
    saveState();
    render();
  }
});

// ---------------------------------------------------------------------------
// Toolbar: export / import / reset
// ---------------------------------------------------------------------------
function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("btn-export-json").addEventListener("click", () => {
  download("org-chart-data.json", JSON.stringify(state, null, 2), "application/json");
  showToast("Downloaded org-chart-data.json");
});

document.getElementById("btn-export-datajs").addEventListener("click", () => {
  const content = `// Generated export — replace data.js with this file to make these values\n// the new default for everyone (commit + push + redeploy).\nconst DEFAULT_DATA = ${JSON.stringify(state, null, 2)};\n\nif (typeof module !== "undefined") {\n  module.exports = { DEFAULT_DATA };\n}\n`;
  download("data.js", content, "text/javascript");
  showToast("Downloaded data.js — replace the file in your repo to update the default");
});

document.getElementById("btn-import-json").addEventListener("click", () => {
  document.getElementById("import-file-input").click();
});

document.getElementById("import-file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = parsed;
      saveState();
      render();
      showToast("Data imported");
    } catch (err) {
      showToast("That file isn't valid JSON.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("btn-reset").addEventListener("click", () => {
  if (!confirm("Reset this browser's chart back to the default data? This can't be undone.")) return;
  state = clone(DEFAULT_DATA);
  saveState();
  render();
  showToast("Reset to default");
});

// ---------------------------------------------------------------------------
render();

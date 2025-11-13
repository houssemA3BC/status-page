async function loadMarkdownFiles(path) {
  const response = await fetch(path);
  const text = await response.text();
  return text;
}

// Charger et parser un fichier Markdown
function parseMarkdown(md) {
  const metaMatch = md.match(/^---([\\s\\S]+?)---/);
  const meta = {};
  if (metaMatch) {
    metaMatch[1].trim().split(/\\n/).forEach(line => {
      const [key, value] = line.split(":").map(v => v.trim());
      meta[key] = value;
    });
  }
  const content = md.replace(/^---([\\s\\S]+?)---/, "").trim();
  return { meta, content };
}

// Charger tous les incidents et maintenances
async function loadData() {
  const incidentFiles = [
    "data/incidents/2025-11-12-tata-degradation.md",
    "data/incidents/2025-11-05-tata-ok.md"
  ];
  const maintenanceFiles = [
    "data/maintenances/2025-11-15-db-maintenance.md",
    "data/maintenances/2025-10-20-network-maintenance.md"
  ];

  const incidents = await Promise.all(incidentFiles.map(async f => {
    const md = await loadMarkdownFiles(f);
    return { ...parseMarkdown(md), file: f };
  }));

  const maintenances = await Promise.all(maintenanceFiles.map(async f => {
    const md = await loadMarkdownFiles(f);
    return { ...parseMarkdown(md), file: f };
  }));

  displayItems(incidents, maintenances);
}

function displayItems(incidents, maintenances) {
  const incidentList = document.getElementById("incident-list");
  const maintenanceList = document.getElementById("maintenance-list");
  const historyList = document.getElementById("history-list");

  incidentList.innerHTML = "";
  maintenanceList.innerHTML = "";
  historyList.innerHTML = "";

  incidents.forEach(i => {
    const html = `<div class="card">
      <h3>${i.meta.title}</h3>
      <p>${i.meta.date}</p>
      <a href="${i.file}" target="_blank">Détails</a>
    </div>`;
    if (i.meta.status === "ongoing") incidentList.innerHTML += html;
    else historyList.innerHTML += html;
  });

  maintenances.forEach(m => {
    const html = `<div class="card">
      <h3>${m.meta.title}</h3>
      <p>${m.meta.date}</p>
      <a href="${m.file}" target="_blank">Détails</a>
    </div>`;
    if (m.meta.status === "planned") maintenanceList.innerHTML += html;
    else historyList.innerHTML += html;
  });
}

// Gestion des onglets
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

loadData();

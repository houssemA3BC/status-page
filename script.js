// Charger un fichier JSON
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Impossible de charger " + path);
  return res.json();
}

// Charger un fichier Markdown
async function fetchMarkdown(path) {
  const base = window.location.pathname.includes("/status-page")
    ? "/status-page/"
    : "/";
  const url = window.location.origin + base + path.replace(/^\.?\//, "");
  const res = await fetch(url);
  if (!res.ok) {
    console.warn("⚠️ Fichier introuvable :", url);
    return null;
  }
  return res.text();
}

// Extraire le frontmatter YAML
function parseMarkdown(md) {
  if (!md) return { meta: {}, content: "" };
  const meta = {};
  const match = md.match(/^---([\s\S]+?)---/);
  if (match) {
    match[1].trim().split(/\n/).forEach(line => {
      const [k, v] = line.split(":").map(s => s.trim());
      meta[k] = v;
    });
  }
  const content = md.replace(/^---([\s\S]+?)---/, "").trim();
  return { meta, content };
}

// Charger et afficher les données
async function loadAll() {
  const index = await fetchJSON("data/index.json");
  const files = await Promise.all(
    index.map(async entry => {
      const md = await fetchMarkdown(entry.path);
      const parsed = parseMarkdown(md);
      return { ...parsed, ...entry };
    })
  );
  display(files);
}

// Afficher les éléments dans les bonnes sections
function display(files) {
  const inc = document.getElementById("incident-list");
  const main = document.getElementById("maintenance-list");
  const hist = document.getElementById("history-list");

  // Nettoyer avant de remplir
  inc.innerHTML = "";
  main.innerHTML = "";
  hist.innerHTML = "";

  files.forEach(f => {
    const title = f.meta.title || "Sans titre";
    const date = f.meta.date || "";
    const status = (f.meta.status || "").toLowerCase();

    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${title}</h3>
      <p>${date}</p>
      <button class="details-btn">Voir détails</button>
    `;

    card.querySelector(".details-btn").addEventListener("click", e => {
      e.preventDefault();
      openPopup(title, f.content);
    });

    if (f.type === "incident") {
      if (status === "resolved") hist.appendChild(card);
      else inc.appendChild(card);
    } else if (f.type === "maintenance") {
      if (status === "done") hist.appendChild(card);
      else main.appendChild(card);
    }
  });
}

// Popup webview
function openPopup(title, content) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      <div class="modal-body">${marked.parse(content)}</div>
      <button class="close-btn">Fermer</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close-btn").addEventListener("click", () => {
    modal.remove();
  });
}

// Gestion des onglets
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Lancer le chargement une seule fois
document.addEventListener("DOMContentLoaded", loadAll);

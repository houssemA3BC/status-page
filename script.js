async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Impossible de charger " + path);
  return response.json();
}

async function fetchMarkdown(path) {
  const base = window.location.pathname.includes("/status-page")
    ? "/status-page/"
    : "/";
  const url = window.location.origin + base + path.replace(/^\.?\//, "");
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.text();
}

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

function display(files) {
  const inc = document.getElementById("incident-list");
  const main = document.getElementById("maintenance-list");
  const hist = document.getElementById("history-list");

  files.forEach(f => {
    const title = f.meta.title || "Sans titre";
    const date = f.meta.date || "";
    const status = (f.meta.status || "").toLowerCase();

    const html = `
      <div class="card">
        <h3>${title}</h3>
        <p>${date}</p>
        <button class="details-btn" data-content="${encodeURIComponent(f.content)}" data-title="${title}">
          Voir détails
        </button>
      </div>`;

    // tri logique
    if (f.type === "incident") {
      if (status === "resolved") hist.innerHTML += html;
      else inc.innerHTML += html;
    } else if (f.type === "maintenance") {
      if (status === "done") hist.innerHTML += html;
      else main.innerHTML += html;
    }
  });

  // activer les boutons détails
  document.querySelectorAll(".details-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const content = decodeURIComponent(btn.dataset.content);
      const title = btn.dataset.title;
      openPopup(title, content);
    });
  });
}

// Popup
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

// Tabs
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

loadAll();

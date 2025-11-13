async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Impossible de charger " + path);
  return response.json();
}

async function fetchMarkdown(path) {
  const res = await fetch(path);
  return await res.text();
}

function parseMarkdown(md) {
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
    const html = `<div class="card">
      <h3>${f.meta.title}</h3>
      <p>${f.meta.date || ""}</p>
      <a href="${f.path}" target="_blank">Détails</a>
    </div>`;

    const st = (f.meta.status || "").toLowerCase();
    if (f.type === "incident") {
      if (st === "ongoing") inc.innerHTML += html;
      else hist.innerHTML += html;
    } else if (f.type === "maintenance") {
      if (st === "planned") main.innerHTML += html;
      else hist.innerHTML += html;
    }
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

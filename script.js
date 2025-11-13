// Gestion des onglets
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    const target = button.dataset.tab;
    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.remove("active");
    });
    document.getElementById(target).classList.add("active");
  });
});

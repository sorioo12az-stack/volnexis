  const buttons = document.querySelectorAll("[data-page]");
  const title = document.getElementById("page-title");
  const message = document.getElementById("page-message");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;
      title.textContent = page === "ホーム" ? "ダッシュボード" : page;
      document.querySelectorAll("nav button").forEach(b => {
        b.classList.toggle("active", b.dataset.page === page);
      });
      message.style.display = page === "ホーム" ? "none" : "block";
      message.textContent = page + " モジュールの準備を進めていきます。";
    });
  });


// ==========================================
// VOLNEXIS - Player Management v1
// ==========================================

const STORAGE_KEY = "volnexis_players_v1";

const buttons = document.querySelectorAll("[data-page]");
const title = document.getElementById("page-title");
const message = document.getElementById("page-message");

const dashboardElements = [
  document.querySelector(".welcome"),
  ...document.querySelectorAll("main > .section-title"),
  document.querySelector(".stats"),
  document.querySelector(".features")
];

let players = loadPlayers();
let editingId = null;

// ---------- Data storage ----------

function loadPlayers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("選手データの読み込みに失敗:", error);
    return [];
  }
}

function savePlayers() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    return true;
  } catch (error) {
    console.error("選手データの保存に失敗:", error);
    alert("保存できませんでした。ブラウザの保存容量を確認してください。");
    return false;
  }
}

// ---------- Utilities ----------

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function createId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ---------- Navigation ----------

function showDashboard() {
  dashboardElements.forEach(element => {
    if (element) element.style.display = "";
  });

  message.style.display = "none";
  title.textContent = "ダッシュボード";
}

function showPlaceholder(page) {
  dashboardElements.forEach(element => {
    if (element) element.style.display = "none";
  });

  title.textContent = page;
  message.style.display = "block";
  message.textContent = `${page} は今後実装予定です。`;
}

function showPlayers() {
  dashboardElements.forEach(element => {
    if (element) element.style.display = "none";
  });

  title.textContent = "選手管理";
  message.style.display = "block";
  renderPlayerManagement();
}

// ---------- Player management ----------

function renderPlayerManagement() {
  message.innerHTML = `
    <div class="player-module">
      <div class="player-module-header">
        <div>
          <h2>PLAYER MANAGEMENT</h2>
          <p>選手の登録・編集・削除を管理します。</p>
        </div>
        <div class="player-count">
          登録選手 <strong>${players.length}</strong> 人
        </div>
      </div>

      <form id="player-form" class="player-form">
        <h3>${editingId ? "選手情報を編集" : "新しい選手を登録"}</h3>

        <div class="player-form-grid">
          <label>
            名前
            <input id="player-name" type="text"
              maxlength="30" placeholder="例：山田 太郎" required>
          </label>

          <label>
            背番号
            <input id="player-number" type="number"
              min="0" max="99" placeholder="例：10" required>
          </label>

          <label>
            ポジション
            <select id="player-position" required>
              <option value="">選択してください</option>
              <option value="OH">OH</option>
              <option value="OP">OP</option>
              <option value="MB">MB</option>
              <option value="S">S</option>
              <option value="L">L</option>
              <option value="その他">その他</option>
            </select>
          </label>
        </div>

        <div class="player-form-actions">
          <button type="submit" class="player-primary">
            ${editingId ? "変更を保存" : "選手を登録"}
          </button>
          ${editingId ? `
            <button type="button" id="cancel-edit" class="player-secondary">
              キャンセル
            </button>` : ""}
        </div>
      </form>

      <div class="player-list-header">
        <h3>登録選手一覧</h3>
        <input id="player-search" type="search"
          placeholder="名前・背番号で検索">
      </div>

      <div id="player-list"></div>
    </div>
  `;

  const form = document.getElementById("player-form");

  form.addEventListener("submit", handlePlayerSubmit);

  const cancelButton = document.getElementById("cancel-edit");
  if (cancelButton) {
    cancelButton.addEventListener("click", cancelEdit);
  }

  document.getElementById("player-search")
    .addEventListener("input", renderPlayerList);

  renderPlayerList();

  if (editingId) {
    const player = players.find(item => item.id === editingId);
    if (player) {
      document.getElementById("player-name").value = player.name;
      document.getElementById("player-number").value = player.number;
      document.getElementById("player-position").value = player.position;
    }
  }

  // Player management styles
  if (!document.getElementById("player-module-styles")) {
    const style = document.createElement("style");
    style.id = "player-module-styles";
    style.textContent = `
      .player-module { color: var(--text); }
      .player-module-header, .player-list-header {
        display: flex; justify-content: space-between;
        align-items: center; gap: 15px; flex-wrap: wrap;
      }
      .player-module-header h2 { margin: 0 0 8px; font-size: 19px; }
      .player-module p { color: var(--muted); font-size: 13px; }
      .player-count { color: var(--muted); }
      .player-count strong { color: var(--green); font-size: 24px; }
      .player-form {
        margin: 22px 0; padding: 20px;
        background: var(--panel); border: 1px solid var(--line);
        border-radius: 12px;
      }
      .player-form h3, .player-list-header h3 { margin-top: 0; }
      .player-form-grid {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      .player-form label {
        display: flex; flex-direction: column; gap: 8px;
        font-size: 13px; color: var(--muted);
      }
      .player-form input, .player-form select, #player-search {
        width: 100%; min-width: 0; padding: 12px;
        color: var(--text); background: #0b1424;
        border: 1px solid var(--line); border-radius: 8px;
      }
      .player-form-actions { display: flex; gap: 10px; margin-top: 18px; }
      .player-primary, .player-secondary, .player-action {
        padding: 10px 16px; border: 0; border-radius: 8px;
        cursor: pointer; font-weight: bold;
      }
      .player-primary { background: var(--green); color: #101a2c; }
      .player-secondary { background: var(--panel2); color: var(--text); }
      .player-list-header { margin: 25px 0 14px; }
      #player-search { max-width: 240px; }
      .player-table-wrap { overflow-x: auto; }
      .player-table {
        width: 100%; border-collapse: collapse;
        background: var(--panel); border-radius: 10px;
        overflow: hidden;
      }
      .player-table th, .player-table td {
        padding: 14px; text-align: left;
        border-bottom: 1px solid var(--line); white-space: nowrap;
      }
      .player-table th { color: var(--muted); font-size: 12px; }
      .player-table td { font-size: 13px; }
      .player-action { margin-right: 5px; padding: 7px 10px; }
      .edit-player { background: #19395d; color: white; }
      .delete-player { background: #542630; color: white; }
      .player-empty {
        padding: 25px; text-align: center;
        color: var(--muted); background: var(--panel);
        border-radius: 10px;
      }
      @media(max-width: 650px) {
        .player-form-grid { grid-template-columns: 1fr; }
        .player-form { padding: 14px; }
      }
    `;
    document.head.appendChild(style);
  }
}

function handlePlayerSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("player-name").value.trim();
  const number = Number(document.getElementById("player-number").value);
  const position = document.getElementById("player-position").value;

  if (!name || !Number.isInteger(number) || number < 0 || number > 99 || !position) {
    alert("名前・背番号・ポジションを正しく入力してください。");
    return;
  }

  const duplicate = players.some(player =>
    player.number === number && player.id !== editingId
  );

  if (duplicate) {
    alert("その背番号はすでに登録されています。");
    return;
  }

  if (editingId) {
    players = players.map(player =>
      player.id === editingId
        ? { ...player, name, number, position }
        : player
    );
  } else {
    players.push({
      id: createId(),
      name,
      number,
      position,
      createdAt: new Date().toISOString()
    });
  }

  if (!savePlayers()) return;

  editingId = null;
  renderPlayerManagement();
}

function renderPlayerList() {
  const container = document.getElementById("player-list");
  if (!container) return;

  const keyword = document.getElementById("player-search")
    .value.trim().toLowerCase();

  const filtered = players
    .filter(player =>
      player.name.toLowerCase().includes(keyword) ||
      String(player.number).includes(keyword) ||
      player.position.toLowerCase().includes(keyword)
    )
    .sort((a, b) => a.number - b.number);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="player-empty">
        ${players.length === 0
          ? "まだ選手が登録されていません。上のフォームから登録してください。"
          : "検索条件に合う選手はいません。"}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="player-table-wrap">
      <table class="player-table">
        <thead>
          <tr>
            <th>背番号</th>
            <th>名前</th>
            <th>ポジション</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(player => `
            <tr>
              <td>#${escapeHTML(player.number)}</td>
              <td>${escapeHTML(player.name)}</td>
              <td>${escapeHTML(player.position)}</td>
              <td>
                <button class="player-action edit-player"
                  data-edit="${escapeHTML(player.id)}">編集</button>
                <button class="player-action delete-player"
                  data-delete="${escapeHTML(player.id)}">削除</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll("[data-edit]").forEach(button => {
    button.addEventListener("click", () => {
      editingId = button.dataset.edit;
      renderPlayerManagement();
    });
  });

  container.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => {
      deletePlayer(button.dataset.delete);
    });
  });
}

function cancelEdit() {
  editingId = null;
  renderPlayerManagement();
}

function deletePlayer(id) {
  const player = players.find(item => item.id === id);
  if (!player) return;

  if (!confirm(`${player.name} を削除しますか？`)) return;

  players = players.filter(item => item.id !== id);

  if (!savePlayers()) return;

  if (editingId === id) editingId = null;
  renderPlayerManagement();
}

// ---------- Main menu events ----------

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;

    document.querySelectorAll("nav button").forEach(item => {
      item.classList.toggle("active", item.dataset.page === page);
    });

    if (page === "ホーム") {
      showDashboard();
    } else if (page === "選手管理") {
      editingId = null;
      showPlayers();
    } else {
      showPlaceholder(page);
    }
  });
});

// Home is displayed when the app opens.
showDashboard();

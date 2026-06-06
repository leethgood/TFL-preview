const {
  sampleMatchData,
  samplePlayers,
  sampleBenchPlayers,
  sampleEvents,
  sampleStats,
  sampleTactics,
} = window.TFL_SAMPLE_DATA;

const state = {
  activeTab: "live",
  eventIndex: 0,
  playing: false,
  timer: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function playerById(id) {
  return samplePlayers.find((player) => player.id === id);
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function renderScoreboard(event) {
  setText("#homeTeamName", sampleMatchData.homeTeam.name);
  setText("#awayTeamName", sampleMatchData.awayTeam.name);
  setText("#homeFormation", sampleMatchData.homeTeam.formation);
  setText("#awayFormation", sampleMatchData.awayTeam.formation);
  setText("#homeScore", event.score[0]);
  setText("#awayScore", event.score[1]);
  setText("#matchClock", event.clock);
  setText("#matchStatus", sampleMatchData.status);
}

function setActiveTab(tabName) {
  state.activeTab = tabName;

  $$(".game-tabs button").forEach((button) => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  $$(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });
}

function getEvent() {
  return sampleEvents[state.eventIndex];
}

function restartElementAnimation(element) {
  if (!element) return;
  element.style.animation = "none";
  element.offsetHeight;
  element.style.animation = "";
}

function renderPitch(event) {
  const pitch = $("#pitchStage");
  const routePath = $("#routePath");
  const focusZone = $("#focusZone");
  const actors = $("#pitchActors");
  const ball = $("#ball");
  const routeSpark = $("#routeSpark");

  pitch.dataset.event = event.id;
  pitch.style.setProperty("--ball-from-x", `${event.ballFrom[0]}%`);
  pitch.style.setProperty("--ball-from-y", `${event.ballFrom[1]}%`);
  pitch.style.setProperty("--ball-to-x", `${event.ballTo[0]}%`);
  pitch.style.setProperty("--ball-to-y", `${event.ballTo[1]}%`);
  pitch.style.setProperty("--zone-x", `${event.zone[0]}%`);
  pitch.style.setProperty("--zone-y", `${event.zone[1]}%`);
  pitch.style.setProperty("--zone-w", `${event.zone[2]}%`);
  pitch.style.setProperty("--zone-h", `${event.zone[3]}%`);

  routePath.setAttribute("d", event.routePath);
  focusZone.setAttribute("aria-label", event.subtitle);
  routeSpark.style.left = `${event.ballTo[0]}%`;
  routeSpark.style.top = `${event.ballTo[1]}%`;

  actors.innerHTML = event.actors
    .map((actor) => {
      const player = playerById(actor.playerId);
      const core = actor.core;
      const keeper = actor.keeper ? " keeper" : "";
      const team = player.team;

      if (core) {
        return `
          <article class="actor ${team}${keeper}" style="--x:${actor.x}%; --y:${actor.y}%">
            <div class="actor-card">
              <b>${player.label}</b>
              <small>${actor.role} / ${player.position}</small>
            </div>
          </article>
        `;
      }

      return `
        <span class="actor ${team}${keeper}" style="--x:${actor.x}%; --y:${actor.y}%">
          <span class="pawn">${player.number}</span>
          <span class="actor-role">${actor.role}</span>
        </span>
      `;
    })
    .join("");

  restartElementAnimation(ball);
  restartElementAnimation(routePath);
  restartElementAnimation(routeSpark);
  restartElementAnimation(focusZone);
}

function renderFocusCards(event) {
  $("#focusCards").innerHTML = event.actors
    .map((actor) => {
      const player = playerById(actor.playerId);
      const coreLabel = actor.core ? "핵심" : "보조";

      return `
        <article class="focus-card ${player.team}">
          <b>${player.label}</b>
          <span>${actor.role} · ${player.position}</span>
          <em>${coreLabel}</em>
        </article>
      `;
    })
    .join("");
}

function renderEventButtons() {
  $("#eventButtons").innerHTML = sampleEvents
    .map((event, index) => `
      <button type="button" data-event-index="${index}" class="${index === state.eventIndex ? "active" : ""}">
        ${event.type}
      </button>
    `)
    .join("");
}

function renderBroadcast() {
  $("#broadcastList").innerHTML = sampleEvents
    .map((event, index) => `
      <li class="${index === state.eventIndex ? "active" : ""}">
        <time>${event.time}</time>
        <span>${event.commentary}</span>
      </li>
    `)
    .join("");
}

function renderTimeline() {
  $("#eventTimeline").innerHTML = sampleEvents
    .map((event, index) => `
      <button type="button" data-event-index="${index}" class="${index === state.eventIndex ? "active" : ""}">
        <b>${event.time}</b>
        ${event.type}
        <span>${event.badge}</span>
      </button>
    `)
    .join("");
}

function statLabel(key) {
  const labels = {
    possession: "점유율",
    shots: "슈팅",
    shotsOnTarget: "유효슈팅",
    chances: "찬스",
    saves: "선방",
  };
  return labels[key] || key;
}

function renderStats(targetSelector) {
  const rows = ["possession", "shots", "shotsOnTarget", "chances", "saves"];
  $(targetSelector).innerHTML = rows
    .map((key) => {
      const [home, away] = sampleStats[key];
      const width = Math.round((home / Math.max(home + away, 1)) * 100);
      return `
        <div class="stat-row">
          <b>${statLabel(key)}</b>
          <span>${home}</span>
          <i><em style="width:${width}%"></em></i>
          <span>${away}</span>
        </div>
      `;
    })
    .join("");
}

function renderLive() {
  const event = getEvent();
  renderScoreboard(event);
  renderPitch(event);
  renderFocusCards(event);
  renderEventButtons();
  renderBroadcast();
  renderTimeline();
  renderStats("#liveStats");
  setText("#focusSubtitle", event.subtitle);
  setText("#eventBadge", event.badge);
}

function renderSquad() {
  $("#formationBoard").innerHTML = samplePlayers
    .filter((player) => player.team === "home")
    .map((player) => `
      <span class="formation-slot" style="left:${player.formation[0]}%; top:${player.formation[1]}%">
        ${player.position}
      </span>
    `)
    .join("");

  $("#playerStatusTable").innerHTML = `
    <div class="table-row head"><span>POS</span><span>체력</span><span>컨디션</span><span>상태</span><span>집중</span></div>
    ${samplePlayers
      .filter((player) => player.team === "home")
      .map((player) => `
        <div class="table-row">
          <span>${player.label}</span>
          <meter value="${player.stamina}" max="100"></meter>
          <b>${player.condition}</b>
          <i class="${player.status.includes("위험") ? "risk" : ""}">${player.status}</i>
          <strong>${player.focus}</strong>
        </div>
      `)
      .join("")}
  `;

  setText("#subsLeft", `남은 교체 ${sampleMatchData.substitutionsLeft}회`);
  $("#benchList").innerHTML = sampleBenchPlayers
    .map((player) => `
      <article>
        <b>${player.label}</b>
        <span>${player.position}</span>
        <em>체력 ${player.stamina} · ${player.status}</em>
      </article>
    `)
    .join("");
}

function renderTactics() {
  setText("#tacticName", sampleTactics.name);
  $("#tacticSliders").innerHTML = sampleTactics.sliders
    .map((slider) => `
      <label>
        ${slider.label}
        <input type="range" value="${slider.value}" disabled />
        <span>${slider.value}</span>
      </label>
    `)
    .join("");

  $("#directionButtons").innerHTML = sampleTactics.directions
    .map((direction) => `
      <button type="button" class="${direction === sampleTactics.activeDirection ? "active" : ""}">
        ${direction}
      </button>
    `)
    .join("");

  $("#tacticGauge").style.width = `${sampleTactics.gauge}%`;
  $("#tacticSummary").innerHTML = sampleTactics.summary
    .map(([label, value]) => `<p><b>${label}</b><span>${value}</span></p>`)
    .join("");
  $("#skillList").innerHTML = sampleTactics.skills
    .map((skill) => `
      <article>
        <b>${skill.name}</b>
        <span class="${skill.cooldown === "READY" ? "ready" : ""}">${skill.cooldown}</span>
      </article>
    `)
    .join("");
}

function renderAnalysis() {
  renderStats("#analysisStats");

  $("#playerStatsTable").innerHTML = `
    <div class="table-row head"><span>POS</span><span>평점</span><span>슈팅</span><span>찬스</span><span>상태</span></div>
    ${sampleStats.playerStats
      .map((player) => `
        <div class="table-row">
          <span>${player.label}</span>
          <b>${player.rating}</b>
          <em>${player.shots}</em>
          <strong>${player.chances}</strong>
          <i>${player.status}</i>
        </div>
      `)
      .join("")}
  `;

  $("#directionMap").innerHTML = `
    <span class="left">좌 ${sampleStats.direction.left}%</span>
    <span class="middle">중앙 ${sampleStats.direction.middle}%</span>
    <span class="right">우 ${sampleStats.direction.right}%</span>
  `;

  $("#momentumChart").innerHTML = sampleStats.momentum
    .map((value) => `<i style="height:${value}%"></i>`)
    .join("");

  $("#analysisEvents").innerHTML = sampleEvents
    .map((event) => `
      <article>
        <b>${event.time}</b>
        <span>${event.type}</span>
      </article>
    `)
    .join("");
}

function setEvent(index) {
  state.eventIndex = (index + sampleEvents.length) % sampleEvents.length;
  renderLive();
}

function togglePlay() {
  state.playing = !state.playing;
  setText("#togglePlay", state.playing ? "정지" : "재생");

  if (state.playing) {
    state.timer = window.setInterval(() => {
      setEvent(state.eventIndex + 1);
    }, 2100);
  } else {
    window.clearInterval(state.timer);
  }
}

function bindEvents() {
  $$(".game-tabs button").forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  document.addEventListener("click", (event) => {
    const eventButton = event.target.closest("[data-event-index]");
    if (!eventButton) return;
    setEvent(Number(eventButton.dataset.eventIndex));
  });

  $("#prevEvent").addEventListener("click", () => setEvent(state.eventIndex - 1));
  $("#nextEvent").addEventListener("click", () => setEvent(state.eventIndex + 1));
  $("#togglePlay").addEventListener("click", togglePlay);
}

function init() {
  renderLive();
  renderSquad();
  renderTactics();
  renderAnalysis();
  bindEvents();
}

init();

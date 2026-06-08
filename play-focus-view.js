"use strict";

const ANCHOR_SLOTS = Object.freeze({
  leftWide: { x: 22, y: 28 },
  rightWide: { x: 78, y: 72 },
  rightMid: { x: 64, y: 62 },
  rightHigh: { x: 75, y: 48 },
  rightDefensive: { x: 58, y: 78 },
  centerDefensive: { x: 48, y: 72 },
  centerMid: { x: 48, y: 54 },
  centerHigh: { x: 54, y: 38 },
  boxLeft: { x: 60, y: 28 },
  boxCenter: { x: 70, y: 46 },
  boxRight: { x: 72, y: 62 },
  goalKeeper: { x: 88, y: 50 },
  goalMouth: { x: 93, y: 50 },
});

const EVENT_TYPE_LABELS = Object.freeze({
  ATTACK_CREATED: "공격 시작",
  CHANCE_CREATED: "기회 생성",
  DRIBBLE: "드리블",
  TACKLE: "태클",
  SHORT_PASS: "짧은 패스",
  CROSS: "크로스",
  SHOT: "슈팅",
  SHOT_ON_TARGET: "유효 슈팅",
  SAVE: "선방",
  GOAL: "골",
  FOUL: "파울",
});

const MATCH_STATUS_LABELS = Object.freeze({
  LIVE: "진행 중",
  READY: "대기",
  FINISHED: "종료",
});

const MATCH_PHASE_LABELS = Object.freeze({
  FIRST_HALF: "전반",
  SECOND_HALF: "후반",
});

const PATH_STYLE_LABELS = Object.freeze({
  DIRECT_CARRY: "직선 드리블",
  CONTACT_WIN: "태클 후 소유권 전환",
  STRAIGHT_PASS: "짧은 직선 패스",
  ARC_DELIVERY: "휘어지는 크로스",
  DIRECT_SHOT: "직선 슈팅",
  DIRECT_FINISH: "득점 마무리",
});

const STAT_ROWS = Object.freeze([
  Object.freeze({ key: "possession", label: "점유율", home: "possession", away: "possession", suffix: "%" }),
  Object.freeze({ key: "shots", label: "슈팅", home: "shots", away: "shots" }),
  Object.freeze({ key: "shotsOnTarget", label: "유효 슈팅", home: "shotsOnTarget", away: "shotsOnTarget" }),
  Object.freeze({ key: "chances", label: "기회", home: "chances", away: "chances" }),
  Object.freeze({ key: "saves", label: "선방", home: "saves", away: "saves" }),
]);

function getAnchor(slot) {
  return ANCHOR_SLOTS[slot] || ANCHOR_SLOTS.centerMid;
}

function calculatePathStyle(startSlot, endSlot) {
  const start = getAnchor(startSlot);
  const end = getAnchor(endSlot);
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

  return {
    left: `${start.x}%`,
    top: `${start.y}%`,
    width: `${distance}%`,
    transform: `rotate(${angle}deg)`,
    "--path-width": `${distance}%`,
    "--path-angle": `${angle}deg`,
  };
}

function formatTimelineLabel(item) {
  return `${item.matchClock} ${EVENT_TYPE_LABELS[item.eventType] || item.eventType}`;
}

function getTimelineItemsForScene(scene, timelineItems) {
  const ids = new Set(scene.timeline);
  return timelineItems.filter(
    (item) => ids.has(item.eventId) || item.eventId === scene.eventId
  );
}

function getEventById(events, eventId) {
  return events.find((event) => event.eventId === eventId) || events[0];
}

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  return element;
}

function setSlotStyle(element, slot) {
  const anchor = getAnchor(slot);
  element.style.left = `${anchor.x}%`;
  element.style.top = `${anchor.y}%`;
}

function setBallTravelStyle(element, startSlot, endSlot) {
  const start = getAnchor(startSlot);
  const end = getAnchor(endSlot);
  element.style.setProperty("--ball-start-x", `${start.x}%`);
  element.style.setProperty("--ball-start-y", `${start.y}%`);
  element.style.setProperty("--ball-end-x", `${end.x}%`);
  element.style.setProperty("--ball-end-y", `${end.y}%`);
  element.style.left = `${end.x}%`;
  element.style.top = `${end.y}%`;
}

function renderMainPlayer(event) {
  const card = createElement("article", `player-card ${event.teamSide.toLowerCase()}`);
  card.innerHTML = `
    <span class="card-role">${event.actor.role}</span>
    <strong>${event.actor.displayName}</strong>
    <span>#${event.actor.number} ${event.actor.position}</span>
  `;
  return card;
}

function renderMiniPlayer(player, label) {
  const card = createElement("article", `mini-card ${player.teamSide.toLowerCase()}`);
  card.innerHTML = `
    <span>${label}</span>
    <strong>${player.displayName}</strong>
    <small>#${player.number} ${player.position}</small>
  `;
  return card;
}

function renderMarker(player, slot, index) {
  const marker = createElement(
    "div",
    `player-marker ${player.teamSide.toLowerCase()}`,
    String(player.number)
  );
  marker.title = `${player.displayName} ${player.role}`;
  setSlotStyle(marker, slot);
  marker.style.setProperty("--marker-delay", `${index * 80}ms`);
  return marker;
}

function renderTarget(event) {
  const target = event.target;
  if (target.number) {
    return renderMiniPlayer(target, "대상");
  }

  const card = createElement("article", "target-zone");
  card.innerHTML = `
    <span>대상</span>
    <strong>${target.label}</strong>
    <small>${target.role}</small>
  `;
  return card;
}

function renderPitch(event, root) {
  const pitch = root.querySelector("[data-pitch]");
  const overlay = root.querySelector("[data-pitch-overlay]");
  pitch.dataset.effect = event.displayHint.pitchEffect;
  overlay.replaceChildren();

  const path = createElement(
    "div",
    `ball-path ${event.ballPath.pathStyle.toLowerCase().replaceAll("_", "-")}`
  );
  const pathStyle = calculatePathStyle(
    event.layout.ballStartSlot,
    event.layout.ballEndSlot
  );
  path.style.left = pathStyle.left;
  path.style.top = pathStyle.top;
  path.style.width = pathStyle.width;
  path.style.setProperty("--path-width", pathStyle.width);
  path.style.setProperty("--path-angle", pathStyle["--path-angle"]);
  overlay.append(path);

  const ball = createElement("div", "ball", "");
  setBallTravelStyle(ball, event.layout.ballStartSlot, event.layout.ballEndSlot);
  overlay.append(ball);

  const actor = renderMarker(event.actor, event.layout.actorSlot, 0);
  actor.classList.add("actor-marker");
  overlay.append(actor);

  if (event.target.number) {
    const target = renderMarker(event.target, event.layout.targetSlot, 1);
    target.classList.add("target-marker");
    overlay.append(target);
  } else {
    const targetZone = createElement("div", "zone-marker", event.target.label);
    setSlotStyle(targetZone, event.layout.targetSlot);
    overlay.append(targetZone);
  }

  event.supporters.forEach((supporter, index) => {
    const slot = event.layout.supporterSlots[index] || "centerMid";
    const marker = renderMarker(supporter, slot, index + 2);
    marker.classList.add("supporter-marker");
    overlay.append(marker);
  });
}

function renderTimeline(event, timelineItems, root) {
  const list = root.querySelector("[data-timeline]");
  const activeIds = new Set(event.timeline.concat(event.eventId));

  list.replaceChildren(
    ...timelineItems.map((item) => {
      const row = createElement("button", "timeline-item");
      row.type = "button";
      row.dataset.eventId = item.eventId;
      row.dataset.importance = item.importance;
      if (activeIds.has(item.eventId)) {
        row.classList.add("active");
      }
      row.innerHTML = `
        <span>${formatTimelineLabel(item)}</span>
        <strong>${item.label}</strong>
      `;
      return row;
    })
  );
}

function renderCommentary(event, timelineItems, root) {
  const list = root.querySelector("[data-commentary]");
  const items = getTimelineItemsForScene(event, timelineItems);
  list.replaceChildren(
    ...items.map((item) => {
      const row = createElement("li", "commentary-item");
      if (item.eventId === event.eventId) {
        row.classList.add("active");
      }
      row.innerHTML = `
        <span>${item.matchClock}</span>
        <p>${item.label}</p>
      `;
      return row;
    })
  );
}

function renderStats(event, stats, root) {
  const list = root.querySelector("[data-stats]");
  const changedKeys = new Set(event.statEffect.changedKeys || []);

  list.replaceChildren(
    ...STAT_ROWS.map((stat) => {
      const row = createElement("li", "stat-row");
      if (changedKeys.has(stat.key)) {
        row.classList.add("changed");
      }
      const home = `${stats.home[stat.home]}${stat.suffix || ""}`;
      const away = `${stats.away[stat.away]}${stat.suffix || ""}`;
      row.innerHTML = `
        <span>${home}</span>
        <strong>${stat.label}</strong>
        <span>${away}</span>
      `;
      return row;
    })
  );
}

function renderScene(index, state) {
  const event = state.events[index];
  state.currentIndex = index;

  state.root.querySelector("[data-clock]").textContent = event.matchClock;
  state.root.querySelector("[data-phase]").textContent =
    MATCH_PHASE_LABELS[state.match.phase] || state.match.phase;
  state.root.querySelector("[data-status]").textContent =
    MATCH_STATUS_LABELS[state.match.status] || state.match.status;
  state.root.querySelector("[data-route]").textContent = event.routeLabel;
  state.root.querySelector("[data-event-type]").textContent =
    EVENT_TYPE_LABELS[event.eventType] || event.eventType;
  state.root.querySelector("[data-commentary-lead]").textContent = event.commentary;
  state.root.querySelector("[data-stat-effect]").textContent = event.statEffect.label;
  state.root.querySelector("[data-ball-path]").textContent = [
    PATH_STYLE_LABELS[event.ballPath.pathStyle] || event.ballPath.pathStyle,
    event.ballPath.zoneHint,
    event.ballPath.timingHint,
  ].join(" / ");

  const actorPanel = state.root.querySelector("[data-actor-panel]");
  actorPanel.replaceChildren(renderMainPlayer(event));

  const targetPanel = state.root.querySelector("[data-target-panel]");
  targetPanel.replaceChildren(renderTarget(event));

  const supportersPanel = state.root.querySelector("[data-supporters-panel]");
  supportersPanel.replaceChildren(
    ...event.supporters.map((supporter) =>
      renderMiniPlayer(supporter, supporter.role)
    )
  );

  renderPitch(event, state.root);
  renderTimeline(event, state.timelineItems, state.root);
  renderCommentary(event, state.timelineItems, state.root);
  renderStats(event, state.stats, state.root);
  state.root.dataset.sceneStep = String(index);

  state.root.querySelectorAll("[data-event-button]").forEach((button) => {
    button.classList.toggle("active", button.dataset.eventId === event.eventId);
  });
}

function bindControls(state) {
  state.root.querySelector("[data-prev]").addEventListener("click", () => {
    const nextIndex =
      (state.currentIndex - 1 + state.events.length) % state.events.length;
    renderScene(nextIndex, state);
  });

  state.root.querySelector("[data-next]").addEventListener("click", () => {
    const nextIndex = (state.currentIndex + 1) % state.events.length;
    renderScene(nextIndex, state);
  });

  state.root.querySelector("[data-replay]").addEventListener("click", () => {
    renderScene(0, state);
  });

  state.root.querySelector("[data-play]").addEventListener("click", (event) => {
    state.isPlaying = !state.isPlaying;
    event.currentTarget.textContent = state.isPlaying ? "일시정지" : "재생";
    if (state.isPlaying) {
      state.timer = window.setInterval(() => {
        renderScene((state.currentIndex + 1) % state.events.length, state);
      }, state.speed);
    } else {
      window.clearInterval(state.timer);
    }
  });

  state.root.querySelector("[data-speed]").addEventListener("change", (event) => {
    state.speed = Number(event.target.value);
    if (state.isPlaying) {
      window.clearInterval(state.timer);
      state.timer = window.setInterval(() => {
        renderScene((state.currentIndex + 1) % state.events.length, state);
      }, state.speed);
    }
  });

  state.root.querySelector("[data-event-nav]").addEventListener("click", (event) => {
    const button = event.target.closest("[data-event-button]");
    if (!button) {
      return;
    }
    const nextEvent = getEventById(state.events, button.dataset.eventId);
    renderScene(state.events.indexOf(nextEvent), state);
  });

  state.root.querySelector("[data-timeline]").addEventListener("click", (event) => {
    const row = event.target.closest("[data-event-id]");
    if (!row) {
      return;
    }
    const linkedScene = state.events.find((scene) =>
      scene.timeline.includes(row.dataset.eventId)
    );
    if (linkedScene) {
      renderScene(state.events.indexOf(linkedScene), state);
    }
  });
}

function renderEventNavigation(events, root) {
  const nav = root.querySelector("[data-event-nav]");
  nav.replaceChildren(
    ...events.map((event) => {
      const button = createElement(
        "button",
        "event-button",
        EVENT_TYPE_LABELS[event.eventType] || event.eventType
      );
      button.type = "button";
      button.dataset.eventButton = "true";
      button.dataset.eventId = event.eventId;
      return button;
    })
  );
}

function initializePlayFocusView(root, data) {
  const state = {
    root,
    match: data.sampleMatch,
    stats: data.sampleStats,
    events: data.sampleEvents,
    timelineItems: data.sampleTimeline,
    currentIndex: 0,
    isPlaying: false,
    speed: 2600,
    timer: null,
  };

  root.querySelector("[data-home-name]").textContent = data.sampleMatch.homeTeam.code;
  root.querySelector("[data-away-name]").textContent = data.sampleMatch.awayTeam.code;
  root.querySelector("[data-home-score]").textContent = data.sampleMatch.homeTeam.score;
  root.querySelector("[data-away-score]").textContent = data.sampleMatch.awayTeam.score;

  renderEventNavigation(state.events, root);
  bindControls(state);
  renderScene(0, state);

  return state;
}

const playFocusView = Object.freeze({
  ANCHOR_SLOTS,
  calculatePathStyle,
  EVENT_TYPE_LABELS,
  formatTimelineLabel,
  getTimelineItemsForScene,
  initializePlayFocusView,
});

if (typeof window !== "undefined") {
  window.playFocusView = playFocusView;

  window.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-play-focus-view]");
    if (root && window.playFocusViewSampleData) {
      initializePlayFocusView(root, window.playFocusViewSampleData);
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = playFocusView;
}

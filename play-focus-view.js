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
  };
}

function formatTimelineLabel(item) {
  return `${item.matchClock} ${item.eventType.replaceAll("_", " ")}`;
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
    return renderMiniPlayer(target, "Target");
  }

  const card = createElement("article", "target-zone");
  card.innerHTML = `
    <span>Target</span>
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
  Object.assign(
    path.style,
    calculatePathStyle(event.layout.ballStartSlot, event.layout.ballEndSlot)
  );
  overlay.append(path);

  const ball = createElement("div", "ball", "");
  setSlotStyle(ball, event.layout.ballEndSlot);
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
  const rows = [
    ["Possession", `${stats.home.possession}%`, `${stats.away.possession}%`],
    ["Shots", stats.home.shots, stats.away.shots],
    ["On Target", stats.home.shotsOnTarget, stats.away.shotsOnTarget],
    ["Chances", stats.home.chances, stats.away.chances],
    ["Saves", stats.home.saves, stats.away.saves],
  ];

  list.replaceChildren(
    ...rows.map(([label, home, away]) => {
      const row = createElement("li", "stat-row");
      if (event.statEffect.label.toLowerCase().includes(label.toLowerCase())) {
        row.classList.add("changed");
      }
      row.innerHTML = `
        <span>${home}</span>
        <strong>${label}</strong>
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
  state.root.querySelector("[data-phase]").textContent = state.match.phase.replace("_", " ");
  state.root.querySelector("[data-status]").textContent = state.match.status;
  state.root.querySelector("[data-route]").textContent = event.routeLabel;
  state.root.querySelector("[data-event-type]").textContent = event.eventType;
  state.root.querySelector("[data-commentary-lead]").textContent = event.commentary;
  state.root.querySelector("[data-stat-effect]").textContent = event.statEffect.label;
  state.root.querySelector("[data-ball-path]").textContent = [
    event.ballPath.pathStyle.replaceAll("_", " "),
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
    event.currentTarget.textContent = state.isPlaying ? "Pause" : "Play";
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
        event.eventType.replaceAll("_", " ")
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

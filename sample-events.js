"use strict";

const PITCH_SCENE_EVENT_TYPES = Object.freeze([
  "DRIBBLE",
  "TACKLE",
  "SHORT_PASS",
  "CROSS",
  "SHOT",
  "GOAL",
]);

const BROADCAST_TIMELINE_EVENT_TYPES = Object.freeze([
  "ATTACK_CREATED",
  "CHANCE_CREATED",
  "SHOT",
  "SHOT_ON_TARGET",
  "SAVE",
  "GOAL",
]);

const CONDITIONAL_TIMELINE_EVENT_TYPES = Object.freeze([
  "FOUL",
  "YELLOW_CARD",
  "INJURY",
  "TACTIC_CHANGE",
  "MANAGER_SKILL",
  "SUBSTITUTION",
]);

const sampleMatch = Object.freeze({
  matchId: "pfv-mvp-sample-match",
  status: "LIVE",
  phase: "SECOND_HALF",
  matchClock: "72:15",
  homeTeam: {
    code: "TFL HOME",
    color: "home",
    score: 2,
  },
  awayTeam: {
    code: "TFL AWAY",
    color: "away",
    score: 1,
  },
});

const sampleStats = Object.freeze({
  home: {
    possession: 54,
    shots: 8,
    shotsOnTarget: 4,
    chances: 5,
    saves: 2,
  },
  away: {
    possession: 46,
    shots: 6,
    shotsOnTarget: 3,
    chances: 3,
    saves: 3,
  },
});

function player(teamSide, number, position, label) {
  return Object.freeze({
    playerId: `${teamSide.toLowerCase()}-${number}`,
    teamSide,
    number,
    position,
    displayName: label,
  });
}

const samplePlayers = Object.freeze({
  home7: player("HOME", 7, "WM", "Home 7"),
  home8: player("HOME", 8, "CM", "Home 8"),
  home9: player("HOME", 9, "ST", "Home 9"),
  home10: player("HOME", 10, "AM", "Home 10"),
  home11: player("HOME", 11, "WM", "Home 11"),
  away1: player("AWAY", 1, "GK", "Away 1"),
  away3: player("AWAY", 3, "CB", "Away 3"),
  away4: player("AWAY", 4, "CB", "Away 4"),
  away5: player("AWAY", 5, "FB", "Away 5"),
  away6: player("AWAY", 6, "DM", "Away 6"),
  away8: player("AWAY", 8, "CM", "Away 8"),
  away9: player("AWAY", 9, "ST", "Away 9"),
});

function person(playerRef, role) {
  return Object.freeze({
    ...playerRef,
    role,
  });
}

function timelineItem(eventId, matchClock, eventType, label, importance) {
  return Object.freeze({
    eventId,
    matchClock,
    eventType,
    label,
    importance,
  });
}

const sampleTimeline = Object.freeze([
  timelineItem(
    "flow-071-attack",
    "71:45",
    "ATTACK_CREATED",
    "Home attack starts through the right lane.",
    "LOW"
  ),
  timelineItem(
    "scene-dribble",
    "72:15",
    "DRIBBLE",
    "Home 7 carries into space.",
    "MEDIUM"
  ),
  timelineItem(
    "scene-tackle",
    "72:45",
    "TACKLE",
    "Away 6 steps in and wins the challenge.",
    "MEDIUM"
  ),
  timelineItem(
    "scene-pass",
    "73:30",
    "SHORT_PASS",
    "Home 8 connects a short pass inside.",
    "MEDIUM"
  ),
  timelineItem(
    "flow-074-chance",
    "74:00",
    "CHANCE_CREATED",
    "The move becomes a clear chance.",
    "HIGH"
  ),
  timelineItem(
    "scene-cross",
    "74:10",
    "CROSS",
    "Home 11 bends a cross toward the box.",
    "HIGH"
  ),
  timelineItem(
    "scene-shot",
    "74:25",
    "SHOT",
    "Home 9 shoots toward the near post.",
    "HIGH"
  ),
  timelineItem(
    "result-shot-on-target",
    "74:26",
    "SHOT_ON_TARGET",
    "Shot on target.",
    "HIGH"
  ),
  timelineItem(
    "result-save",
    "74:27",
    "SAVE",
    "Away 1 makes the save.",
    "HIGH"
  ),
  timelineItem(
    "scene-goal",
    "78:00",
    "GOAL",
    "Home 10 scores.",
    "HIGHEST"
  ),
  timelineItem(
    "label-foul",
    "82:15",
    "FOUL",
    "Foul noted in the timeline only.",
    "LOW"
  ),
]);

const sampleEvents = Object.freeze([
  Object.freeze({
    eventId: "scene-dribble",
    sourceTick: 289,
    sequenceIndex: 0,
    eventType: "DRIBBLE",
    matchClock: "72:15",
    teamSide: "HOME",
    routeLabel: "Right channel carry",
    actor: person(samplePlayers.home7, "Ball carrier"),
    target: Object.freeze({
      role: "Forward space",
      label: "space ahead",
      slot: "rightChannelHigh",
    }),
    supporters: Object.freeze([
      person(samplePlayers.home8, "Passing option"),
      person(samplePlayers.away5, "Tracking defender"),
    ]),
    ballPath: Object.freeze({
      startRole: "actorFeet",
      endRole: "forwardSpace",
      pathStyle: "DIRECT_CARRY",
      zoneHint: "right channel",
      timingHint: "steady advance",
    }),
    displayHint: Object.freeze({
      focusMode: "actor-forward-space",
      marker: "ball-carrier",
      emphasis: "advance",
      pitchEffect: "progress-lane",
    }),
    commentary: "Home 7 drives forward with the ball and pulls the defense back.",
    timeline: Object.freeze(["flow-071-attack", "scene-dribble"]),
    statEffect: Object.freeze({
      type: "FLOW",
      label: "Attack flow continues",
    }),
    layout: Object.freeze({
      actorSlot: "rightMid",
      targetSlot: "rightHigh",
      supporterSlots: Object.freeze(["centerMid", "rightDefensive"]),
      ballStartSlot: "rightMid",
      ballEndSlot: "rightHigh",
    }),
  }),
  Object.freeze({
    eventId: "scene-tackle",
    sourceTick: 291,
    sequenceIndex: 0,
    eventType: "TACKLE",
    matchClock: "72:45",
    teamSide: "AWAY",
    routeLabel: "Defensive stop",
    actor: person(samplePlayers.away6, "Tackler"),
    target: person(samplePlayers.home7, "Ball carrier"),
    supporters: Object.freeze([
      person(samplePlayers.away4, "Cover defender"),
      person(samplePlayers.home8, "Nearby support"),
    ]),
    ballPath: Object.freeze({
      startRole: "targetFeet",
      endRole: "tacklerSide",
      pathStyle: "CONTACT_WIN",
      zoneHint: "right channel",
      timingHint: "instant turnover",
    }),
    displayHint: Object.freeze({
      focusMode: "duel",
      marker: "tackle",
      emphasis: "turnover",
      pitchEffect: "contact-burst",
    }),
    commentary: "Away 6 times the tackle and knocks the ball into the away lane.",
    timeline: Object.freeze(["scene-tackle"]),
    statEffect: Object.freeze({
      type: "FLOW",
      label: "Possession pressure changes",
    }),
    layout: Object.freeze({
      actorSlot: "rightDefensive",
      targetSlot: "rightMid",
      supporterSlots: Object.freeze(["boxRight", "centerMid"]),
      ballStartSlot: "rightMid",
      ballEndSlot: "rightDefensive",
    }),
  }),
  Object.freeze({
    eventId: "scene-pass",
    sourceTick: 294,
    sequenceIndex: 0,
    eventType: "SHORT_PASS",
    matchClock: "73:30",
    teamSide: "HOME",
    routeLabel: "Central connection",
    actor: person(samplePlayers.home8, "Passer"),
    target: person(samplePlayers.home10, "Receiver"),
    supporters: Object.freeze([
      person(samplePlayers.home9, "Forward option"),
      person(samplePlayers.away8, "Pressing marker"),
    ]),
    ballPath: Object.freeze({
      startRole: "actorFeet",
      endRole: "targetFeet",
      pathStyle: "STRAIGHT_PASS",
      zoneHint: "central lane",
      timingHint: "quick release",
    }),
    displayHint: Object.freeze({
      focusMode: "pass-link",
      marker: "pass",
      emphasis: "connection",
      pitchEffect: "pass-thread",
    }),
    commentary: "Home 8 plays a short pass into Home 10 between the lines.",
    timeline: Object.freeze(["scene-pass", "flow-074-chance"]),
    statEffect: Object.freeze({
      type: "FLOW",
      label: "Chance buildup",
    }),
    layout: Object.freeze({
      actorSlot: "centerMid",
      targetSlot: "centerHigh",
      supporterSlots: Object.freeze(["boxCenter", "centerDefensive"]),
      ballStartSlot: "centerMid",
      ballEndSlot: "centerHigh",
    }),
  }),
  Object.freeze({
    eventId: "scene-cross",
    sourceTick: 296,
    sequenceIndex: 0,
    eventType: "CROSS",
    matchClock: "74:10",
    teamSide: "HOME",
    routeLabel: "Wide delivery",
    actor: person(samplePlayers.home11, "Crosser"),
    target: person(samplePlayers.home9, "Box target"),
    supporters: Object.freeze([
      person(samplePlayers.away1, "Goalkeeper"),
      person(samplePlayers.away3, "Marker"),
      person(samplePlayers.away4, "Cover defender"),
    ]),
    ballPath: Object.freeze({
      startRole: "wideActor",
      endRole: "boxTarget",
      pathStyle: "ARC_DELIVERY",
      zoneHint: "left wing to box",
      timingHint: "early cross",
    }),
    displayHint: Object.freeze({
      focusMode: "wide-to-box",
      marker: "cross",
      emphasis: "box-entry",
      pitchEffect: "arc-delivery",
    }),
    commentary: "Home 11 whips the cross toward Home 9 as the goalkeeper shifts.",
    timeline: Object.freeze(["flow-074-chance", "scene-cross"]),
    statEffect: Object.freeze({
      type: "CHANCE",
      label: "Chance +1 hint",
    }),
    layout: Object.freeze({
      actorSlot: "leftWide",
      targetSlot: "boxCenter",
      supporterSlots: Object.freeze(["goalMouth", "boxLeft", "boxRight"]),
      ballStartSlot: "leftWide",
      ballEndSlot: "boxCenter",
    }),
  }),
  Object.freeze({
    eventId: "scene-shot",
    sourceTick: 297,
    sequenceIndex: 0,
    eventType: "SHOT",
    matchClock: "74:25",
    teamSide: "HOME",
    routeLabel: "Shot saved",
    actor: person(samplePlayers.home9, "Shooter"),
    target: Object.freeze({
      role: "Goal mouth",
      label: "near post",
      slot: "goalMouth",
    }),
    supporters: Object.freeze([
      person(samplePlayers.away1, "Goalkeeper"),
      person(samplePlayers.away3, "Close defender"),
    ]),
    ballPath: Object.freeze({
      startRole: "actorFeet",
      endRole: "goalMouth",
      pathStyle: "DIRECT_SHOT",
      zoneHint: "box to near post",
      timingHint: "first-time shot",
    }),
    displayHint: Object.freeze({
      focusMode: "shot-result",
      marker: "shot",
      emphasis: "on-target-save",
      pitchEffect: "goal-tension",
    }),
    commentary: "Home 9 hits the target, but Away 1 reacts and saves.",
    timeline: Object.freeze(["scene-shot", "result-shot-on-target", "result-save"]),
    statEffect: Object.freeze({
      type: "SHOT_SAVE",
      label: "Shots +1, on target +1, saves +1",
    }),
    layout: Object.freeze({
      actorSlot: "boxCenter",
      targetSlot: "goalMouth",
      supporterSlots: Object.freeze(["goalKeeper", "boxLeft"]),
      ballStartSlot: "boxCenter",
      ballEndSlot: "goalMouth",
    }),
  }),
  Object.freeze({
    eventId: "scene-goal",
    sourceTick: 312,
    sequenceIndex: 0,
    eventType: "GOAL",
    matchClock: "78:00",
    teamSide: "HOME",
    routeLabel: "Goal finish",
    actor: person(samplePlayers.home10, "Scorer"),
    target: Object.freeze({
      role: "Goal",
      label: "inside the far post",
      slot: "goalMouth",
    }),
    supporters: Object.freeze([person(samplePlayers.away1, "Goalkeeper")]),
    ballPath: Object.freeze({
      startRole: "actorFeet",
      endRole: "goal",
      pathStyle: "DIRECT_FINISH",
      zoneHint: "box to far post",
      timingHint: "decisive finish",
    }),
    displayHint: Object.freeze({
      focusMode: "goal-moment",
      marker: "goal",
      emphasis: "score-update",
      pitchEffect: "goal-flash",
    }),
    commentary: "Goal. Home 10 finishes low into the corner and the score changes.",
    timeline: Object.freeze(["scene-goal"]),
    statEffect: Object.freeze({
      type: "GOAL",
      label: "Score updates to 2-1",
    }),
    layout: Object.freeze({
      actorSlot: "boxRight",
      targetSlot: "goalMouth",
      supporterSlots: Object.freeze(["goalKeeper"]),
      ballStartSlot: "boxRight",
      ballEndSlot: "goalMouth",
    }),
  }),
]);

function isPitchSceneEventType(eventType) {
  return PITCH_SCENE_EVENT_TYPES.includes(eventType);
}

function isBroadcastTimelineEventType(eventType) {
  return BROADCAST_TIMELINE_EVENT_TYPES.includes(eventType);
}

function isConditionalTimelineEventType(eventType) {
  return CONDITIONAL_TIMELINE_EVENT_TYPES.includes(eventType);
}

function validateSampleEvent(event) {
  const requiredKeys = [
    "eventId",
    "sourceTick",
    "sequenceIndex",
    "eventType",
    "matchClock",
    "teamSide",
    "actor",
    "target",
    "supporters",
    "ballPath",
    "displayHint",
    "commentary",
    "timeline",
    "statEffect",
  ];

  return requiredKeys.every((key) => Object.hasOwn(event, key));
}

const playFocusViewSampleData = Object.freeze({
  sampleMatch,
  samplePlayers,
  sampleStats,
  sampleEvents,
  sampleTimeline,
  PITCH_SCENE_EVENT_TYPES,
  BROADCAST_TIMELINE_EVENT_TYPES,
  CONDITIONAL_TIMELINE_EVENT_TYPES,
  isPitchSceneEventType,
  isBroadcastTimelineEventType,
  isConditionalTimelineEventType,
  validateSampleEvent,
});

if (typeof window !== "undefined") {
  window.playFocusViewSampleData = playFocusViewSampleData;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = playFocusViewSampleData;
}

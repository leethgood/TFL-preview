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
    code: "TFL 홈",
    color: "home",
    score: 2,
  },
  awayTeam: {
    code: "TFL 원정",
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
  home7: player("HOME", 7, "WM", "홈 7번"),
  home8: player("HOME", 8, "CM", "홈 8번"),
  home9: player("HOME", 9, "ST", "홈 9번"),
  home10: player("HOME", 10, "AM", "홈 10번"),
  home11: player("HOME", 11, "WM", "홈 11번"),
  away1: player("AWAY", 1, "GK", "원정 1번"),
  away3: player("AWAY", 3, "CB", "원정 3번"),
  away4: player("AWAY", 4, "CB", "원정 4번"),
  away5: player("AWAY", 5, "FB", "원정 5번"),
  away6: player("AWAY", 6, "DM", "원정 6번"),
  away8: player("AWAY", 8, "CM", "원정 8번"),
  away9: player("AWAY", 9, "ST", "원정 9번"),
});

function person(playerRef, role) {
  return Object.freeze({
    ...playerRef,
    role,
  });
}

function timelineItem(
  eventId,
  matchClock,
  eventType,
  label,
  importance,
  sceneEventId,
  watchPoint
) {
  return Object.freeze({
    eventId,
    matchClock,
    eventType,
    label,
    importance,
    sceneEventId,
    watchPoint,
  });
}

const sampleTimeline = Object.freeze([
  timelineItem(
    "flow-071-attack",
    "71:45",
    "ATTACK_CREATED",
    "홈 팀 공격이 오른쪽 측면에서 시작됩니다.",
    "LOW",
    "scene-dribble",
    "공격 흐름이 어디에서 시작되고, 다음 드리블 장면으로 어떻게 연결되는지 확인하세요."
  ),
  timelineItem(
    "scene-dribble",
    "72:15",
    "DRIBBLE",
    "홈 7번이 빈 공간으로 드리블합니다.",
    "MEDIUM",
    "scene-dribble",
    "볼 운반 선수, 전방 빈 공간, 추격 수비의 위치를 확인하세요."
  ),
  timelineItem(
    "scene-tackle",
    "72:45",
    "TACKLE",
    "원정 6번이 태클로 공을 끊어냅니다.",
    "MEDIUM",
    "scene-tackle",
    "태클 actor와 볼 운반 target, 공 소유권이 바뀌는 지점을 확인하세요."
  ),
  timelineItem(
    "scene-pass",
    "73:30",
    "SHORT_PASS",
    "홈 8번이 중앙으로 짧은 패스를 연결합니다.",
    "MEDIUM",
    "scene-pass",
    "패스 actor에서 target으로 이어지는 짧은 공 이동선을 확인하세요."
  ),
  timelineItem(
    "flow-074-chance",
    "74:00",
    "CHANCE_CREATED",
    "공격 흐름이 득점 기회로 이어집니다.",
    "HIGH",
    "scene-cross",
    "찬스 발생은 별도 pitch 장면이 아니라 다음 크로스 장면의 위험도 힌트로 연결됩니다."
  ),
  timelineItem(
    "scene-cross",
    "74:10",
    "CROSS",
    "홈 11번이 박스 안으로 크로스를 올립니다.",
    "HIGH",
    "scene-cross",
    "측면 선수의 크로스, 박스 안 대상 선수, 골키퍼 반응을 확인하세요."
  ),
  timelineItem(
    "scene-shot",
    "74:25",
    "SHOT",
    "홈 9번이 가까운 골문 쪽으로 슛합니다.",
    "HIGH",
    "scene-shot",
    "슈터에서 골문으로 향하는 공 이동과 수비/골키퍼 위치를 확인하세요."
  ),
  timelineItem(
    "result-shot-on-target",
    "74:26",
    "SHOT_ON_TARGET",
    "유효 슈팅으로 기록됩니다.",
    "HIGH",
    "scene-shot",
    "유효 슈팅은 별도 pitch 장면이 아니라 슈팅 장면의 결과 힌트로 표시됩니다."
  ),
  timelineItem(
    "result-save",
    "74:27",
    "SAVE",
    "원정 1번 골키퍼가 선방합니다.",
    "HIGH",
    "scene-shot",
    "선방은 슈팅 장면의 결과와 기록 변화로 연결되는지 확인하세요."
  ),
  timelineItem(
    "scene-goal",
    "78:00",
    "GOAL",
    "홈 10번이 득점합니다.",
    "HIGHEST",
    "scene-goal",
    "득점 선수, 골문 target, 스코어 갱신 힌트가 함께 보이는지 확인하세요."
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
    routeLabel: "오른쪽 채널 드리블",
    actor: person(samplePlayers.home7, "볼 운반"),
    target: Object.freeze({
      role: "전방 공간",
      label: "앞쪽 빈 공간",
      slot: "rightChannelHigh",
    }),
    supporters: Object.freeze([
      person(samplePlayers.home8, "패스 선택지"),
      person(samplePlayers.away5, "추격 수비"),
    ]),
    ballPath: Object.freeze({
      startRole: "actorFeet",
      endRole: "forwardSpace",
      pathStyle: "DIRECT_CARRY",
      zoneHint: "오른쪽 채널",
      timingHint: "전진 드리블",
    }),
    displayHint: Object.freeze({
      focusMode: "actor-forward-space",
      marker: "ball-carrier",
      emphasis: "advance",
      pitchEffect: "progress-lane",
    }),
    commentary: "홈 7번이 공을 몰고 전진하며 수비 라인을 뒤로 밀어냅니다.",
    watchPoint: "볼 운반 선수, 전방 빈 공간, 추격 수비의 위치를 확인하세요.",
    timeline: Object.freeze(["flow-071-attack", "scene-dribble"]),
    statEffect: Object.freeze({
      type: "FLOW",
      label: "공격 흐름 유지",
      changedKeys: Object.freeze(["possession"]),
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
    routeLabel: "수비 차단",
    actor: person(samplePlayers.away6, "태클"),
    target: person(samplePlayers.home7, "볼 운반"),
    supporters: Object.freeze([
      person(samplePlayers.away4, "커버 수비"),
      person(samplePlayers.home8, "근처 지원"),
    ]),
    ballPath: Object.freeze({
      startRole: "targetFeet",
      endRole: "tacklerSide",
      pathStyle: "CONTACT_WIN",
      zoneHint: "오른쪽 채널",
      timingHint: "즉시 소유권 전환",
    }),
    displayHint: Object.freeze({
      focusMode: "duel",
      marker: "tackle",
      emphasis: "turnover",
      pitchEffect: "contact-burst",
    }),
    commentary: "원정 6번이 타이밍 좋게 태클해 공을 원정 팀 쪽으로 밀어냅니다.",
    watchPoint: "태클 actor와 볼 운반 target, 공 소유권이 바뀌는 지점을 확인하세요.",
    timeline: Object.freeze(["scene-tackle"]),
    statEffect: Object.freeze({
      type: "FLOW",
      label: "소유권 압박 변화",
      changedKeys: Object.freeze(["possession"]),
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
    routeLabel: "중앙 연결",
    actor: person(samplePlayers.home8, "패스"),
    target: person(samplePlayers.home10, "수신"),
    supporters: Object.freeze([
      person(samplePlayers.home9, "전방 선택지"),
      person(samplePlayers.away8, "압박 수비"),
    ]),
    ballPath: Object.freeze({
      startRole: "actorFeet",
      endRole: "targetFeet",
      pathStyle: "STRAIGHT_PASS",
      zoneHint: "중앙 라인",
      timingHint: "빠른 연결",
    }),
    displayHint: Object.freeze({
      focusMode: "pass-link",
      marker: "pass",
      emphasis: "connection",
      pitchEffect: "pass-thread",
    }),
    commentary: "홈 8번이 라인 사이로 들어간 홈 10번에게 짧은 패스를 넣습니다.",
    watchPoint: "패스 actor에서 target으로 이어지는 짧은 공 이동선을 확인하세요.",
    timeline: Object.freeze(["scene-pass", "flow-074-chance"]),
    statEffect: Object.freeze({
      type: "FLOW",
      label: "기회 빌드업",
      changedKeys: Object.freeze(["chances"]),
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
    routeLabel: "측면 크로스",
    actor: person(samplePlayers.home11, "크로스"),
    target: person(samplePlayers.home9, "박스 타깃"),
    supporters: Object.freeze([
      person(samplePlayers.away1, "골키퍼"),
      person(samplePlayers.away3, "마크 수비"),
      person(samplePlayers.away4, "커버 수비"),
    ]),
    ballPath: Object.freeze({
      startRole: "wideActor",
      endRole: "boxTarget",
      pathStyle: "ARC_DELIVERY",
      zoneHint: "왼쪽 측면에서 박스",
      timingHint: "빠른 크로스",
    }),
    displayHint: Object.freeze({
      focusMode: "wide-to-box",
      marker: "cross",
      emphasis: "box-entry",
      pitchEffect: "arc-delivery",
    }),
    commentary: "홈 11번이 박스 안 홈 9번을 향해 빠르게 크로스를 올립니다.",
    watchPoint: "측면 선수의 크로스, 박스 안 대상 선수, 골키퍼 반응을 확인하세요.",
    timeline: Object.freeze(["flow-074-chance", "scene-cross"]),
    statEffect: Object.freeze({
      type: "CHANCE",
      label: "기회 +1 표시",
      changedKeys: Object.freeze(["chances"]),
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
    routeLabel: "슈팅과 선방",
    actor: person(samplePlayers.home9, "슈팅"),
    target: Object.freeze({
      role: "골문",
      label: "가까운 골문",
      slot: "goalMouth",
    }),
    supporters: Object.freeze([
      person(samplePlayers.away1, "골키퍼"),
      person(samplePlayers.away3, "근접 수비"),
    ]),
    ballPath: Object.freeze({
      startRole: "actorFeet",
      endRole: "goalMouth",
      pathStyle: "DIRECT_SHOT",
      zoneHint: "박스에서 가까운 골문",
      timingHint: "논스톱 슈팅",
    }),
    displayHint: Object.freeze({
      focusMode: "shot-result",
      marker: "shot",
      emphasis: "on-target-save",
      pitchEffect: "goal-tension",
    }),
    commentary: "홈 9번의 슈팅이 골문으로 향하지만 원정 1번이 반응해 막아냅니다.",
    watchPoint: "슈터에서 골문으로 향하는 공 이동과 유효 슈팅 / 선방 연결을 확인하세요.",
    timeline: Object.freeze(["scene-shot", "result-shot-on-target", "result-save"]),
    statEffect: Object.freeze({
      type: "SHOT_SAVE",
      label: "슈팅 +1, 유효 슈팅 +1, 선방 +1",
      changedKeys: Object.freeze(["shots", "shotsOnTarget", "saves"]),
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
    routeLabel: "득점 마무리",
    actor: person(samplePlayers.home10, "득점"),
    target: Object.freeze({
      role: "골문",
      label: "먼 쪽 골문 안",
      slot: "goalMouth",
    }),
    supporters: Object.freeze([person(samplePlayers.away1, "골키퍼")]),
    ballPath: Object.freeze({
      startRole: "actorFeet",
      endRole: "goal",
      pathStyle: "DIRECT_FINISH",
      zoneHint: "박스에서 먼 쪽 골문",
      timingHint: "결정적 마무리",
    }),
    displayHint: Object.freeze({
      focusMode: "goal-moment",
      marker: "goal",
      emphasis: "score-update",
      pitchEffect: "goal-flash",
    }),
    commentary: "골입니다. 홈 10번이 낮고 빠르게 마무리하며 점수가 바뀝니다.",
    watchPoint: "득점 선수, 골문 target, 스코어 갱신 힌트가 함께 보이는지 확인하세요.",
    timeline: Object.freeze(["scene-goal"]),
    statEffect: Object.freeze({
      type: "GOAL",
      label: "스코어 2-1로 변경",
      changedKeys: Object.freeze(["score"]),
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
    "watchPoint",
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

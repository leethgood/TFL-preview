# TFL 경기 관전 UI 1차 Public Preview

이 저장소는 `leethgood/TFL` private 원본 저장소를 public으로 변경하지 않고, 대표님 / 봉이사 브라우저 확인을 위해 만든 preview 전용 public repository다.

## 확인 URL

```txt
https://leethgood.github.io/TFL-preview/
```

## 포함 파일

```txt
index.html
styles.css
sample-data.js
prototype.js
README.md
```

## 목적

```txt
경기 관전 UI 1차 인터랙티브 프로토타입을 로컬 file:// 클릭 없이 브라우저 URL로 확인한다.
LIVE / 선수·교체 / 작전·전술 / 기록·분석 탭 전환을 확인한다.
Play Focus View 이벤트 6종의 움직임을 확인한다.
PC 가로 화면과 모바일 세로 화면 반응형을 확인한다.
```

## 프로토타입 성격

```txt
preview 전용 산출물
폐기 가능한 확인용 저장소
실제 제품 repository 아님
실제 서비스 UI 확정본 아님
```

## 제외 범위

```txt
TFL 원본 private repository 전체 복사
AI_CONTEXT.md
AGENTS.md
docs 전체
src 전체
DB 연동
API 연동
경기엔진 연동
로그인 / 결제 / 리그 / 시즌 / 어드민 / 커뮤니티 구현
실제 선수 데이터
실제 선수명
실제 선수 능력치
```

## 데이터 기준

```txt
sampleMatchData
samplePlayers
sampleEvents
sampleStats
sampleTactics
```

위 샘플 데이터는 `sample-data.js`에 분리되어 있다.
서버 통신 없이 브라우저에서만 동작한다.

## 원본 기준

```txt
원본 저장소: leethgood/TFL
원본 파일 위치: docs/design/mockups/match-viewer-v1/
preview repo 배치: repository root
```

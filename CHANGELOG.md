# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

---

## 2026-03-27

### Fixed
- **CORS & API calls handling** — Enabled CORS on the NestJS backend (`main.ts`), updated `docker-compose.yaml` with correct service configuration, fixed frontend `aiService.ts` API calls, minor store fix in `conversationsStore.ts`, cleaned up root-level `package.json`/`package-lock.json` artifacts.

### Added
- **Attachments support** — Frontend `MessageInput` now supports file selection and upload; `MessageBubble` renders attached files; `aiService` and `conversationsStore` updated to carry attachment payloads. Backend `conversation-messages.controller.ts` and `openclaw.service.ts` extended to forward attachments to the agent. New `MessageAttachment` type added.

---

## 2026-03-26

### Added
- **Chat streaming** — New `messages` NestJS module with `ConversationMessagesController` exposing a streaming endpoint. `OpneclawService` extended with streaming chat support. `MessageRequest` DTO and additional `PreConnectChallengeRequest` fields added.

---

## 2026-03-24

### Added
- **OpenClaw gateway connection** — New `openclaw` NestJS module with `OpneclawService` (handles WebSocket connection to the OpenClaw gateway) and `DeviceIdentityService` (manages device keypair, pre-connect challenge/response flow). `PreConnectChallengeRequest` type added. Boilerplate `AppController`/`AppService` removed; `AppModule` wired up to the new module.

### Added
- **First UI version** — Full frontend chat interface built with React:
  - Components: `Sidebar`, `ConversationList`, `NewConversationButton`, `ChatPanel`, `MessageList`, `MessageBubble`, `MessageInput`, `ToolCallBlock`
  - Hooks: `useConversations`, `useMessages`
  - State: `conversationsStore` (Zustand)
  - Service: `aiService` (API integration)
  - Types: shared `index.ts` type definitions
  - Styling: reworked `index.css`; Vite proxy configured

---

## 2026-03-22

### Added
- **Project setup** — Monorepo scaffolded with:
  - `backend/` — NestJS application with TypeScript, ESLint, Prettier, Dockerfile, and initial boilerplate
  - `frontend/` — Vite + React + TypeScript application with ESLint and Dockerfile
  - `docker-compose.yaml` — Initial multi-service compose file

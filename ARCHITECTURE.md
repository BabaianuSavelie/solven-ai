# Architectural Overview — Solven AI (Working Example)

> **Note:** This is a working proof-of-concept, not the final version of the application. The architecture described here reflects decisions made to get a functional end-to-end system running quickly. It does not represent the intended production architecture.

---

## System Overview

Solven AI is a chat interface that lets users send messages (with optional file attachments) to an AI agent powered by Anthropic's Claude API. The system is composed of three containerized services:

```
Frontend (React/Nginx)  →  Backend (NestJS)  →  Openclaw Gateway  →  Claude API
       :82                     :3000                  :18789
```

---

## Architectural Decisions & Trade-offs

### 1. Three-Tier Service Architecture

The system is split into three distinct services: a frontend, a backend, and the Openclaw AI gateway.

**Decision:** Rather than calling the Claude API directly from the backend, all AI traffic is routed through the Openclaw gateway service, which acts as an authenticated proxy with agent capabilities and streaming support.

**Trade-off:** This adds a network hop and introduces an external dependency (the Openclaw container), but it offloads authentication, key management, and agent orchestration from the backend. For a quick working example, this was the right call. In a production system, this boundary would need to be more explicitly defined — either fully owned internally or replaced with a managed service.

---

### 2. Backend as a Thin Proxy (NestJS)

The NestJS backend is intentionally thin. It receives HTTP requests from the frontend, translates them into WebSocket frames for Openclaw, and pipes streaming responses back as Server-Sent Events (SSE).

**Decision:** NestJS was chosen for its module system, TypeScript-first approach, and clean separation of concerns (modules, services, controllers). The backend owns two responsibilities: device identity/authentication with the gateway, and request translation between the frontend's REST/SSE interface and the gateway's WebSocket protocol.

**Trade-off:** The backend holds no state (no database, no session store). Conversations exist only in the frontend's memory. This was intentional for simplicity — persisting conversations, users, and history is a clear gap that would need to be addressed in a production version.

---

### 3. WebSocket (Backend ↔ Gateway) + SSE (Frontend ↔ Backend)

Two different streaming transports are used across the stack.

**Decision:** The Openclaw gateway uses a binary WebSocket protocol with typed frames (REQUEST, RESPONSE, EVENT) and run-based event subscriptions. Rather than exposing this complexity to the frontend, the backend translates it into SSE, which is simpler to consume from a browser and works well for unidirectional server-to-client streaming.

**Trade-off:** SSE is one-directional and doesn't support cancellation or backpressure out of the box. A WebSocket connection from frontend to backend would be more flexible, but SSE was sufficient for the current requirements and faster to implement correctly.

---

### 4. Device Identity via Ed25519 Keys

The backend generates an Ed25519 keypair on first run, persists it to disk, and uses it to authenticate with the Openclaw gateway via a nonce-based challenge-response protocol.

**Decision:** This gives the backend a stable, cryptographically verifiable identity without requiring a user account or API key rotation flow. Keys are stored in `.openclaw/` and reused across restarts.

**Trade-off:** This approach works well in a single-instance deployment but doesn't scale — if multiple backend instances run in parallel, they would each generate their own identity. Key management would need to be centralized (e.g., via a secrets manager or shared volume) in a scaled deployment.

---

### 5. Frontend State in Zustand (No Persistence)

All conversation and message state lives in a Zustand store in the browser. There is no backend persistence layer.

**Decision:** Zustand provides a simple, non-boilerplate state management solution for React. For a working demo, in-memory state is sufficient — conversations are ephemeral and scoped to the browser session.

**Trade-off:** Refreshing the page loses all conversation history. A production system would require a database-backed conversation store, user authentication, and history retrieval APIs — none of which are present here.

---

### 6. File Attachments via Base64 Encoding

File attachments are uploaded as multipart form data to the backend, converted to base64, and forwarded to the gateway as part of the message payload.

**Decision:** This was the fastest path to getting attachments working end-to-end without requiring a separate file storage service or presigned URL flow.

**Trade-off:** Base64 encoding inflates payload size by ~33%. For large files or high-traffic scenarios, this approach doesn't scale. A production implementation would use object storage (e.g., S3) with direct uploads and references passed to the AI, rather than embedding raw bytes in the message payload.

---

### 7. Docker Compose for Orchestration

All three services are defined in a single `docker-compose.yaml` with health checks and startup ordering.

**Decision:** Docker Compose is the right tool for a local development and demo environment. The backend waits for Openclaw to be healthy before starting, which prevents race conditions on cold starts.

**Trade-off:** Docker Compose is not suitable for production deployment at scale. The `VITE_API_BASE_URL` is baked into the frontend image at build time (as a Vite env var), which means the image is not portable across environments without rebuilding. A production setup would use runtime configuration injection or a build pipeline with environment-specific artifacts.

---

## What This Example Demonstrates

Despite the intentional simplifications above, the working example successfully demonstrates:

- End-to-end streaming chat with tool call visualization
- File attachment support through the full stack
- Device-based authentication with a WebSocket gateway
- A clean module boundary between AI infrastructure and application logic
- Containerized multi-service orchestration with health-gated startup

---

## What Would Change in a Production Version

- **Persistence:** Conversation and message history stored in a database, tied to authenticated user accounts
- **Scalability:** Stateless backend instances, centralized key/secret management, object storage for files
- **Error handling:** Retry logic, circuit breakers, structured error responses
- **Observability:** Logging, tracing, and metrics across all three services

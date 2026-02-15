[← Volver a la Documentación Principal](../../README.md)

# ⚡ Real-time Synchronization & Offline Strategy

> **Scope:** This document details the **Offline-First** architecture of **AppMasterThatOpenEngine**. It explains how `onSnapshot` listeners, `localStorage` caching, and optimistic UI updates work together to ensure data consistency and responsiveness.

---

## 1. Architecture Overview

The synchronization system relies on a **Three-Layer Architecture** to decouple the UI from network latency.

```mermaid
graph TD
    UI[Layer 3: React UI] <-->|Read/Subscribe| Mgr[Layer 2: Managers]
    Mgr <-->|Sync (onSnapshot)| Cloud[(Layer 1: Firestore)]
    Mgr <-->|Persist/Hydrate| Cache[Layer 0: LocalStorage]

    style Cloud fill:#f9f,stroke:#333,stroke-width:2px
    style Mgr fill:#bbf,stroke:#333,stroke-width:2px
    style Cache fill:#dfd,stroke:#333,stroke-width:2px

```

| Layer               | Component             | Responsibility                                  |
| ------------------- | --------------------- | ----------------------------------------------- |
| **Firestore Layer** | Cloud Database        | Source of Truth. Pushes updates via Websockets. |
| **Manager Layer**   | `ProjectsManager`<br> |

<br>`UsersManager` | Coordinates sync, handles logic, and manages memory state. |
| **Cache Layer** | `localStorage` | Provides **Instant Startup** and offline support. |

---

## 2. Firestore Listener System

Both Managers establish persistent listeners in their constructors (`setupFirestoreListener`).

### 👂 The Listener Pattern (`docChanges`)

Instead of processing the entire dataset on every update, we use `snapshot.docChanges()` to process **deltas** only. This drastically reduces CPU usage.

| Event Type     | Action Taken                                                               | Logic Location       |
| -------------- | -------------------------------------------------------------------------- | -------------------- |
| **`added`**    | Instantiate `Project`, lazy-load subcollections, add to list.              | `ProjectsManager.ts` |
| **`modified`** | Merge updates into existing instance. **Preserves** loaded subcollections. | `ProjectsManager.ts` |
| **`removed`**  | Filter item out of the internal array.                                     | `ProjectsManager.ts` |

### 🔄 Subcollection Synchronization Strategies

The app uses two different strategies for nested data:

#### A. On-Demand Loading (Projects)

When a project is added, its dependencies (`todoList`, `tags`, `assignedUsers`) are fetched once using `Promise.all`.

- **Why?** Reduces read costs for projects not actively being modified.

#### B. Dynamic Nested Listeners (Users)

Users require real-time updates for their assignments. The `UsersManager` maintains a dynamic map of listeners.

```mermaid
graph LR
    UserListener[Main User Listener] -->|User Added| Spawn{Spawn Sub-Listener}
    Spawn -->|Yes| AssignListener[Listen: users/{uid}/projectsAssigned]
    UserListener -->|User Removed| Kill{Unsubscribe}
    Kill -->|Yes| Cleanup[Memory Cleanup]

```

> **Memory Safety:** When a user is removed, the manager explicitly calls the unsubscribe function stored in `_projectAssignmentUnsubscribes` to prevent memory leaks.

---

## 3. LocalStorage Caching Strategy

The application follows a **"Stale-While-Revalidate"** pattern: Show cached data immediately, then update from the network.

### Cache Keys & Structure

| Cache Key         | Content                | Purpose                       |
| ----------------- | ---------------------- | ----------------------------- |
| `STORAGE_KEY`     | Serialized `Project[]` | Main project data + ToDos.    |
| `USERS_CACHE_KEY` | Serialized `User[]`    | User profiles + Assignments.  |
| `*_TIMESTAMP_KEY` | ISO String             | Used for debugging staleness. |

### 💾 Serialization Logic

To store complex objects in `localStorage` (which only supports strings), we perform explicit type conversion:

1. **Date Objects:** Converted to ISO Strings (`2023-10-27T10:00:00Z`).
2. **Firestore Timestamps:** Converted to JS Dates, then ISO Strings.

**Deserialization (On Load):**
The `User` and `Project` classes parse these ISO strings back into native `Date` objects ensures dates work correctly in the UI (e.g., "Due in 2 days").

---

## 4. Ready State & Initialization

To prevent UI "flicker" or empty states, Managers implement a **Ready Queue Pattern**.

1. **Initial State:** `_isReady = false`.
2. **Queue:** Components register callbacks via `onReady(cb)`.
3. **Hydration:** Data loads from `localStorage` UI renders Cached Data.
4. **Sync:** Firestore listener fires first snapshot `_isReady = true`.
5. **Execution:** All queued callbacks are fired, ensuring components know data is fresh.

```typescript
// Component Pattern
React.useEffect(() => {
  projectsManager.onReady(() => {
    setIsInitialLoading(false); // Only hide spinner when data is confirmed
  });
}, []);
```

---

## 5. Network Resilience & Error Handling

The system is designed to be robust against poor network conditions.

### 🛡️ Retry Mechanism

All database operations utilize an **Exponential Backoff** strategy (`src/services/Firebase/index.ts`).

| Operation        | Max Retries | Base Delay | Timeout |
| ---------------- | ----------- | ---------- | ------- |
| **Initialize**   | 2           | 1000ms     | 5000ms  |
| **CRUD Actions** | 3           | 500ms      | 3000ms  |
| **Fetch Query**  | 3           | 1000ms     | 5000ms  |

### Graceful Degradation (Offline Mode)

1. **Read:** If network fails, `onSnapshot` silently waits. The UI continues to show cached data.
2. **Write:** Operations fail with a `toast.error` notification to the user, ensuring they know the action wasn't persisted.
3. **Recovery:** Once connectivity is restored, listeners automatically reconnect and sync missed events.

---

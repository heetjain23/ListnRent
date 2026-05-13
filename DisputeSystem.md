# ListnRent — Dispute / Support Ticket System: Backend Reference

> **Purpose:** Complete context document for frontend implementation. Any AI model or developer starting the frontend can use this as the single source of truth for the dispute system's backend contracts, data shapes, status flow, and socket events.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [File Structure](#2-file-structure)
3. [Database Schemas](#3-database-schemas)
4. [Status & Lifecycle Flow](#4-status--lifecycle-flow)
5. [Constants & Enums](#5-constants--enums)
6. [User-Facing REST APIs](#6-user-facing-rest-apis)
7. [Admin/Staff REST APIs](#7-adminstaff-rest-apis)
8. [Socket.IO Events](#8-socketio-events)
9. [Role & Access Matrix](#9-role--access-matrix)
10. [Response Shapes](#10-response-shapes)
11. [Integration Steps (Already Done)](#11-integration-steps)
12. [Frontend Implementation Notes](#12-frontend-implementation-notes)

---

## 1. System Overview

The Dispute System is a professional support-ticket system where:

- A **customer** who has a booking can raise a dispute (one active dispute per booking)
- **Support Staff / Admin / Super Admin** can view all disputes, reply, and mark them as resolved
- When staff marks a dispute **resolved**, the customer receives a confirmation prompt
- The customer can **confirm** (→ CLOSED) or **reject** (→ REOPENED) the resolution
- The cycle can repeat indefinitely until the customer confirms or staff closes

### Key Design Decisions

| Decision | Reason |
|---|---|
| `Dispute` + `DisputeMessage` separate models | Thread can grow; paginated loading; avoids document size limit |
| `unreadCounts` Map on Dispute | O(1) badge updates; avoids aggregate queries |
| Denormalized `lastMessage`, `lastMessageAt` | Efficient list view without fetching messages |
| System messages stored as `DisputeMessage` | Full audit trail; timeline UX; consistent rendering |
| `disputeId` human-readable (DSP-YYYYMM-XXXX) | Customer-friendly ticket reference |
| Socket rooms: `user:{uid}`, `staff:disputes`, `dispute:{id}` | Targeted delivery; staff pool broadcast |

---

## 2. File Structure

```
server/src/features/disputes/
├── Dispute.js                  ← Mongoose model (dispute document)
├── DisputeMessage.js           ← Mongoose model (message thread)
├── disputeService.js           ← All business logic (no DB calls in controllers)
├── disputeSocketHooks.js       ← Socket event emission + handler registration
├── disputeValidation.js        ← Input validation middleware
├── disputeMiddleware.js        ← Role/access guard middleware
├── disputeController.js        ← User-facing handlers (thin)
├── adminDisputeController.js   ← Admin/staff handlers (thin)
├── disputeRoutes.js            ← User routes: /api/disputes/*
└── adminDisputeRoutes.js       ← Admin routes: /api/admin/disputes/*
```

### Files Modified in Existing Codebase

| File | Change |
|---|---|
| `server/app.js` | Added `import disputeRoutes` + `app.use('/api/disputes', disputeRoutes)` |
| `server/src/features/admin/adminRoutes.js` | Added `import adminDisputeRoutes` + `router.use('/disputes', adminDisputeRoutes)` |
| `server/src/socket/socketServer.js` | Added `import registerDisputeSocketHandlers` + called it inside `io.on('connection')` |

---

## 3. Database Schemas

### Dispute Model (`Dispute.js`)

```js
{
  disputeId: String,           // "DSP-202506-A3BX" — human-readable, unique, indexed
  bookingId: ObjectId,         // ref: Booking
  raisedBy: String,            // Firebase UID of customer
  assignedTo: ObjectId,        // ref: Admin (nullable, for future assignment UI)
  subject: String,             // max 200 chars
  category: String,            // enum: DISPUTE_CATEGORY values
  priority: String,            // enum: LOW | MEDIUM | HIGH | URGENT
  status: String,              // enum: DISPUTE_STATUS values
  lastMessage: String,         // denormalized, max 300 chars
  lastMessageAt: Date,         // for list sorting
  lastMessageBy: String,       // uid or 'system'
  unreadCounts: Map<String, Number>,  // key: uid or 'staff', value: count
  resolvedAt: Date,            // set when staff marks resolved
  closedAt: Date,              // set when customer confirms
  reopenCount: Number,         // how many times reopened
  slaDeadline: Date,           // future: SLA tracking
  slaBreached: Boolean,        // future: SLA breach flag
  refundRequested: Boolean,    // future: refund flow
  refundAmount: Number,        // future
  refundStatus: String,        // future: NONE | REQUESTED | APPROVED | REJECTED | PROCESSED
  metadata: Mixed,             // extensible: AI tags, escalation notes, etc.
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ status: 1, lastMessageAt: -1 }` — admin list view
- `{ raisedBy: 1, status: 1, createdAt: -1 }` — customer my-disputes
- `{ assignedTo: 1, status: 1, lastMessageAt: -1 }` — assigned staff queue
- `{ bookingId: 1, raisedBy: 1 }` — duplicate check

### DisputeMessage Model (`DisputeMessage.js`)

```js
{
  disputeId: ObjectId,         // ref: Dispute
  sender: String,              // Firebase UID (customer) OR Admin _id string (staff)
  senderRole: String,          // enum: customer | support_team | admin | super_admin | system
  senderName: String,          // cached display name
  senderPhoto: String,         // cached photo URL (nullable)
  message: String,             // max 5000 chars
  isSystemMessage: Boolean,    // true for auto-generated messages
  systemAction: String,        // enum: SYSTEM_ACTION values (nullable for user messages)
  readBy: [{ uid, readAt }],   // array of read receipts
  attachments: [{              // future: file attachments
    url, publicId, fileName, fileType, fileSize, uploadedAt
  }],
  isDeleted: Boolean,          // soft-delete for moderation
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ disputeId: 1, createdAt: 1 }` — thread pagination (oldest-first)
- `{ disputeId: 1, isSystemMessage: 1 }` — filter system messages

---

## 4. Status & Lifecycle Flow

```
OPEN
 │
 ├──[staff replies]──────────────────► IN_PROGRESS
 │
 ├──[staff asks user]────────────────► WAITING_FOR_USER
 │
 └──[staff marks resolved]──────────► RESOLVED_PENDING_CONFIRMATION
                                               │
                              [user: YES] ◄────┤────► [user: NO]
                                               │              │
                                           CLOSED         REOPENED
                                                              │
                                            [loops back to IN_PROGRESS]
```

### Auto-Status Transitions (in `sendDisputeMessage`)

| Condition | Auto-transition |
|---|---|
| Staff sends first reply to `OPEN` or `REOPENED` dispute | → `IN_PROGRESS` |
| Customer replies to `WAITING_FOR_USER` dispute | → `IN_PROGRESS` |

### Manual Transitions (staff only, validated in `updateDisputeStatus`)

| From | Allowed To |
|---|---|
| `OPEN` | `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED_PENDING_CONFIRMATION` |
| `IN_PROGRESS` | `WAITING_FOR_USER`, `RESOLVED_PENDING_CONFIRMATION` |
| `WAITING_FOR_USER` | `IN_PROGRESS`, `RESOLVED_PENDING_CONFIRMATION` |
| `REOPENED` | `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED_PENDING_CONFIRMATION` |
| `RESOLVED_PENDING_CONFIRMATION` | _(none — must wait for user)_ |
| `CLOSED` | _(immutable)_ |

---

## 5. Constants & Enums

All dispute constants now live in `packages/shared/constants/index.js` and are re-exported through `@listnrent/shared/constants`.

Use this shared import path in both server and frontend code:

```js
import {
  DISPUTE_STATUS,
  DISPUTE_PRIORITY,
  DISPUTE_CATEGORY,
  SENDER_ROLE,
  SYSTEM_ACTION,
  STAFF_ROLES,
  ADMIN_ROLES,
  ALLOWED_TRANSITIONS,
  SYSTEM_MESSAGES,
  USER_BLOCKED_STATUSES,
  STAFF_BLOCKED_STATUSES,
  adminRoleToSenderRole,
} from '@listnrent/shared/constants'
```

```js
DISPUTE_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_FOR_USER: 'WAITING_FOR_USER',
  RESOLVED_PENDING_CONFIRMATION: 'RESOLVED_PENDING_CONFIRMATION',
  REOPENED: 'REOPENED',
  CLOSED: 'CLOSED',
}

DISPUTE_PRIORITY = { LOW, MEDIUM, HIGH, URGENT }

DISPUTE_CATEGORY = {
  DELIVERY_ISSUE, PAYMENT_ISSUE, ITEM_DAMAGED,
  ITEM_NOT_AS_DESCRIBED, REFUND_REQUEST, CANCELLATION, OTHER
}

SENDER_ROLE = {
  CUSTOMER: 'customer',
  SUPPORT_TEAM: 'support_team',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  SYSTEM: 'system',
}

SYSTEM_ACTION = {
  DISPUTE_OPENED, STATUS_CHANGED, ASSIGNED, MARKED_RESOLVED,
  USER_CONFIRMED_RESOLVED, USER_REOPENED, PRIORITY_CHANGED, ESCALATED
}
```

The old `server/src/features/disputes/disputeConstants.js` file has been removed; the dispute feature files now import directly from the shared package.

---

## 6. User-Facing REST APIs

Base path: `/api/disputes`  
All routes require: `Authorization: Bearer {firebaseToken}`

---

### `POST /api/disputes/create`

Create a new dispute for a booking.

**Request body:**
```json
{
  "bookingId": "664abc123def456...",
  "subject": "Outfit not delivered",
  "message": "I booked an outfit for my wedding but it was not delivered on time...",
  "category": "DELIVERY_ISSUE"
}
```

**Validation:**
- `bookingId`: required, valid ObjectId
- `subject`: required, 5–200 chars
- `message`: required, 10–5000 chars
- `category`: optional, must be valid DISPUTE_CATEGORY value

**Success 201:**
```json
{
  "success": true,
  "data": {
    "dispute": { ...Dispute },
    "message": { ...DisputeMessage }
  }
}
```

**Errors:**
- `404` — booking not found
- `403` — booking not owned by this user
- `409` — active dispute already exists for this booking

---

### `GET /api/disputes/my`

Get all disputes for the authenticated customer.

**Query params:**
| Param | Default | Notes |
|---|---|---|
| `page` | 1 | |
| `limit` | 10 | max 20 |
| `status` | — | filter by status |
| `sortBy` | `lastMessageAt` | `lastMessageAt | createdAt | status | priority` |
| `sortOrder` | `desc` | `asc | desc` |

**Success 200:**
```json
{
  "success": true,
  "data": {
    "disputes": [ ...Dispute[] ],
    "pagination": {
      "page": 1, "limit": 10, "total": 5, "totalPages": 1
    }
  }
}
```

---

### `GET /api/disputes/:id`

Get a single dispute. `:id` can be MongoDB `_id` OR `disputeId` (DSP-YYYYMM-XXXX).

Customer can only view their own disputes (403 otherwise).

**Success 200:**
```json
{
  "success": true,
  "data": {
    "dispute": { ...Dispute, bookingId: { ...populated }, assignedTo: { ...populated } }
  }
}
```

---

### `GET /api/disputes/:id/messages`

Get paginated message thread (oldest-first within page).  
Also marks messages as read for this user (fire-and-forget).

**Query params:** `page`, `limit` (max 50)

**Success 200:**
```json
{
  "success": true,
  "data": {
    "messages": [ ...DisputeMessage[] ],
    "pagination": { "page": 1, "limit": 30, "total": 12, "totalPages": 1 }
  }
}
```

---

### `POST /api/disputes/:id/message`

Customer sends a message in their dispute.

**Request body:** `{ "message": "..." }`

**Errors:**
- `400` — dispute is CLOSED
- `403` — not the owner
- `400` — empty message

**Success 201:**
```json
{
  "success": true,
  "data": {
    "message": { ...DisputeMessage },
    "dispute": { ...Dispute }
  }
}
```

---

### `POST /api/disputes/:id/confirm-resolved`

Customer confirms their issue is resolved.  
Only valid when `status === 'RESOLVED_PENDING_CONFIRMATION'`.

**Request body:** _(empty)_

**Success 200:**
```json
{
  "success": true,
  "data": {
    "dispute": { ...Dispute, status: "CLOSED" },
    "systemMessage": { ...DisputeMessage }
  }
}
```

---

### `POST /api/disputes/:id/reopen`

Customer says issue is NOT resolved.  
Only valid when `status === 'RESOLVED_PENDING_CONFIRMATION'`.

**Success 200:**
```json
{
  "success": true,
  "data": {
    "dispute": { ...Dispute, status: "REOPENED" },
    "systemMessage": { ...DisputeMessage }
  }
}
```

---

## 7. Admin/Staff REST APIs

Base path: `/api/admin/disputes`  
All routes require: `Authorization: Bearer {firebaseToken}` + Admin role (`support_team | admin | super_admin`)

---

### `GET /api/admin/disputes`

Full dispute list with filtering, sorting, pagination.  
Response includes `raisedByUser` object (batch-fetched, no N+1).

**Query params:**
| Param | Notes |
|---|---|
| `page`, `limit` | max 50 |
| `status` | filter |
| `priority` | filter |
| `category` | filter |
| `assignedTo` | Admin ObjectId |
| `search` | regex against `disputeId` or `subject` |
| `sortBy` | `lastMessageAt | createdAt | status | priority | reopenCount` |
| `sortOrder` | `asc | desc` |

**Success 200:**
```json
{
  "success": true,
  "data": {
    "disputes": [
      {
        ...Dispute,
        "raisedByUser": {
          "uid": "...",
          "displayName": "Priya Sharma",
          "email": "priya@example.com",
          "photoURL": "..."
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

### `GET /api/admin/disputes/:id`

Single dispute detail (no ownership restriction). Populates `bookingId` and `assignedTo`.

---

### `GET /api/admin/disputes/:id/messages`

Paginated thread. Also marks `staff` unread counter to 0.

---

### `POST /api/admin/disputes/:id/message`

Staff/admin sends message. Sender role is auto-resolved from `req.admin.role`.

**Request body:** `{ "message": "..." }`

---

### `PATCH /api/admin/disputes/:id/status`

Change status with transition validation.

**Request body:** `{ "status": "IN_PROGRESS" }`

Returns error if transition is not allowed.

---

### `PATCH /api/admin/disputes/:id/resolve`

Mark as resolved — sets status to `RESOLVED_PENDING_CONFIRMATION`.  
Inserts system message asking customer to confirm.  
Increments customer's `unreadCounts`.

**Request body:** _(empty)_

---

### `PATCH /api/admin/disputes/:id/assign`

Assign to a staff/admin team member. **Requires `admin | super_admin` role.**

**Request body:** `{ "assigneeId": "664abc..." }`

---

## 8. Socket.IO Events

The dispute system reuses the existing Socket.IO server with new room conventions.

### Room Conventions

| Room | Who joins |
|---|---|
| `user:{firebaseUid}` | Existing — every authenticated user |
| `staff:disputes` | Staff/admin call `join:staff_disputes` after auth |
| `dispute:{disputeMongoId}` | Frontend calls `join:dispute` when viewing a thread |

### Client → Server Events

```js
// Join a dispute thread room (for real-time message delivery)
socket.emit('join:dispute', { disputeId: '664abc...' })

// Leave a dispute thread room
socket.emit('leave:dispute', { disputeId: '664abc...' })

// Staff: join the staff pool room (receives all dispute events)
socket.emit('join:staff_disputes')

// Staff: leave staff pool
socket.emit('leave:staff_disputes')
```

### Server → Client Events

All dispute events are emitted to:
1. `dispute:{id}` room (anyone viewing the thread)
2. `user:{raisedBy}` room (customer's personal room)
3. `staff:disputes` room (all staff/admin)
4. `user:{assignedTo}` room (if assigned)

---

#### `dispute:created`
Fired when a new dispute is raised.
```json
{
  "disputeId": "664abc...",
  "dispute": { ...Dispute },
  "message": { ...DisputeMessage }
}
```

#### `dispute:new_message`
Fired when any participant sends a message.
```json
{
  "disputeId": "664abc...",
  "dispute": { ...Dispute },
  "message": { ...DisputeMessage },
  "senderRole": "customer"
}
```

#### `dispute:status_changed`
Fired when status is manually updated by staff.
```json
{
  "disputeId": "664abc...",
  "dispute": { ...Dispute },
  "from": "OPEN",
  "to": "IN_PROGRESS",
  "message": { ...systemMessage }
}
```

#### `dispute:resolved_pending`
Fired when staff marks resolved. Customer should show confirmation prompt.
```json
{
  "disputeId": "664abc...",
  "dispute": { ...Dispute },
  "message": { ...systemMessage }
}
```

#### `dispute:closed`
Fired when customer confirms resolution.
```json
{
  "disputeId": "664abc...",
  "dispute": { ...Dispute, "status": "CLOSED" },
  "message": { ...systemMessage }
}
```

#### `dispute:reopened`
Fired when customer rejects resolution.
```json
{
  "disputeId": "664abc...",
  "dispute": { ...Dispute, "status": "REOPENED" },
  "message": { ...systemMessage }
}
```

#### `dispute:assigned`
Fired when admin assigns a dispute to a staff member.
```json
{
  "disputeId": "664abc...",
  "dispute": { ...Dispute },
  "assigneeId": "664def...",
  "message": { ...systemMessage }
}
```

---

## 9. Role & Access Matrix

| Action | customer | support_team | admin | super_admin |
|---|:---:|:---:|:---:|:---:|
| Create dispute (own booking only) | ✅ | ❌ | ❌ | ❌ |
| View own disputes | ✅ | ❌ | ❌ | ❌ |
| Send message (own dispute) | ✅ | ❌ | ❌ | ❌ |
| Confirm resolved | ✅ | ❌ | ❌ | ❌ |
| Reopen dispute | ✅ | ❌ | ❌ | ❌ |
| View ALL disputes | ❌ | ✅ | ✅ | ✅ |
| Reply in any dispute | ❌ | ✅ | ✅ | ✅ |
| Change status | ❌ | ✅ | ✅ | ✅ |
| Mark resolved | ❌ | ✅ | ✅ | ✅ |
| Assign dispute | ❌ | ❌ | ✅ | ✅ |

---

## 10. Response Shapes

All endpoints use the existing helper pattern:

```js
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Human-readable error" }
```

### Dispute object (flattened for API)

```typescript
{
  _id: string               // MongoDB ObjectId string
  disputeId: string         // "DSP-202506-A3BX"
  bookingId: Booking | string
  raisedBy: string          // Firebase UID
  assignedTo: Admin | null
  subject: string
  category: DisputeCategory
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: DisputeStatus
  lastMessage: string
  lastMessageAt: string     // ISO date
  lastMessageBy: string
  unreadCounts: Record<string, number>  // { uid: count, staff: count }
  resolvedAt: string | null
  closedAt: string | null
  reopenCount: number
  createdAt: string
  updatedAt: string
}
```

### DisputeMessage object

```typescript
{
  _id: string
  disputeId: string
  sender: string            // uid or admin _id string or 'system'
  senderRole: SenderRole
  senderName: string
  senderPhoto: string | null
  message: string
  isSystemMessage: boolean
  systemAction: SystemAction | null  // drive special UI rendering
  readBy: [{ uid: string, readAt: string }]
  attachments: []           // future
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}
```

---

## 11. Integration Steps

These have **already been done** in the codebase. Documenting for reference:

### `server/app.js`
```js
import disputeRoutes from "./src/features/disputes/disputeRoutes.js";
// ...
app.use("/api/disputes", disputeRoutes);
```

### `server/src/features/admin/adminRoutes.js`
```js
import adminDisputeRoutes from "../disputes/adminDisputeRoutes.js";
// ...
router.use("/disputes", adminDisputeRoutes);
```

### `server/src/socket/socketServer.js`
```js
import { registerDisputeSocketHandlers } from "../features/disputes/disputeSocketHooks.js";
// inside io.on('connection', (socket) => { ... })
registerDisputeSocketHandlers(socket, uid);
```

---

## 12. Frontend Implementation Notes

### For the Customer UI

1. **My Disputes page** — Call `GET /api/disputes/my`
   - Show `disputeId`, `subject`, `status` badge, `lastMessage`, `lastMessageAt`
   - Unread badge: `dispute.unreadCounts[currentUser.uid] > 0`

2. **Create Dispute** — Only show for bookings with `paymentStatus: 'partial' | 'completed'`
   - Pass `bookingId` in body
   - Category is optional but improves routing

3. **Dispute Thread page** — Call `GET /api/disputes/:id/messages`
   - Poll or use socket `dispute:new_message` for real-time
   - Join socket room: `socket.emit('join:dispute', { disputeId })`
   - Differentiate messages by `senderRole` for visual styling
   - System messages (`isSystemMessage: true`) should render with distinct style (info card, not a chat bubble)

4. **Resolution Prompt** — When `dispute.status === 'RESOLVED_PENDING_CONFIRMATION'`
   - Show a card/modal: "Support has marked your issue as resolved. Is it resolved?"
   - Two buttons: "Yes, Close" → `POST /api/disputes/:id/confirm-resolved`
   - "No, Reopen" → `POST /api/disputes/:id/reopen`

5. **Socket subscription:**
   ```js
   socket.on('dispute:resolved_pending', ({ dispute }) => {
     // Show confirmation prompt to user
   })
   socket.on('dispute:new_message', ({ message }) => {
     // Append to thread
   })
   ```

### For the Admin UI

1. **Disputes Dashboard** — Call `GET /api/admin/disputes`
   - Filter bar: status, priority, category, search
   - Show `unreadCounts.staff` for unread badge
   - Connect socket: `socket.emit('join:staff_disputes')`

2. **Dispute Detail** — Call `GET /api/admin/disputes/:id/messages`
   - Join: `socket.emit('join:dispute', { disputeId })`
   - Render system messages as timeline events, not chat bubbles
   - Show status change button with allowed transitions
   - "Mark Resolved" is a dedicated action (PATCH `/resolve`), not a status dropdown option

3. **Status Badge Colors (suggested):**
   - `OPEN` → blue
   - `IN_PROGRESS` → yellow/amber
   - `WAITING_FOR_USER` → purple
   - `RESOLVED_PENDING_CONFIRMATION` → orange (waiting on user)
   - `REOPENED` → red
   - `CLOSED` → green

4. **System message `systemAction` values for UI rendering:**
   - `MARKED_RESOLVED` → Show "Confirm Resolution" card in customer view
   - `USER_REOPENED` → Show alert in admin view
   - `DISPUTE_OPENED` → Show as timeline start event
   - `STATUS_CHANGED` → Show as timeline event
   - `ASSIGNED` → Show as timeline event

### Auth Header (same as rest of app)
```js
headers: { Authorization: `Bearer ${firebaseToken}` }
```

### Admin auth (same pattern as other admin features)
Admin must have logged in via the admin app. Their Firebase token is verified + `Admin` model is checked for `role: support_team | admin | super_admin` and `status: active`.

---

## Future Extension Points

The backend is already architected for:

| Feature | Where to extend |
|---|---|
| File attachments | `DisputeMessage.attachments[]` + Cloudinary upload endpoint |
| SLA tracking | `Dispute.slaDeadline`, `slaBreached` — add cron job |
| Refund handling | `Dispute.refundRequested/Amount/Status` — add refund service |
| AI assistant | Replace/augment `SYSTEM_ACTION.MARKED_RESOLVED` with AI-drafted reply |
| Escalation | Add `ESCALATED` systemAction + `metadata.escalationReason` |
| Dispute categories routing | Use `category` to auto-assign disputes to specialist staff |
| Moderation logs | `DisputeMessage.isDeleted` + admin soft-delete endpoint |
| Email notifications | Hook into `emitDisputeEvent` alongside socket emission |

---

*Backend implemented by: Claude Sonnet 4.6 | May 2026*
# Client Disputes Frontend Summary

This document summarizes the customer-side dispute/support ticket frontend work added to ListnRent.

## What Was Added

### 1. Dispute API Integration
- Added a dedicated client service for dispute APIs in `apps/web/client/src/services/disputesService.js`.
- Covered the customer endpoints for:
  - creating disputes
  - listing the customer’s disputes
  - fetching a single dispute
  - loading dispute messages
  - sending a message
  - confirming a resolved dispute
  - reopening a dispute

### 2. Dispute State / Hooks
- Added a dispute hook layer in `apps/web/client/src/hooks/useDisputes.js`.
- The hook layer handles:
  - dispute list loading
  - thread loading
  - pagination / load more
  - optimistic message sending
  - retrying failed messages
  - confirm / reopen actions
  - socket-driven realtime updates
  - room join / leave for active dispute threads

### 3. Customer Disputes Page
- Added a customer-facing disputes page at `apps/web/client/src/pages/Disputes.jsx`.
- The page supports:
  - dispute list view
  - dispute thread view
  - status filters
  - unread badge counts
  - loading skeletons
  - empty states
  - error states
  - premium support-style visual treatment

### 4. Realtime Conversation UX
- Built a chat-like thread experience for customers.
- Included:
  - customer message bubbles aligned right
  - support message bubbles aligned left
  - system messages rendered as centered timeline cards
  - optimistic send UI
  - failed message retry UI
  - auto-scroll behavior
  - resolution prompt handling
  - closed-state messaging

### 5. Create Dispute Flow
- Added a reusable modal in `apps/web/client/src/components/disputes/DisputeCreateModal.jsx`.
- The modal includes:
  - category selector
  - subject field
  - issue description field
  - booking summary preview
  - validation and success feedback
- It is ready to be opened from booking/order screens.

### 6. Booking Entry Points
- Added a customer-facing “Raise Dispute” action to:
  - `apps/web/client/src/pages/OrderDetail.jsx`
  - `apps/web/client/src/components/dashboard/MyOrders.jsx`
- The button only appears for eligible bookings using the payment-status gate.

### 7. Route Wiring
- Registered dispute routes in `apps/web/client/src/components/animations/AnimatedRoutes.jsx`.
- Added:
  - `/disputes`
  - `/disputes/:disputeId`

### 8. Shared Backend Contract Usage
- The client now uses the shared dispute constants from `@listnrent/shared/constants`.
- The UI follows the backend status lifecycle and system action values described in `DisputeSystem.md`.

## UX Notes
- The customer experience is designed as a calm support center, not a CRM dashboard.
- The UI is mobile-first and uses the app’s existing color language, motion style, spacing, and rounded-card treatment.
- System messages are intentionally separated from normal chat bubbles and rendered as timeline-like support events.

## Realtime Behavior
- Active dispute threads join and leave their socket room cleanly.
- Incoming dispute events update the thread and list state without introducing a separate socket connection layer.
- Failed sends are shown inline and can be retried.

## Files Added
- `apps/web/client/src/services/disputesService.js`
- `apps/web/client/src/hooks/useDisputes.js`
- `apps/web/client/src/components/disputes/DisputeCreateModal.jsx`
- `apps/web/client/src/pages/Disputes.jsx`

## Files Updated
- `apps/web/client/src/components/animations/AnimatedRoutes.jsx`
- `apps/web/client/src/pages/OrderDetail.jsx`
- `apps/web/client/src/components/dashboard/MyOrders.jsx`

## Notes for Admin Phase
- Customer-side disputes are now wired and ready for the support/admin experience to mirror.
- The next phase can focus on admin list management, assignment, status control, and support-side thread tooling without changing the customer API or thread UX contract.

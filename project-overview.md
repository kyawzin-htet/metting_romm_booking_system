# Meeting Room Booking System

## Objective

Build a small web application for managing bookings for a single meeting room.

The system must include:

* A backend HTTP API
* A frontend interface
* Role-based behavior
* Basic administrative management features

You may use any libraries or frameworks. The backend API **must be implemented in Node.js**.

---

# Roles

The system supports three roles:

* **Admin**
* **Owner**
* **User**

You may design how users are created and how roles are assigned.

Authentication does not need to be production-grade, but the system must clearly distinguish between roles when performing actions.

---

# Core Entities

## User

Each user must have:

* `id`
* `name`
* `role` (`admin`, `owner`, or `user`)

### Example

```json
{
  "id": 1,
  "name": "John Doe",
  "role": "user"
}
```

---

## Booking

Each booking must have:

* `id`
* `userId` (creator)
* `startTime`
* `endTime`
* `createdAt`

### Example

```json
{
  "id": 1,
  "userId": 1,
  "startTime": "2026-06-01T09:00:00Z",
  "endTime": "2026-06-01T10:00:00Z",
  "createdAt": "2026-06-01T08:00:00Z"
}
```

---

# Booking Rules

1. `startTime` must be before `endTime`.

2. Bookings must not overlap.

3. Overlap detection must correctly handle:

   * Identical ranges
   * Partial overlaps
   * One range fully inside another
   * Back-to-back bookings (clearly define your logic)

4. All time handling must be consistent and documented.

5. Invalid operations must return clear error responses.

### Example Overlap Scenarios

| Existing Booking | New Booking | Result                                           |
| ---------------- | ----------- | ------------------------------------------------ |
| 09:00–10:00      | 09:00–10:00 | ❌ Reject                                         |
| 09:00–10:00      | 09:30–10:30 | ❌ Reject                                         |
| 09:00–11:00      | 09:30–10:00 | ❌ Reject                                         |
| 09:00–10:00      | 10:00–11:00 | ✅ Allow (if back-to-back bookings are permitted) |

---

# Permissions

## User

### Can

* Create booking
* View all bookings
* Delete their own bookings only

### Cannot

* Delete other users' bookings
* Manage users

---

## Owner

### Can

* Create booking
* View all bookings
* Delete any booking
* View bookings grouped by user
* View basic usage summary (e.g., total bookings per user)

### Cannot

* Create users
* Delete users
* Change user roles

---

## Admin

### Can

* Create users
* Delete users
* Change user roles
* View all users
* View all bookings
* Delete any booking

### User Deletion Behavior

The system behavior when deleting a user must be clearly defined. Examples include:

* Delete all associated bookings
* Keep bookings but mark them as belonging to a deleted user
* Transfer bookings to another user

Document the chosen approach.

---

# API Requirements

You may design the route structure.

However, the API must clearly support:

* User management (Admin)
* Booking creation
* Booking deletion (with permission rules enforced server-side)
* Listing bookings
* Listing users
* Summary/Aggregation endpoint for Owner/Admin

### Important

All permission checks **must be enforced in the backend**.

---

# Frontend Requirements

The frontend must:

* Allow selecting or logging in as a specific user

* Display the current user's role clearly

* Support:

  * Booking creation
  * Viewing bookings
  * Deleting bookings (based on role permissions)
  * User management (Admin only)

* Display validation errors clearly

* Display permission errors clearly

* Provide a usable interface

> The layout does not need to be visually polished, but it should be functional and user-friendly.

### Communication

The frontend must communicate with the backend API.

---

# Deliverables

## Backend

* Node.js HTTP API
* Role-based authorization
* Booking validation
* User management
* Summary endpoints

## Frontend

* User selection/login
* Booking management interface
* User management interface (Admin)
* Error handling and validation feedback

---

# Evaluation Criteria

* Correct implementation of booking rules
* Proper permission enforcement
* Clean API design
* Frontend usability
* Code quality and maintainability
* Documentation and assumptions
* Handling of edge cases

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { MemoryBookingRepository } from "../src/repositories/memoryBookingRepository.js";
import type { Booking, User } from "../src/domain/types.js";

const createdAt = new Date("2026-06-01T00:00:00.000Z");

function user(id: number, name: string, role: User["role"]): User {
  return { id, name, role, createdAt };
}

function booking(id: number, userId: number, startTime: string, endTime: string): Booking {
  return {
    id,
    userId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    createdAt
  };
}

describe("meeting room API", () => {
  let repository: MemoryBookingRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = new MemoryBookingRepository({
      users: [
        user(1, "Ada Admin", "admin"),
        user(2, "Owen Owner", "owner"),
        user(3, "Uma User", "user"),
        user(4, "Uri User", "user")
      ],
      bookings: []
    });
    app = createApp(repository);
  });

  it("requires x-user-id for protected routes", async () => {
    const response = await request(app).get("/api/bookings");

    expect(response.status).toBe(401);
    expect(response.body.error.message).toContain("x-user-id");
  });

  it("accepts a valid booking", async () => {
    const response = await request(app)
      .post("/api/bookings")
      .set("x-user-id", "3")
      .send({
        startTime: "2026-06-01T09:00:00.000Z",
        endTime: "2026-06-01T10:00:00.000Z"
      });

    expect(response.status).toBe(201);
    expect(response.body.booking.userId).toBe(3);
  });

  it("rejects identical overlapping bookings", async () => {
    await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T10:00:00.000Z")
    });

    const response = await request(app)
      .post("/api/bookings")
      .set("x-user-id", "4")
      .send({
        startTime: "2026-06-01T09:00:00.000Z",
        endTime: "2026-06-01T10:00:00.000Z"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain("overlaps");
  });

  it("rejects partial overlaps", async () => {
    await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T10:00:00.000Z")
    });

    const response = await request(app)
      .post("/api/bookings")
      .set("x-user-id", "4")
      .send({
        startTime: "2026-06-01T09:30:00.000Z",
        endTime: "2026-06-01T10:30:00.000Z"
      });

    expect(response.status).toBe(400);
  });

  it("rejects contained overlaps", async () => {
    await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T11:00:00.000Z")
    });

    const response = await request(app)
      .post("/api/bookings")
      .set("x-user-id", "4")
      .send({
        startTime: "2026-06-01T09:30:00.000Z",
        endTime: "2026-06-01T10:00:00.000Z"
      });

    expect(response.status).toBe(400);
  });

  it("allows back-to-back bookings", async () => {
    await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T10:00:00.000Z")
    });

    const response = await request(app)
      .post("/api/bookings")
      .set("x-user-id", "4")
      .send({
        startTime: "2026-06-01T10:00:00.000Z",
        endTime: "2026-06-01T11:00:00.000Z"
      });

    expect(response.status).toBe(201);
  });

  it("rejects invalid dates and non-positive ranges", async () => {
    const invalidDate = await request(app)
      .post("/api/bookings")
      .set("x-user-id", "3")
      .send({
        startTime: "2026-06-01T09:00:00",
        endTime: "2026-06-01T10:00:00.000Z"
      });

    const backwards = await request(app)
      .post("/api/bookings")
      .set("x-user-id", "3")
      .send({
        startTime: "2026-06-01T10:00:00.000Z",
        endTime: "2026-06-01T10:00:00.000Z"
      });

    expect(invalidDate.status).toBe(400);
    expect(backwards.status).toBe(400);
  });

  it("allows a user to delete their own booking", async () => {
    const ownBooking = await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T10:00:00.000Z")
    });

    const response = await request(app)
      .delete(`/api/bookings/${ownBooking.id}`)
      .set("x-user-id", "3");

    expect(response.status).toBe(204);
    expect(await repository.getBooking(ownBooking.id)).toBeNull();
  });

  it("prevents a user from deleting another user's booking", async () => {
    const otherBooking = await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T10:00:00.000Z")
    });

    const response = await request(app)
      .delete(`/api/bookings/${otherBooking.id}`)
      .set("x-user-id", "4");

    expect(response.status).toBe(403);
  });

  it("allows owner and admin to delete any booking", async () => {
    const ownerDeletedBooking = await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T10:00:00.000Z")
    });
    const adminDeletedBooking = await repository.createBooking({
      userId: 4,
      startTime: new Date("2026-06-01T10:00:00.000Z"),
      endTime: new Date("2026-06-01T11:00:00.000Z")
    });

    const ownerResponse = await request(app)
      .delete(`/api/bookings/${ownerDeletedBooking.id}`)
      .set("x-user-id", "2");
    const adminResponse = await request(app)
      .delete(`/api/bookings/${adminDeletedBooking.id}`)
      .set("x-user-id", "1");

    expect(ownerResponse.status).toBe(204);
    expect(adminResponse.status).toBe(204);
  });

  it("allows admin user management and blocks other roles", async () => {
    const createResponse = await request(app)
      .post("/api/users")
      .set("x-user-id", "1")
      .send({ name: "New User", role: "user" });
    const blockedResponse = await request(app)
      .post("/api/users")
      .set("x-user-id", "2")
      .send({ name: "Blocked User", role: "user" });

    expect(createResponse.status).toBe(201);
    expect(blockedResponse.status).toBe(403);
  });

  it("cascades bookings when an admin deletes a user", async () => {
    const userBooking = await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T10:00:00.000Z")
    });

    const response = await request(app).delete("/api/users/3").set("x-user-id", "1");

    expect(response.status).toBe(204);
    expect(await repository.getUser(3)).toBeNull();
    expect(await repository.getBooking(userBooking.id)).toBeNull();
  });

  it("prevents deleting Ada Admin", async () => {
    const response = await request(app).delete("/api/users/1").set("x-user-id", "1");

    expect(response.status).toBe(403);
    expect(response.body.error.message).toBe("Ada Admin cannot be deleted");
    expect(await repository.getUser(1)).not.toBeNull();
  });

  it("returns summary for owner or admin only", async () => {
    await repository.createBooking({
      userId: 3,
      startTime: new Date("2026-06-01T09:00:00.000Z"),
      endTime: new Date("2026-06-01T10:00:00.000Z")
    });

    const ownerResponse = await request(app).get("/api/summary").set("x-user-id", "2");
    const userResponse = await request(app).get("/api/summary").set("x-user-id", "3");

    expect(ownerResponse.status).toBe(200);
    expect(ownerResponse.body.summary.totalBookings).toBe(1);
    expect(userResponse.status).toBe(403);
  });
});

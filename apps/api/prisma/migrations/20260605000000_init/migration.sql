CREATE TYPE "Role" AS ENUM ('admin', 'owner', 'user');

CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bookings" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "startTime" TIMESTAMPTZ(3) NOT NULL,
  "endTime" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bookings_time_order_check" CHECK ("startTime" < "endTime")
);

CREATE INDEX "bookings_startTime_endTime_idx" ON "bookings"("startTime", "endTime");
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (tstzrange("startTime", "endTime", '[)') WITH &&);

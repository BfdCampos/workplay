-- AlterTable
ALTER TABLE "User" ADD COLUMN "isFake" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DemoState" (
    "id" INTEGER NOT NULL DEFAULT 0,
    "signupCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DemoState_pkey" PRIMARY KEY ("id")
);

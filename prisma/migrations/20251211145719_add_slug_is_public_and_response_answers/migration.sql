/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `updatedAt` on the `Form` table. All the data in the column will be lost.
  - You are about to alter the column `questions` on the `Form` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `answers` on the `Response` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Session";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "questions" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "shop" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Form" ("createdAt", "id", "questions", "shop", "status", "title") SELECT "createdAt", "id", "questions", "shop", "status", "title" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
CREATE UNIQUE INDEX "Form_slug_key" ON "Form"("slug");
CREATE TABLE "new_Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "answers" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Response_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Response" ("answers", "createdAt", "formId", "id") SELECT "answers", "createdAt", "formId", "id" FROM "Response";
DROP TABLE "Response";
ALTER TABLE "new_Response" RENAME TO "Response";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

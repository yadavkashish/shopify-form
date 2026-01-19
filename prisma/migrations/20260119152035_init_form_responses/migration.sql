/*
  Warnings:

  - Added the required column `settings` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `questions` on the `Form` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `answers` on the `Response` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "settings" JSONB NOT NULL,
DROP COLUMN "questions",
ADD COLUMN     "questions" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "answers",
ADD COLUMN     "answers" JSONB NOT NULL;

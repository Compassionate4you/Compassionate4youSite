-- DT-904 / DT-906 Sprint 9: save what each chat message is (translation key,
-- FAQ id, buttons), not only its words, so earlier messages can switch
-- language and bot replies are no longer blank after a page reload.
-- Only adds nullable columns; existing rows are unchanged.

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "action_buttons" JSONB,
ADD COLUMN     "faq_id" TEXT,
ADD COLUMN     "text_key" TEXT;

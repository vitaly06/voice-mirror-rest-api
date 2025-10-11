-- VoiceMirror Database Schema Dump
-- Generated automatically for Docker initialization

-- This file will be executed when PostgreSQL container starts for the first time
-- It contains the initial schema and any seed data for VoiceMirror application

-- Note: Prisma will handle the actual schema creation via `prisma db push`
-- This file is here for future manual database initialization if needed

-- Example seed data (uncomment if needed):
-- INSERT INTO "Audio" (id, "originalUrl", "clonedUrl", "voiceId", status, "createdAt", "updatedAt")
-- VALUES (1, 'http://localhost:3000/uploads/example.wav', null, null, 'processing', NOW(), NOW());

-- INSERT INTO "ChatResponse" (id, question, "audioUrl", "voiceId", "createdAt")
-- VALUES 
-- (1, 'Как дела?', 'http://localhost:3000/uploads/mock-response-1.mp3', 'mock_voice_1', NOW()),
-- (2, 'Расскажи историю', 'http://localhost:3000/uploads/mock-response-2.mp3', 'mock_voice_1', NOW());
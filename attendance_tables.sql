-- Create attendance_tokens table
CREATE TABLE IF NOT EXISTS attendance_tokens (
    id BIGSERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES users(id),
    event_id TEXT NOT NULL REFERENCES career_sessions(session_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(student_id, event_id)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id),
    event_id TEXT NOT NULL REFERENCES career_sessions(session_id),
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, event_id)
);

-- Create event_qr_codes table for event-wide QR codes
CREATE TABLE IF NOT EXISTS event_qr_codes (
    id BIGSERIAL PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES career_sessions(session_id),
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(event_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_tokens_token ON attendance_tokens(token);
CREATE INDEX IF NOT EXISTS idx_attendance_tokens_student ON attendance_tokens(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tokens_event ON attendance_tokens(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_event ON attendance_records(event_id);
CREATE INDEX IF NOT EXISTS idx_event_qr_codes_token ON event_qr_codes(token);
CREATE INDEX IF NOT EXISTS idx_event_qr_codes_event ON event_qr_codes(event_id); 
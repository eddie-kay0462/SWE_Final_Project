-- Create event_sessions table
CREATE TABLE IF NOT EXISTS event_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    session_id TEXT NOT NULL REFERENCES event_sessions(id),
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    qr_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, session_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_qr_hash ON attendance_records(qr_hash);

-- Insert sample event data
INSERT INTO event_sessions (id, title, date, time, location)
VALUES 
    ('event-session-001', 'Getting an Internship', '2025-03-04', '17:00', 'Career Center'),
    ('event-session-002', 'Resume Workshop', '2025-03-06', '14:00', 'Online')
ON CONFLICT (id) DO NOTHING; 
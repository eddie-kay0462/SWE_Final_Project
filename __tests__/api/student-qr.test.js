import { GET } from '@/app/api/dashboard/student/attendance/qr/route';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock Next.js Request
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
  }
};

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock createServerClient
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock next/headers
jest.mock('next/headers', () => {
  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };
  return {
    cookies: jest.fn(() => mockCookieStore),
  };
});

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options = {}) => ({
      data,
      status: options.status || 200,
    })),
  },
}));

// Mock crypto
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  digest: jest.fn().mockReturnValue('mocked-hash-token'),
}));

describe('Student QR Code API', () => {
  let mockSupabase;
  const mockEvent = {
    session_id: '123',
    date: '2024-04-29',
    start_time: '10:00',
    end_time: '11:00',
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a fresh mock Supabase client for each test
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { 
            user: { 
              id: 'test-user-id',
              email: 'student@test.com'
            } 
          },
          error: null 
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    };

    // Setup createServerClient mock
    createServerClient.mockReturnValue(mockSupabase);
  });

  describe('GET handler', () => {
    it('should generate QR code data for valid event', async () => {
      // Mock user data
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'student-123' },
              error: null
            })
          };
        }
        if (table === 'career_sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockEvent,
              error: null
            })
          };
        }
        if (table === 'attendance_tokens') {
          return {
            upsert: jest.fn().mockResolvedValue({
              error: null
            })
          };
        }
        return mockSupabase;
      });

      // Create a mock request with eventId
      const request = new Request('http://localhost/api/dashboard/student/attendance/qr?eventId=123');

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        qrUrl: 'https://csoft-vert.vercel.app/checkin?token=mocked-hash-token',
        expiresAt: new Date('2024-04-29 11:00').toISOString()
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock authentication error
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      const request = new Request('http://localhost/api/dashboard/student/attendance/qr?eventId=123');
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(response.data).toEqual({
        error: 'Unauthorized. Please log in.'
      });
    });

    it('should return 400 if eventId is missing', async () => {
      const request = new Request('http://localhost/api/dashboard/student/attendance/qr');
      const response = await GET(request);

      expect(response.status).toBe(400);
      expect(response.data).toEqual({
        error: 'Event ID is required'
      });
    });

    it('should return 404 if user not found', async () => {
      // Mock user not found
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('User not found')
            })
          };
        }
        return mockSupabase;
      });

      const request = new Request('http://localhost/api/dashboard/student/attendance/qr?eventId=123');
      const response = await GET(request);

      expect(response.status).toBe(404);
      expect(response.data).toEqual({
        error: 'User not found'
      });
    });

    it('should return 404 if event not found', async () => {
      // Mock event not found
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'student-123' },
              error: null
            })
          };
        }
        if (table === 'career_sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Event not found')
            })
          };
        }
        return mockSupabase;
      });

      const request = new Request('http://localhost/api/dashboard/student/attendance/qr?eventId=123');
      const response = await GET(request);

      expect(response.status).toBe(404);
      expect(response.data).toEqual({
        error: 'Event not found'
      });
    });

    it('should handle token storage errors', async () => {
      // Mock successful user and event fetch, but token storage error
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'student-123' },
              error: null
            })
          };
        }
        if (table === 'career_sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockEvent,
              error: null
            })
          };
        }
        if (table === 'attendance_tokens') {
          return {
            upsert: jest.fn().mockResolvedValue({
              error: new Error('Token storage failed')
            })
          };
        }
        return mockSupabase;
      });

      const request = new Request('http://localhost/api/dashboard/student/attendance/qr?eventId=123');
      const response = await GET(request);

      expect(response.status).toBe(500);
      expect(response.data).toEqual({
        error: 'Failed to generate attendance token'
      });
    });
  });
}); 
import { GET } from '@/app/api/dashboard/admin/profile/route';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

describe('Admin Profile API', () => {
  let mockSupabase;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a fresh mock Supabase client for each test
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { 
            user: { 
              id: 'test-admin-id',
              email: 'admin@test.com'
            } 
          },
          error: null 
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };

    // Setup createServerClient mock
    createServerClient.mockReturnValue(mockSupabase);
  });

  describe('GET handler', () => {
    it('should return admin profile data', async () => {
      // Mock admin user profile
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'test-admin-id',
                fname: 'John',
                lname: 'Doe',
                email: 'admin@test.com',
                role_id: 2 // Admin role
              },
              error: null
            })
          };
        }
        return mockSupabase;
      });

      const response = await GET();

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        fname: 'John',
        lname: 'Doe',
        email: 'admin@test.com',
        id: 'test-admin-id'
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock authentication error
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      const response = await GET();

      expect(response.status).toBe(401);
      expect(response.data).toEqual({
        error: 'Not authenticated'
      });
    });

    it('should return 403 for non-admin user', async () => {
      // Mock non-admin user profile
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'test-user-id',
                fname: 'Jane',
                lname: 'Doe',
                email: 'user@test.com',
                role_id: 1 // Non-admin role
              },
              error: null
            })
          };
        }
        return mockSupabase;
      });

      const response = await GET();

      expect(response.status).toBe(403);
      expect(response.data).toEqual({
        error: 'Unauthorized: Admin access required'
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          };
        }
        return mockSupabase;
      });

      const response = await GET();

      expect(response.status).toBe(500);
      expect(response.data).toEqual({
        error: 'An unexpected server error occurred.'
      });
    });
  });
}); 
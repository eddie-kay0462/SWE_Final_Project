import { GET } from '@/app/api/dashboard/admin/events/route';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options = {}) => ({ data, status: options.status || 200 })),
  },
}));

describe('Admin Events API - GET', () => {
  let mockSupabase;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'admin-id', email: 'admin@test.com' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: jest.fn().mockReturnThis(),
    };

    createClient.mockResolvedValue(mockSupabase);
    cookies.mockReturnValue({
      get: jest.fn(),
    });
  });

  it('returns formatted event data on success', async () => {
    const today = new Date().toISOString().split('T')[0];

    mockSupabase.from.mockImplementation((table) => {
      switch (table) {
        case 'career_sessions':
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnThis(),
            order: jest.fn().mockImplementation(() => ({
              data: [
                {
                  session_id: 'session123',
                  title: 'Event A',
                  date: today,
                  start_time: '10:00',
                  end_time: '11:00',
                  location: 'Auditorium',
                  description: 'Career event',
                  qr_code: 'code123',
                },
              ],
              error: null,
            })),
          };
        case 'event_feedback':
          return {
            select: jest.fn().mockResolvedValue({
              data: [
                {
                  event_id: 'session123',
                  rating: 4,
                  comments: 'Great',
                  user_id: 'user1',
                  users: { fname: 'John', lname: 'Doe' },
                },
              ],
              error: null,
            }),
          };
        case 'attendance':
          return {
            select: jest.fn().mockResolvedValue({
              data: [{ session_id: 'session123', id: 1 }],
              error: null,
            }),
            throwOnError: jest.fn().mockReturnThis(),
          };
        default:
          return mockSupabase;
      }
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.data.upcomingEvents.length).toBeGreaterThan(0);
    expect(response.data.upcomingEvents[0]).toHaveProperty('averageRating');
  });

  it('returns 500 if fetching events fails', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'career_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: null, error: new Error('fail') }),
        };
      }
      return mockSupabase;
    });

    const response = await GET();

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Failed to fetch upcoming events');
  });

  it('returns 500 on internal error', async () => {
    createClient.mockRejectedValue(new Error('Unexpected'));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Internal server error');
  });
});

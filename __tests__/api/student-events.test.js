import { GET } from '@/app/api/dashboard/student/events/route';
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

// Mock Date
const mockDate = new Date('2024-04-01');
const realDate = global.Date;
global.Date = class extends Date {
  constructor(date) {
    if (date) {
      return new realDate(date);
    }
    return mockDate;
  }
  static now() {
    return mockDate.getTime();
  }
};

describe('Student Events API', () => {
  let mockSupabase;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a fresh mock Supabase client for each test
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    // Setup createServerClient mock
    createServerClient.mockReturnValue(mockSupabase);
  });

  afterAll(() => {
    // Restore Date
    global.Date = realDate;
  });

  it('should return upcoming and past events successfully', async () => {
    // Mock data
    const mockEvents = [
      {
        session_id: 1,
        title: 'Test Event 1',
        description: 'Test Description 1',
        date: '2024-05-01', // Future date
        start_time: '10:00',
        end_time: '11:00',
        location: 'Test Location 1',
      },
      {
        session_id: 2,
        title: 'Test Event 2',
        description: 'Test Description 2',
        date: '2024-03-01', // Past date
        start_time: '14:00',
        end_time: '15:00',
        location: 'Test Location 2',
      },
    ];

    // Mock Supabase response for upcoming events
    const mockUpcomingQuery = {
      data: [mockEvents[0]],
      error: null,
    };

    // Mock Supabase response for past events
    const mockPastQuery = {
      data: [mockEvents[1]],
      error: null,
    };

    // Mock the query chain
    let isUpcomingQuery = true;
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'career_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lt: jest.fn().mockReturnThis(),
          order: jest.fn().mockImplementation(() => {
            const result = isUpcomingQuery ? mockUpcomingQuery : mockPastQuery;
            isUpcomingQuery = false;
            return result;
          }),
        };
      }
      if (table === 'event_feedback') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
        };
      }
      return mockSupabase;
    });

    const response = await GET();
    const expectedUpcomingEvent = {
      id: mockEvents[0].session_id,
      title: mockEvents[0].title,
      date: new Date(mockEvents[0].date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      start_time: mockEvents[0].start_time,
      end_time: mockEvents[0].end_time,
      location: mockEvents[0].location,
      attendees: expect.any(Number),
      description: mockEvents[0].description,
      tags: ['Career Development'],
      status: 'upcoming',
      hasFeedback: false,
      feedback: null,
    };

    const expectedPastEvent = {
      id: mockEvents[1].session_id,
      title: mockEvents[1].title,
      date: new Date(mockEvents[1].date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      start_time: mockEvents[1].start_time,
      end_time: mockEvents[1].end_time,
      location: mockEvents[1].location,
      attendees: expect.any(Number),
      description: mockEvents[1].description,
      tags: ['Career Development'],
      status: 'past',
      hasFeedback: false,
      feedback: null,
    };

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      upcomingEvents: [expectedUpcomingEvent],
      pastEvents: [expectedPastEvent],
    });
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'career_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValueOnce({ data: null, error: new Error('Database error') }),
        };
      }
      return mockSupabase;
    });

    const response = await GET();

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Failed to fetch upcoming events');
  });

  it('should include user feedback when user is logged in', async () => {
    // Mock data
    const mockEvents = [
      {
        session_id: 1,
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-05-01', // Future date
        start_time: '10:00',
        end_time: '11:00',
        location: 'Test Location',
      },
    ];

    const mockFeedback = [
      {
        event_id: 1,
        rating: 5,
        comments: 'Great event!',
      },
    ];

    // Mock Supabase responses
    let isUpcomingQuery = true;
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'career_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lt: jest.fn().mockReturnThis(),
          order: jest.fn().mockImplementation(() => {
            const result = isUpcomingQuery ? { data: mockEvents, error: null } : { data: [], error: null };
            isUpcomingQuery = false;
            return result;
          }),
        };
      }
      if (table === 'event_feedback') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValueOnce({ data: mockFeedback, error: null }),
        };
      }
      return mockSupabase;
    });

    const response = await GET();
    const expectedEvent = {
      id: mockEvents[0].session_id,
      title: mockEvents[0].title,
      date: new Date(mockEvents[0].date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      start_time: mockEvents[0].start_time,
      end_time: mockEvents[0].end_time,
      location: mockEvents[0].location,
      attendees: expect.any(Number),
      description: mockEvents[0].description,
      tags: ['Career Development'],
      status: 'upcoming',
      hasFeedback: true,
      feedback: {
        rating: mockFeedback[0].rating,
        comments: mockFeedback[0].comments,
      },
    };

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      upcomingEvents: [expectedEvent],
      pastEvents: [],
    });
  });
}); 
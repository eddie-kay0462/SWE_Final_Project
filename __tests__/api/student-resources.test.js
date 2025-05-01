

import { GET } from "@/app/api/dashboard/student/resources/route";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Mock environment
jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options = {}) => ({
      data,
      status: options.status || 200,
    })),
  },
}));

describe("Student Resources API - GET", () => {
  let mockSupabase;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: "student-user-id",
              email: "student@example.com",
            },
          },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn(),
    };

    createClient.mockReturnValue(mockSupabase);
  });

  it("should return resources for a student user", async () => {
    // Simulate student profile and resources
    mockSupabase.single.mockResolvedValueOnce({
      data: { role_id: 3 },
      error: null,
    });

    mockSupabase.order.mockResolvedValueOnce({
      data: [
        {
          id: "1",
          title: "Resume Template",
          description: "A clean resume template",
          url: "https://example.com/resume.pdf",
          created_at: "2025-01-01",
          type: "pdf",
        },
      ],
      error: null,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.data.resources).toHaveLength(1);
    expect(response.data.user.email).toBe("student@example.com");
  });

  it("should return 403 for non-student user", async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { role_id: 2 }, // not a student
      error: null,
    });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(response.data.error).toBe("Unauthorized - Student access required");
  });

  it("should return 500 if Supabase errors", async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: new Error("DB error"),
    });

    const response = await GET();

    expect(response.status).toBe(500);
    expect(response.data.error).toBe("Internal server error");
  });
});

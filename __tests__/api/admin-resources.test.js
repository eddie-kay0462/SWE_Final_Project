

import { GET } from "@/app/api/dashboard/admin/resources/route";
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

describe("Admin Resources API - GET", () => {
  let mockSupabase;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: "admin-user-id",
              email: "admin@example.com",
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

  it("should return resources for an admin user", async () => {
    // Simulate admin profile and resources
    mockSupabase.single.mockResolvedValueOnce({
      data: { role_id: 2 },
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
    expect(response.data.user.email).toBe("admin@example.com");
  });

  it("should return 403 for non-admin user", async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { role_id: 3 }, // not an admin
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

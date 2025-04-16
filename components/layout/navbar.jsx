"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, Menu } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


const pathMap = {
  student: {
    "/dashboard/student": { label: "Dashboard", icon: Home },
    "/dashboard/student/profile": { label: "Profile" },
    "/dashboard/student/resume": { label: "Resume" },
    "/dashboard/student/career-roadmap": { label: "Career Roadmap" },
    "/dashboard/student/internship-request": { label: "Internship Requests" },
    "/dashboard/student/one-on-one": { label: "1-on-1 Sessions" },
    "/dashboard/student/notifications": { label: "Notifications" },
  },
  admin: {
    "/dashboard/admin": { label: "Dashboard", icon: Home },
    "/dashboard/admin/profile": { label: "Profile" },
    "/dashboard/admin/internship-request": { label: "Internship Requests" },
    "/dashboard/admin/sessions": { label: "1-on-1 Sessions" },
    "/dashboard/admin/events": { label: "Events" },
    "/dashboard/admin/students": { label: "Student Profiles" },
    "/dashboard/admin/notifications": { label: "Notifications" },
  },
  superAdmin: {
    "/dashboard/super-admin": { label: "Dashboard", icon: Home },
    "/dashboard/super-admin/profile": { label: "Profile" },
    "/dashboard/super-admin/users": { label: "User Management" },
    "/dashboard/super-admin/analytics": { label: "System Analytics" },
    "/dashboard/super-admin/audit": { label: "Audit Logs" },
    "/dashboard/super-admin/security": { label: "Security & Compliance" },
    "/dashboard/super-admin/settings": { label: "System Settings" },
    "/dashboard/super-admin/dev-tools": { label: "Dev Tools" },
  },
};

const Navbar = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Determine user role from pathname
  const userRole = pathname.includes("super-admin")
    ? "superAdmin"
    : pathname.includes("admin")
    ? "admin"
    : "student";

  // Get breadcrumb paths
  const getBreadcrumbPaths = () => {
    const paths = [];
    const parts = pathname.split("/").filter(Boolean);
    let currentPath = "";

    parts.forEach((part) => {
      currentPath += `/${part}`;
      if (pathMap[userRole][currentPath]) {
        paths.push({
          path: currentPath,
          ...pathMap[userRole][currentPath],
        });
      }
    });

    return paths;
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Menu button for mobile */}
      <button
        onClick={onMenuClick}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:hidden h-9 w-9"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </button>

      {/* Navigation buttons */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </button>
        <button
          onClick={() => router.forward()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Go forward</span>
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbPaths.map((item, index) => (
              <React.Fragment key={item.path}>
                <BreadcrumbItem>
                  {index === breadcrumbPaths.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.path} className="inline-flex items-center gap-1.5">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbPaths.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default Navbar; 
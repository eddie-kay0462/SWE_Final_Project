# App Directory


[GitHub Repository](https://github.com/eddie-kay0462/SWE_Final_Project/)

This directory contains the core application logic and user interface components for the SWE Final Project, structured using the Next.js App Router.

## Overview

The `app` directory organizes the application by feature routes and includes global layout files, styling, and utility components.

## Key Files and Directories

-   **`layout.js`**: Defines the root layout shared across all pages.
-   **`page.jsx`**: The main entry page component for the root route (`/`).
-   **`globals.css`**: Global CSS styles applied throughout the application.
-   **`providers.jsx` / `providers.js`**: Contains context providers or other setup components wrapping the application.
-   **`api/`**: Holds API route handlers for server-side logic and data fetching.
-   **`auth/`**: Contains components and routes related to user authentication (login, signup, etc.).
-   **`checkin/`**: Components and routes for the check-in feature.
-   **`dashboard/`**: Components and routes for the user dashboard.
-   **`instruments/`**: Components and routes related to musical instruments or related features.
-   **`main/`**: Likely contains core application pages or components after authentication.
-   **`take-attendance/`**: Components and routes for the attendance tracking feature.
-   **`utils/`**: Shared utility functions or helper components used across different parts of the application.
-   **`error.jsx`**: Defines the error UI boundary for this segment.
-   **`not-found.jsx`**: Defines the UI for 404 Not Found errors.
-   **`loading-demo.jsx`**: A demo component, possibly related to loading states.



## Getting Started

Follow these steps to get the project running locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/eddie-kay0462/SWE_Final_Project/
    cd SWE_Final_Project/
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and fill in your specific values:
    ```bash
    cp .env.example .env.local
    ```
    See the "Environment Variables" section below for details on the required variables.

4.  **Run the development server:**
    Using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

This project requires certain environment variables to be set. Create a `.env.local` file in the root directory by copying `.env.example` (if it exists) or creating it manually.

```env
# Example environment variables (replace with your actual values)
# NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Add other necessary variables like database connection strings, API keys, etc.
# DATABASE_URL=...
# THIRD_PARTY_API_KEY=...
```

Make sure to replace the placeholder values with your actual credentials and configuration. **Never commit your `.env.local` file to version control.**

## Project Structure

The project follows a standard Next.js structure with the App Router:

-   **`/app`**: Contains the core application UI, routing, and layouts. See `app/README.md` for more details.
    -   `/app/api`**: API routes for server-side logic.
    -   `/app/(features)`**: Folders like `auth`, `dashboard`, `checkin`, etc., organize routes and components by feature.
    -   `/app/layout.js`**: The root layout component.
    -   `/app/page.jsx`**: The main landing page component.
-   **`/components`**: (Optional, if you have one) Shared UI components used across the application.
-   **`/lib` or `/utils`**: Utility functions, helper scripts, or library configurations.
-   **`/public`**: Static assets like images, fonts, etc.
-   **`/styles` or `/css`**: Global styles or CSS modules.

## How Things Work

This project, **Career Services On Finger Tips (CSOFT)**, is a web platform designed to modernize and streamline the operations of the Career Services Office at Ashesi University. It automates key functions like attendance tracking, internship request management, and communication between students and advisors.

### Technology Stack

-   **Frontend Framework:** Next.js 14 (with App Router) / React.js
-   **Backend & Database:** Supabase (PostgreSQL database, Authentication)
-   **UI:** Tailwind CSS, shadcn/ui
-   **Deployment:** Vercel

### Architecture

CSOFT utilizes a **3-Tier Architecture** leveraging Next.js features:

1.  **Presentation Layer (UI):**
    -   Built with React components located primarily in the `app/` directory (using the App Router) and shared components in `components/`.
    -   Uses Next.js Server Components for rendering and data fetching, and Client Components for interactivity.
    -   Styling is handled by Tailwind CSS and `shadcn/ui`.
2.  **Business Logic Layer (Application):**
    -   Implemented using Next.js API Routes (`app/api/`) and Server Actions.
    -   Handles core application logic, business rules, data validation, and interacts with the data layer.
    -   Authentication and authorization are managed via Supabase Auth and Next.js Middleware (`middleware.js`).
3.  **Data Access Layer (Data):**
    -   Interacts with the Supabase PostgreSQL database.
    -   Uses the Supabase client libraries (configured in `utils/supabase/`) for database operations (CRUD) and real-time updates.

### Key Features

-   **Multi-Role User Management:** Supports Students, Admins, and Super Admins with distinct dashboards and permissions.
-   **Event Management & Attendance Tracking:** Create events, generate QR codes for check-in, track attendance, and collect feedback.
-   **Internship Request Management:** Workflow for students to request internship letters, including eligibility checks (event attendance, feedback, 1-on-1 session).
-   **Resume Review System:** Students upload resumes for feedback from advisors.
-   **One-on-One Session Booking:** Students book sessions with advisors based on availability.
-   **Reporting & Analytics:** Dashboards for advisors to view attendance, request trends, etc.
-   **Resource Hub:** Centralized location for templates (resumes, cover letters) and guides.
-   **Notifications:** Automated alerts for events, request status updates, etc.

### Deployment

The application is deployed on **Vercel**: [https://csoft-vert.vercel.app/](https://csoft-vert.vercel.app/)

It leverages Vercel's integration with Next.js for optimized builds, serverless functions, CDN delivery, environment variable management, and performance/security features.

## Development Methodology

This project was developed using the **Agile methodology**, specifically the **Scrum framework**. Key aspects include:
-   Two-week sprint cycles.
-   Sprint planning, daily standups, and retrospectives.
-   **Jira** was used for task management, documentation, and tracking progress.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) file for details, or visit [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT).

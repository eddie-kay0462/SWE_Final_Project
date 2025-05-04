# CSOFT - Career Services On Your Fingertips


[Video Demo Link](https://ashe.si/3Sj7WNh)

This directory contains the core application logic and user interface components for the SWE Final Project, structured using the Next.js App Router.

## Overview

The `app` directory organizes the application by feature routes and includes global layout files, styling, and utility components.

## Key Design Patterns

This application utilizes several key software design patterns to ensure maintainability, scalability, and efficient state management:

-   **Observer Pattern (Theme Management):**
    -   **Purpose:** To allow components to react dynamically to changes in the application's theme (e.g., switching between light and dark mode).
    -   **Implementation:** A central theme provider (likely using React Context API or a similar state management solution like Zustand or Redux) acts as the 'subject'. Components interested in theme changes 'subscribe' to this provider. When the theme is updated (e.g., by user action), the provider notifies all subscribed components, causing them to re-render with the new theme styles. This decouples theme logic from individual components.

-   **Singleton Pattern (e.g., Supabase Client):**
    -   **Purpose:** To ensure that only one instance of a specific resource, such as the Supabase client, is created and used throughout the application.
    -   **Implementation:** A utility module (e.g., within `utils/supabase/`) typically initializes the Supabase client. Subsequent requests for the client receive the same, single instance. This conserves resources, prevents conflicting states, and centralizes the configuration and management of the database connection.

-   **Provider Pattern (React Context API):**
    -   **Purpose:** To manage global state (like user authentication, theme, etc.) and provide it down the component tree without prop drilling.
    -   **Implementation:** Context providers (like those potentially in `providers.jsx`) wrap parts of the application, making state and functions available to consuming components via hooks (`useContext`).

-   **Module Pattern (Utilities & API Handlers):**
    -   **Purpose:** To encapsulate related functions and data, promoting code organization and reusability.
    -   **Implementation:** Files within `utils/` or API route handlers in `app/api/` often group related functionalities, exporting only the necessary public interface.

-   **Factory Pattern (e.g., Component/Object Creation):**
    -   **Purpose:** To abstract the process of object creation, allowing the creation of different types of objects based on varying parameters or conditions without exposing the complex creation logic to the client.
    -   **Implementation:** While less common in a typical React/Next.js frontend directly, this pattern could be used in utility functions or backend services (e.g., a function that creates different types of notification objects based on the event type, or different UI component variants based on props).

-   **Strategy Pattern (e.g., Data Fetching/Handling):**
    -   **Purpose:** To define a family of algorithms, encapsulate each one, and make them interchangeable. This allows the algorithm to vary independently from clients that use it.
    -   **Implementation:** This could be applied to situations where multiple data fetching approaches exist (e.g., fetching from cache vs. network, using different Supabase query methods based on user role or data complexity) or different ways to handle user input validation based on the context. The specific strategy could be selected at runtime.

-   **Middleware Pattern (Next.js Middleware):**
    -   **Purpose:** To intercept requests before they reach their destination (e.g., API route or page) to perform cross-cutting concerns like authentication, authorization, logging, or redirects.
    -   **Implementation:** Next.js provides built-in support for middleware (`middleware.js` or `middleware.ts` in the root or `src/` directory). This function runs on the edge and can modify requests/responses or route users based on conditions (e.g., checking for a valid session cookie managed by Supabase Auth).

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

### API Docs
Our API Docs can be seen here: [CSOFT API Docs](https://nanaamoako.notion.site/API-Docs-1e925b900e6080ff8217dbbe7c64349e?pvs=4)
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

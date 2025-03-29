# Tale Tinker - Magical Bedtime Story Generator

Welcome to Tale Tinker, a Next.js application designed to craft personalized and enchanting bedtime stories for children using AI.

## Features

*   **AI-Powered Story Generation:** Leverages AI (likely via Vercel AI SDK) to create unique stories based on user prompts or presets.
*   **Preset Story Options:** Allows users to quickly generate stories by selecting predefined themes, characters, settings, and lengths.
*   **Interactive Chat Interface:** Provides a chat interface for users to directly interact with the AI and collaboratively build a story.
*   **User Authentication:** Uses Supabase for secure user authentication and session management.
*   **Theming:** Supports light and dark modes using `next-themes`.
*   **Responsive UI:** Built with Tailwind CSS and Shadcn UI for a clean and responsive user experience.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Authentication:** [Supabase](https://supabase.io/)
*   **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/)
*   **State Management:** React Context (`AuthProvider`), `useChat` hook
*   **UI Components:** `lucide-react` (icons), `sonner` (toast notifications)

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (app)/            # Authenticated routes (e.g., dashboard)
│   ├── auth/             # Authentication related pages (login, callback)
│   ├── api/              # API routes (e.g., /api/generate-story)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── home/             # Components specific to the landing page
│   ├── layout/           # General layout components (Navbar, Footer - if added)
│   ├── presets/          # Components for preset selection (PresetSelector)
│   ├── providers/        # Context providers (Auth, Theme)
│   ├── shared/           # Components shared across multiple features
│   └── ui/               # Shadcn UI components
├── config/               # Configuration files (e.g., presetOptions.ts)
├── lib/                  # Utility functions (e.g., cn utility)
├── styles/               # Global styles (if needed beyond globals.css)
└── utils/
    └── supabase/         # Supabase client, server, and middleware logic
public/                   # Static assets
.env.local                # Local environment variables (Supabase keys, etc.)
next.config.mjs           # Next.js configuration
tailwind.config.ts        # Tailwind CSS configuration
tsconfig.json             # TypeScript configuration
```

## Setup and Installation

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm
*   A Supabase account and project.

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd tale-tinker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Supabase:**
    *   Create a new project on [Supabase](https://supabase.io/).
    *   Go to your project settings -> API.
    *   Find your **Project URL** and **anon public** key.

4.  **Configure Environment Variables:**
    *   Create a `.env.local` file in the root of the project.
    *   Add your Supabase credentials:
        ```plaintext
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
        ```
    *   **(Important for Auth Redirects)** In your Supabase project dashboard:
        *   Go to Authentication -> URL Configuration.
        *   Set your **Site URL** to `http://localhost:3000` for local development.
        *   Add `http://localhost:3000/auth/callback` to the **Redirect URLs**.
        *   *For production, update these URLs accordingly.* 
    *   **(Optional: Add API Keys for AI Generation)** If your `/api/generate-story` endpoint requires specific API keys (e.g., OpenAI), add them here as well (ensure they are *not* prefixed with `NEXT_PUBLIC_` if they are server-side only).
        ```plaintext
        # Example for OpenAI
        # OPENAI_API_KEY=YOUR_OPENAI_KEY 
        ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

6.  **Open the application:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Key Configuration Points

*   **Authentication:** Managed via Supabase helpers (`@supabase/ssr`) in middleware (`src/middleware.ts`) and client/server utilities (`src/utils/supabase/`). `AuthProvider` (`src/components/providers/AuthProvider.tsx`) provides session context.
*   **Styling:** Primarily uses Tailwind CSS utility classes. Shadcn UI components are located in `src/components/ui` and customized via `globals.css` and `tailwind.config.ts`.
*   **AI Generation Endpoint:** The `/api/generate-story` route handles requests from both the preset form and the chat interface. Ensure this endpoint is correctly configured with necessary AI model access and API keys (if applicable).
*   **Presets:** Story preset options (themes, characters, etc.) are defined in `src/config/presetOptions.ts`.

## Available Scripts

*   `npm run dev`: Starts the development server with Turbopack.
*   `npm run build`: Creates a production build.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase using Next.js' built-in ESLint configuration.

## Deployment

This application is ready to be deployed on platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

**Important Deployment Steps:**

1.  **Environment Variables:** Configure your Supabase URL and Anon Key, plus any AI service API keys, in your deployment provider's environment variable settings.
2.  **Supabase Auth URLs:** Update the **Site URL** and **Redirect URLs** in your Supabase project settings to match your production domain(s).

---

_This README provides a starting point. Feel free to add more details about specific features, contribution guidelines, or troubleshooting tips._

Hi ALl trest comm

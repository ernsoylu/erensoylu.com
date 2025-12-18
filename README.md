# Eren Soylu - Personal Website & Blog

A modern, responsive personal website and blog built with React, TypeScript, and Supabase.

## Features

-   **Content Management System**: Custom admin panel to manage Posts, Pages, Categories, and Media.
-   **Rich Text Editor**: Integrated TipTap editor for writing and formatting content.
-   **Dynamic Routing**: Support for custom pages and blog post slugs.
-   **Responsive Design**: Fully optimized for Desktop and Mobile viewing.
    -   Mobile-friendly Navigation with Hamburger menu.
    -   Responsive Admin Dashboard.
-   **Modern UI/UX**: Built with [Shadcn UI](https://ui.shadcn.com/) and Tailwind CSS.
-   **Global Footer**: Consistent footer with dynamic links to privacy policy and terms.
-   **Authentication**: Secure admin access via Supabase Auth.

## Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons
-   **State Management**: React Hooks, React Router DOM
-   **Backend / Database**: Supabase (PostgreSQL, Auth, Storage)
-   **Editor**: TipTap

## Getting Started

### Prerequisites

-   Node.js (v18+ recommended)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd erensoylu.com
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Environment Setup:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

## Project Structure

-   `src/pages`: Public facing pages (Home, PostView, PageView, etc.)
-   `src/components`: Reusable UI components.
-   `src/components/admin`: Admin panel specific components.
-   `src/lib`: Utilities (Supabase client, Logger, etc.)

## Deployment

Build the project for production:

```bash
npm run build
```

This will generate a `dist` folder ready to be deployed to static hosting providers like Vercel or Netlify.

# VibeTravels

[![Project Status: MVP Development](https://img.shields.io/badge/status-MVP%20Development-blue)](https://github.com/user/repo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-powered travel planner that transforms your scattered notes into structured, personalized itineraries.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

VibeTravels aims to simplify the travel planning process by using AI to convert users' unstructured notes and ideas into detailed and engaging trip itineraries. The primary goal of the MVP is to validate the core assumption: users desire a tool that automates the creation of travel plans from their own free-form notes, tailored to their personal preferences.

## Tech Stack

The project is built with a modern, scalable, and efficient technology stack, chosen to accelerate MVP development while providing a solid foundation for future growth.

-   **Frontend:** [Astro](https://astro.build/) & [React](https://react.dev/)
-   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
-   **AI Integration:** [OpenRouter.ai](https://openrouter.ai/)
-   **Runtime:** Node.js 20

## Getting Started Locally

Follow these steps to set up and run the project on your local machine.

### Prerequisites

-   Node.js (version 20, as specified in `.nvmrc`)
-   `npm` (comes with Node.js)
-   If you use `nvm`, run `nvm use` in the project directory.

### 1. Clone the repository

```bash
git clone https://github.com/ziarnoryzu/10x-project.git
cd vibetravels
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and add your credentials for the following services:
-   `SUPABASE_URL` and `SUPABASE_ANON_KEY`: Found in your Supabase project's API settings.
-   `OPENROUTER_API_KEY`: Your API key for OpenRouter.ai.

### 4. Run the development server

```bash
npm run dev
```
The application will be available at `http://localhost:4321`.

## Available Scripts

The following scripts are available in `package.json`:

| Script    | Description                                       |
|-----------|---------------------------------------------------|
| `dev`     | Starts the Astro development server.              |
| `start`   | Starts the Astro server in production mode.       |
| `build`   | Builds the application for production.            |
| `preview` | Previews the production build locally.            |
| `astro`   | Provides access to the Astro CLI.                 |

## Project Scope

### Key Features (MVP)

-   **User Account System (F-01):** Secure user registration, login, profile management, and account deletion.
-   **Travel Note Management (F-02):** Users can create, view, edit, and delete their travel notes.
-   **AI-Powered Plan Generation (F-03):** The application generates structured travel itineraries based on user notes, preferences, and additional parameters (style, budget, transport).
-   **User Onboarding (F-04):** New users are provided with a sample note and a pre-generated plan to quickly understand the app's functionality.

### Out of Scope (Post-MVP)

The following features are not part of the initial MVP release:
-   Sharing trip plans between users.
-   Advanced multimedia support (e.g., photo analysis).
-   Detailed logistics planning (e.g., flight/hotel booking integrations).
-   Versioning of generated travel plans.
-   Manual editing of the generated itineraries.
-   Monetization features.

## Project Status

The project is currently in the **MVP development phase**. The core functionalities are being built and refined to validate the main product hypothesis.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

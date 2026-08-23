# HostWhere

HostWhere is an intelligent analysis engine that automatically inspects a GitHub repository or uploaded project archive and recommends the best hosting platforms (Vercel, Netlify, Render, Docker, etc.) for that specific codebase.

## Live Demo
Check out the live application here: [Insert Live URL]

## Features
- **Intelligent Framework Detection:** Automatically identifies React, Next.js, Vue, Svelte, Express, Django, and more.
- **Infrastructure Requirements Parsing:** Detects databases, cron jobs, workers, websockets, and Dockerfiles to recommend compatible hosting.
- **Detailed Compatibility Reports:** Provides tailored recommendations across serverless, PaaS, and VPS platforms.
- **Affiliate Program:** Built-in dashboard and custom referral links to earn commission on promoted projects.
- **Featured Projects Leaderboard:** Showcase your analyzed projects to thousands of developers.

## Supported Analysis Sources
1. **GitHub URLs:** Analyze public repositories directly.
2. **ZIP Uploads:** Upload your private codebase securely for instant analysis without granting repository permissions.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (SSR)
- **Payments:** Dodo Payments
- **Testing:** Vitest

## Architecture
HostWhere operates through several core modules:
- **Analysis Engine (`src/lib/analyzer`):** A suite of detectors (framework, runtime, dependencies, env) parses code using a multi-pass approach on AST-like files.
- **Rules Engine:** Maps detected `ProjectProfile` requirements to a scoring matrix for each supported hosting provider.
- **Affiliate Module (`src/lib/affiliate`):** Manages user referrals via cookies, calculates commissions upon successful payments, and tracks payout statuses.
- **Featured Leaderboard (`src/lib/featured`):** Handles Dodo payments, click-tracking, and priority ordering.

## Security
Security is a top priority, especially given that users can upload proprietary source code.

- **Supabase Auth & RLS:** Complete Row Level Security (RLS) enforcement ensures users can only read and write their own data.
- **Per-user Analysis Isolation:** Private ZIP analyses are strictly linked to the uploading user (`user_analyses` table). Anonymous/unauthenticated users and unauthorized users are forbidden from fetching private results.
- **Server-Side Authorization:** Privileged database operations (such as updating a Featured Project) use the `SUPABASE_SERVICE_ROLE_KEY` but strictly verify the authenticated `user.id` against the resource's `owner_id`.
- **Secure ZIP Extraction:** ZIP files are extracted completely in memory to avoid path traversal attacks. Uploads are securely handled via temporary signed URLs.
- **Rate Limiting:** Critical endpoints (like generating upload URLs) are rate-limited to prevent abuse.
- **Server-Only Secrets:** Keys like `SUPABASE_SERVICE_ROLE_KEY` are only ever accessed in a Node context and are never exposed to the client.

## Project Structure
```text
src/
├── app/                  # Next.js App Router (Pages & API)
├── components/           # React Components (Landing, Analyze, Affiliate)
├── lib/
│   ├── analyzer/         # Core detection and rules engines
│   ├── affiliate/        # DB functions and queries for affiliate system
│   ├── featured/         # Payments, checkouts, and leaderboard
│   └── supabase/         # Client & Server auth helpers
└── __tests__/            # Security and unit test suites
```

## Local Development
1. Clone the repository: `git clone https://github.com/your-username/HostWhere.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Environment Variables
Create a `.env.local` file and add the following variables. (Do not use actual secrets in the browser context!)

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DODO_PAYMENTS_API_KEY=your_dodo_key
```

## Database / Supabase Setup
Run the SQL migrations located in `supabase/migrations/` in order:
- `001_featured_projects.sql`
- `002_auth_and_profiles.sql`
- `003_fixed_plans.sql`
- `004_affiliate_program.sql`
- `005_project_details.sql`
- `006_rich_project_details_and_payouts.sql`
- `007_secure_user_analyses.sql`
- `008_featured_project_owner.sql`

## Deployment
HostWhere is optimized for Vercel. Connect your repository to Vercel and ensure all environment variables are properly set in the deployment dashboard.

## Limitations
- ZIP uploads are currently capped at 50MB.
- Only public GitHub repositories are supported via URL. Private repositories must use the ZIP upload feature.

## License
[MIT License]

# Welcome to your Lovable project

## 🚀 Quick Start

**New to the project?** Check out the [**BUILD_GUIDE.md**](./BUILD_GUIDE.md) for comprehensive build and development server setup instructions.

**TL;DR:**
```bash
npm install --legacy-peer-deps  # Install dependencies
npm run dev                     # Start dev server at http://localhost:8080
```

Or use the quick-start script:
```bash
./start-dev.sh     # Linux/Mac
start-dev.bat      # Windows
```

## Project info

**URL**: https://lovable.dev/projects/3175be27-a2e8-448e-9119-b56fba138059

## Branch Structure

This repository uses the following branch structure:

- **`main`** - Primary branch for production-ready code
- **`development`** - Active development branch for ongoing work
- **`experiment`** - Experimental features and proof-of-concepts

### Branch and PR Management

The repository has been restructured. For management instructions, see:
- [BRANCH_CLEANUP_GUIDE.md](./BRANCH_CLEANUP_GUIDE.md) - Branch cleanup and management
- [PR_MANAGEMENT_GUIDE.md](./PR_MANAGEMENT_GUIDE.md) - Pull request management and details

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3175be27-a2e8-448e-9119-b56fba138059) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm install --legacy-peer-deps

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Note**: Use `--legacy-peer-deps` flag due to React 19 compatibility with some dependencies. See [BUILD_GUIDE.md](./BUILD_GUIDE.md) for details.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Developer Tools

### Pull Request Management

View and manage pull requests easily:

```bash
# View all open PRs
./pr-details.sh

# View closed PRs
./pr-details.sh summary closed

# View details for a specific PR
./pr-details.sh details <PR_NUMBER>

# View all PRs (open, closed, merged)
./pr-details.sh all

# Get help
./pr-details.sh help
```

For complete documentation, see [PR_MANAGEMENT_GUIDE.md](./PR_MANAGEMENT_GUIDE.md).

## Design System Documentation

View the comprehensive Tailwind CSS configuration for Carbon Construct:

- **[TAILWIND_VIEWING_GUIDE.md](./TAILWIND_VIEWING_GUIDE.md)** - Guide to viewing and exploring the design system
- **[TAILWIND_CONFIGURATION.md](./TAILWIND_CONFIGURATION.md)** - Complete documentation of colors, gradients, animations, and design tokens
- **[TAILWIND_EXAMPLES.md](./TAILWIND_EXAMPLES.md)** - Practical code examples and visual patterns
- **[TAILWIND_QUICK_REFERENCE.md](./TAILWIND_QUICK_REFERENCE.md)** - Quick reference guide for developers
- **[tailwind-showcase.html](./tailwind-showcase.html)** - A visual showcase of the color palette

The design system features:
- Professional twilight theme optimized for data visualization
- Custom color palettes for emission scopes, LCA phases, and compliance frameworks
- Vibrant gradients and smooth animations
- Accessible, high-contrast color combinations
- Responsive utilities and modern shadows

## GitHub Copilot Instructions

This repository is fully configured for GitHub Copilot Coding Agent with comprehensive instructions for autonomous work.

### Instruction Files

**Main Instructions:**
- `.github/copilot-instructions.md` - Core repository guidance, tech stack, and coding standards

**Scoped Instructions (`.github/instructions/`):**
- `compliance.instructions.md` - EN 15978 standards, Australian regulations (Privacy Act, ACL, GST, NCC 2024), EU GDPR
- `components.instructions.md` - React component patterns, shadcn/ui usage, Tailwind semantic tokens
- `edge-functions.instructions.md` - Deno Edge Function patterns, CORS, authentication, rate limiting
- `hooks.instructions.md` - Custom React hooks, TanStack Query patterns, error handling
- `security.instructions.md` - Input validation, XSS prevention, authentication, secrets management
- `tests.instructions.md` - Testing patterns (Vitest, Playwright), AAA structure, mocking

**Custom Agents (`.github/agents/`):**
- `security_pilot` - Automated security monitoring and PR security reviews

**Custom Prompts:**
- `.copilot/prompts/` - Reusable prompts (code review, security review, testing, documentation)
- `.github/prompts/` - Detailed prompt templates for code quality tasks
- `.github/prompt-snippets/` - Snippet library (Australian compliance, Supabase patterns, testing)

### Agent Documentation

See `AGENTS.md` for complete documentation on:
- Pre-commit validation checklist
- Code style requirements
- Commit message conventions
- PR requirements
- Debugging tips

### Using Copilot Agent

1. **Assign Issues**: Create well-scoped issues with clear acceptance criteria
2. **Agent Works**: Copilot will create PRs following repository instructions
3. **Review PRs**: Review as you would any contributor's work
4. **Iterate**: Use `@copilot` mentions to request changes
5. **Merge**: Approve and merge when satisfied

All instruction files use YAML frontmatter with `applyTo` patterns to scope rules to specific file types and paths.

## What technologies are used for this project?

This project is built with:

- Vite 7.3.0
- TypeScript 5.8.3
- React 18.3.1
- React Router 7.11.0
- shadcn-ui
- Tailwind CSS v4
- Supabase (Backend & Auth)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3175be27-a2e8-448e-9119-b56fba138059) and click on Share -> Publish.

### Supabase Functions Deployment

Supabase Edge Functions are automatically deployed via GitHub Actions when changes are pushed to the `main` branch:

- **Automatic Deployment**: Functions deploy on push to `main` when files in `supabase/` are modified
- **Manual Deployment**: Trigger via GitHub Actions → Deploy Supabase Functions → Run workflow
- **Functions Location**: All Edge Functions are in `supabase/functions/`
- **Configuration**: Function settings are in `supabase/config.toml`

**Required GitHub Secrets:**
- `SUPABASE_ACCESS_TOKEN` - Your Supabase access token for CLI authentication

**View Deployment Status:**
Navigate to the Actions tab in GitHub to see deployment progress and logs.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

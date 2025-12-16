# Welcome to your Lovable project

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
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

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

- **[TAILWIND_CONFIGURATION.md](./TAILWIND_CONFIGURATION.md)** - Complete documentation of colors, gradients, animations, and design tokens
- **[TAILWIND_EXAMPLES.md](./TAILWIND_EXAMPLES.md)** - Practical code examples and visual patterns
- **[TAILWIND_QUICK_REFERENCE.md](./TAILWIND_QUICK_REFERENCE.md)** - Quick reference guide for developers

The design system features:
- Professional twilight theme optimized for data visualization
- Custom color palettes for emission scopes, LCA phases, and compliance frameworks
- Vibrant gradients and smooth animations
- Accessible, high-contrast color combinations
- Responsive utilities and modern shadows

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3175be27-a2e8-448e-9119-b56fba138059) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

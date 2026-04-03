# My Personal Portfolio

Personal portfolio web app for Terachad / Raymond Igabineza. Built with React, TypeScript, Vite, Firebase, Tailwind CSS, Framer Motion, and React Router.

## What It Includes

- Hero section with animated intro and CTA links
- About, Skills, Projects, Experience, Blog, and Contact sections
- Realtime Firebase content for public data
- Admin vault at `/vault` for managing messages, projects, blog posts, and CV settings
- Gemini-powered AI assistant
- Dark mode with persisted theme preference
- SEO metadata, Open Graph tags, and structured data in `index.html`
- Motion performance safeguards that respect `prefers-reduced-motion`

## Key Behavior

- Public content updates live from Firestore using `onSnapshot`
- Navbar scrollspy tracks the active section while scrolling
- Mobile navigation scrolls reliably to sections and closes after selection
- Decorative animations stay active only when visible and are disabled for reduced-motion users
- The app is a single-page portfolio with a dedicated admin route for content management

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Firebase Auth, Firestore, and optional Storage usage for admin content
- React Router DOM
- React Markdown + remark-gfm
- Google GenAI SDK for the AI assistant

## Project Structure

- `src/components/` - page sections, navbar, footer, assistant, and vault
- `src/firebase.ts` - Firebase client setup
- `src/hooks/` - shared hooks such as viewport and reduced-motion detection
- `src/utils/` - shared motion helpers
- `public/` - static assets and redirects
- `scripts/` - Firebase/admin maintenance scripts

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Create a `.env` file with your local configuration.

3. Start the dev server.

```bash
npm run dev
```

## Environment Variables

The app reads Firebase and third-party keys from environment variables.

Required Firebase values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` optional

Other values currently used by the app:

- `VITE_IMGBB_API_KEY`
- `IMGBB_API_KEY`
- `VITE_GEMINI_API_KEY`

## Available Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build for production
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build locally
- `npm run set-admin-claim` - assign admin claim for the vault workflow
- `npm run migrate-content-details` - migrate content details
- `npm run migrate-content-details:commit` - run the migration with commit mode

## Firebase Notes

- Public portfolio content is read from Firestore in realtime for live updates.
- The admin vault depends on Firebase Auth and custom claims for access control.
- Keep admin credential JSON files out of git.

## SEO Notes

- `index.html` now contains a stronger document title, meta description, Open Graph data, Twitter card metadata, and JSON-LD structured data.
- Sections use semantic structure and accessible heading relationships.

## Performance Notes

- Entrance and decorative animations are kept, but they pause when offscreen.
- Reduced-motion users get a calmer experience without losing core functionality.
- Heavy sections rely on reusable motion helpers to avoid unnecessary animation work.

## Deployment Notes

- The app is configured for Vite deployment.
- `public/_redirects` and `firebase.json` are present for hosting/redirect support.
- Build output is generated in `dist/`.

## Security Notes

- Do not commit `.env` files or Firebase admin key JSON files.
- Treat the vault route as protected admin functionality.

## Verification

Production build should succeed with:

```bash
npm run build
```

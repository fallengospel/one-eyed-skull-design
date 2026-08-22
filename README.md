# OneEyedSkullDesign

A personal, Pinterest-style gallery app for showcasing and managing album cover artwork. Built with React, Vite, and Tailwind CSS. Client-side only — all data persists in localStorage.

![Symbiote Palette](https://img.shields.io/badge/palette-symbiote-black) ![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

---

## Live Demos

| Environment | URL | Features |
|-------------|-----|----------|
| **Production** | [fallengospel.github.io/one-eyed-skull-design](https://fallengospel.github.io/one-eyed-skull-design/) | The Wall + The Forge |
| **Staging** | [fallengospel.github.io/one-eyed-skull-design/staging/](https://fallengospel.github.io/one-eyed-skull-design/staging/) | All features + Profiles |
| **Test** | [fallengospel.github.io/one-eyed-skull-design/test/](https://fallengospel.github.io/one-eyed-skull-design/test/) | All features + Profiles |

---

## Features

### The Wall (Gallery)
- Masonry / staggered grid layout (Pinterest-style)
- Responsive columns based on viewport width
- Album cover cards with hover overlay quick actions (view, edit, delete)
- Lightbox modal with full-size cover and metadata
- Filter/sort bar: newest, oldest, alphabetical
- Tag/genre filter chips
- Search by title or artist
- Empty state with on-brand illustration

### The Forge (Upload & Customize)
- Drag-and-drop image upload with file picker fallback
- Live preview with pan and zoom
- 6 filter presets: Raw, Skull Noir, Bloodmoon, X-Ray, Toxic Shock, Symbiote
- 4 frame styles: Bare, Hairline, Vinyl, Stamp
- Metadata fields: title, artist, year, tags, notes
- Edit or delete existing uploads

### Profile System (Staging & Test only)
- Default profile pre-configured
- Create custom profiles with name, handle, bio, avatar
- Switch between profiles
- Each profile has its own collection
- Delete custom profiles

---

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool with chunk splitting
- **Tailwind CSS 3** — Utility-first styling
- **React Router 6** — Client-side routing (HashRouter)
- **localStorage** — Data persistence (no backend)

---

## Project Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Router + layout shell
├── index.css                   # Tailwind + custom animations
├── components/
│   ├── Nav.jsx                 # Sticky nav with skull logo
│   ├── SkullLogo.jsx           # One-eyed skull SVG
│   ├── CoverCard.jsx           # Gallery card component
│   ├── Lightbox.jsx            # Full-screen modal
│   ├── EmptyState.jsx          # Empty state illustration
│   └── icons.jsx               # Hand-styled SVG icons
├── pages/
│   ├── Gallery.jsx             # The Wall
│   ├── Forge.jsx               # The Forge
│   └── Profile.jsx             # Profile system (staging/test)
├── hooks/
│   └── useGallery.js           # React hooks for data
└── lib/
    ├── storage.js              # localStorage CRUD service
    └── imageProcessing.js      # Canvas baking, presets, frames
```

---

## Branch Strategy

### `main` — Production
- Stable, tested features only
- The Wall + The Forge (no profiles)
- Deployed to `gh-pages` branch
- **Deploy command:** `npm run deploy`

### `staging` — Staging
- All features including profiles
- Pre-release testing
- Deployed to `gh-pages-staging` branch
- **Deploy command:** `npx gh-pages -d dist -b gh-pages-staging`

### `test` — Testing
- Mirror of staging for QA
- Deployed to `gh-pages-test` branch
- **Deploy command:** `npx gh-pages -d dist -b gh-pages-test`

### Workflow
```
test → staging → main
 ↑        ↑        ↑
QA    Pre-release  Live
```

1. Develop on `test`
2. When stable, merge to `staging`
3. When ready for production, merge to `main`

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment

### Prerequisites
- Node.js 18+
- npm
- GitHub Personal Access Token (for push)

### Deploy Commands

```bash
# Production (main branch)
git checkout main
npm run build
npx gh-pages -d dist -b gh-pages

# Staging
git checkout staging
npm run build
npx gh-pages -d dist -b gh-pages-staging

# Test
git checkout test
npm run build
npx gh-pages -d dist -b gh-pages-test
```

### Switch Live Site
Go to **GitHub repo → Settings → Pages → Source** and select:
- `gh-pages` for production
- `gh-pages-staging` for staging
- `gh-pages-test` for test

---

## Data Model

### Album Cover
```javascript
{
  id: string,          // UUID
  imageUrl: string,    // Base64 data URL
  title: string,       // Album title
  artist: string,      // Artist name
  year: number,        // Release year (optional)
  tags: string[],      // Genre tags
  notes: string,       // Description
  filterApplied: string, // Preset ID
  frameStyle: string,  // Frame ID
  createdAt: number    // Timestamp
}
```

### Profile (Staging & Test)
```javascript
{
  id: string,          // UUID or 'default'
  name: string,        // Display name
  handle: string,      // @handle
  bio: string,         // Bio text
  avatar: string,      // Base64 data URL
  isDefault: boolean,  // Default profile flag
  createdAt: number    // Timestamp
}
```

---

## Console Logging

All critical operations log to console for debugging:

- `[Storage]` — CRUD operations, errors
- `[Image]` — Bake operations, file read errors
- `[useGallery]` — Hook load/refresh/remove errors

Open DevTools → Console to monitor app activity.

---

## License

Personal project — not for commercial use.

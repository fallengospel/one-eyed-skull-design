# OneEyedSkullDesign

A personal, Pinterest-style gallery app for showcasing and managing album cover artwork. Built with React, Vite, and Tailwind CSS. Client-side only — all data persists in localStorage.

![Symbiote](https://img.shields.io/badge/palette-symbiote-black) ![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

---

## Branches

| Branch | Purpose | Features |
|--------|---------|----------|
| `main` | **Production** | The Wall + The Forge |
| `staging` | **Staging** | All features + Profiles |
| `test` | **Testing** | All features + Profiles |

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

## Features

### The Wall (Gallery)
- Masonry / staggered grid layout (Pinterest-style)
- Responsive columns based on viewport width
- Album cover cards with hover overlay quick actions
- Lightbox modal with full-size cover and metadata
- Filter/sort bar: newest, oldest, alphabetical
- Tag/genre filter chips
- Search by title or artist

### The Forge (Upload & Customize)
- Drag-and-drop image upload with file picker fallback
- Live preview with pan and zoom
- 6 filter presets: Raw, Skull Noir, Bloodmoon, X-Ray, Toxic Shock, Symbiote
- 4 frame styles: Bare, Hairline, Vinyl, Stamp
- Metadata fields: title, artist, year, tags, notes

### Profiles (Staging & Test only)
- Default profile pre-configured
- Create custom profiles with name, handle, bio, avatar
- Switch between profiles
- Each profile has its own collection

---

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool with chunk splitting
- **Tailwind CSS 3** — Utility-first styling
- **React Router 6** — Client-side routing (HashRouter)
- **localStorage** — Data persistence

---

## Project Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Router + layout
├── index.css                   # Tailwind + animations
├── components/
│   ├── Nav.jsx                 # Navigation bar
│   ├── SkullLogo.jsx           # Logo SVG
│   ├── CoverCard.jsx           # Gallery card
│   ├── Lightbox.jsx            # Full-screen modal
│   ├── EmptyState.jsx          # Empty state
│   └── icons.jsx               # SVG icons
├── pages/
│   ├── Gallery.jsx             # The Wall
│   ├── Forge.jsx               # The Forge
│   └── Profile.jsx             # Profiles (staging/test)
├── hooks/
│   └── useGallery.js           # Data hooks
└── lib/
    ├── storage.js              # localStorage CRUD
    └── imageProcessing.js      # Canvas + presets
```

---

## Local Development

```bash
npm install
npm run dev
```

---

## Deployment

```bash
# Build
npm run build

# Deploy to GitHub Pages
npx gh-pages -d dist
```

Switch live site in **GitHub → Settings → Pages → Source**.

---

## Data Model

```javascript
// Album Cover
{
  id: string,
  imageUrl: string,      // Base64 data URL
  title: string,
  artist: string,
  year: number,
  tags: string[],
  notes: string,
  filterApplied: string,
  frameStyle: string,
  createdAt: number
}

// Profile (staging/test only)
{
  id: string,
  name: string,
  handle: string,
  bio: string,
  avatar: string,
  isDefault: boolean,
  createdAt: number
}
```

---

## Console Logging

Open DevTools → Console to monitor:
- `[Storage]` — CRUD operations
- `[Image]` — Bake operations
- `[useGallery]` — Hook errors

---

## License

Personal project.

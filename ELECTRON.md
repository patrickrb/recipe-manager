# Recipe Manager - Desktop Application

This guide covers how to run Recipe Manager as a native macOS desktop application using Electron.

## Prerequisites

- Node.js 18+
- macOS (for building macOS apps)

## Database Configuration

The desktop app uses SQLite instead of PostgreSQL for local data storage. The database is configured in `.env.electron`:

```env
DATABASE_URL="file:./recipe-manager.db"
```

The database file will be created in the `prisma` directory.

## Development

To run the app in development mode:

```bash
npm run electron:dev
```

This will:
1. Generate Prisma client for SQLite
2. Create/update the SQLite database schema
3. Start the Next.js dev server
4. Launch the Electron app

The app will open in a native window with developer tools enabled.

## Building for Production

### Build macOS App

To build a distributable macOS application:

```bash
npm run electron:build:mac
```

This will:
1. Generate Prisma client
2. Set up the database schema
3. Build Next.js in static export mode
4. Package everything into a native macOS app (.dmg)

The built app will be in the `dist` folder.

### Universal Build (Intel + Apple Silicon)

The build configuration creates a universal binary that works on both Intel and Apple Silicon Macs.

## Architecture

### Files Structure

```
recipe-manager/
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Preload script for security
├── out/                 # Next.js static export (generated)
├── dist/                # Built Electron apps (generated)
├── prisma/
│   ├── schema.prisma    # Database schema (SQLite)
│   └── recipe-manager.db # SQLite database (generated)
└── .env.electron        # Electron environment variables
```

### Key Differences from Web Version

1. **Database**: Uses SQLite instead of PostgreSQL
2. **Build**: Static export instead of SSR
3. **Images**: Unoptimized (no Next.js Image Optimization API)
4. **Window**: Native macOS window with custom title bar

## Configuration

### Electron Builder Settings

The app configuration in `package.json` includes:

- **App ID**: `com.recipe-manager.app`
- **Category**: Lifestyle
- **Targets**: DMG installer for both x64 and arm64

### Window Configuration

The Electron window is configured with:
- Width: 1200px
- Height: 800px
- Hidden inset title bar (macOS native style)
- Developer tools in development mode

## Customization

### App Icon

To add a custom app icon:

1. Create an `assets` folder in the project root
2. Add your icon as `icon.icns` (macOS icon format)
3. The build process will use this icon

### App Name

Edit `package.json`:

```json
{
  "name": "recipe-manager",
  "build": {
    "productName": "Recipe Manager"
  }
}
```

## Troubleshooting

### Database Issues

If you encounter database errors:

```bash
# Reset the database
rm prisma/recipe-manager.db
npm run db:push
```

### Build Issues

Clear the build cache:

```bash
rm -rf out dist .next
npm run electron:build:mac
```

### Port Already in Use

If port 3000 is in use during development:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

## Future Mobile Support

This Electron setup is the first step toward cross-platform support. For mobile apps:

- **iOS**: React Native or Capacitor
- **Android**: React Native or Capacitor

The shared React components and API logic can be reused across platforms.

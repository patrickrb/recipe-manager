# Recipe Manager

A beautiful cross-platform recipe management application built with Next.js, React, PostgreSQL, and modern UI libraries.

## Features

- ✨ **Beautiful UI**: Built with Chakra UI, Tailwind CSS, and shadcn/ui for a modern, responsive design
- 🍳 **Complete Recipe Management**: Create, read, update, and delete recipes
- 📝 **Rich Recipe Data**: Description, ingredients, instructions, categories, and notes
- 🌐 **Cross-Platform Ready**: Web application ready to be extended to Windows, macOS, and Android
- 🐳 **Docker Support**: Local development with Docker Compose
- ☁️ **Azure PostgreSQL Ready**: Configured for both local and Azure database connections

## Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Frontend**: React, TypeScript
- **UI Libraries**: Chakra UI, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL (Azure + local Docker)
- **ORM**: Prisma
- **Container**: Docker Compose

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (for local development)
- PostgreSQL (Azure or other hosted instance for production)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/patrickrb/recipe-manager.git
cd recipe-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# For local development with Docker
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/recipe_manager?schema=public"

# For production (Azure PostgreSQL)
# DATABASE_URL="postgresql://username:password@your-server.postgres.database.azure.com:5432/recipe_manager?schema=public&sslmode=require"

NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Start local database

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses a PostgreSQL database with the following schema:

### Recipe Model
- `id`: Unique identifier
- `title`: Recipe name (required)
- `description`: Brief description
- `ingredients`: Array of ingredient strings
- `instructions`: Array of instruction steps
- `categories`: Array of category tags
- `notes`: Additional notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## API Routes

- `GET /api/recipes` - List all recipes
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/[id]` - Get a specific recipe
- `PUT /api/recipes/[id]` - Update a recipe
- `DELETE /api/recipes/[id]` - Delete a recipe

## Project Structure

```
recipe-manager/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── recipes/      # API routes
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── page.tsx          # Main recipe list page
│   │   └── providers.tsx     # Chakra UI provider
│   ├── components/
│   │   ├── RecipeCard.tsx    # Recipe card component
│   │   └── RecipeForm.tsx    # Recipe form modal
│   ├── lib/
│   │   └── prisma.ts         # Prisma client instance
│   └── types/
│       └── recipe.ts         # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── docker-compose.yml        # Local PostgreSQL setup
└── package.json
```

## Deployment

### Azure PostgreSQL Setup

1. Create a PostgreSQL database in Azure
2. Update `.env.local` (or production environment variables) with your Azure connection string
3. Run migrations: `npx prisma migrate deploy`

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio to view/edit data
- `npx prisma migrate dev` - Create a new migration

### Adding Features

The application is designed to be extensible:
- Add new recipe fields in `prisma/schema.prisma`
- Create new API routes in `src/app/api/`
- Add new components in `src/components/`

## Future Enhancements

- 🔍 Search and filter recipes
- 📷 Image upload for recipes
- 👥 User authentication and personal recipe collections
- 📱 Native mobile apps (iOS/Android)
- 🖥️ Desktop apps (Windows/macOS)
- 📤 Recipe sharing and import/export
- 🔖 Recipe ratings and favorites

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

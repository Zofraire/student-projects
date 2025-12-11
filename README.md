# Student Projects Showcase

A web platform for showcasing student projects with support for multiple media types including images, PDFs, 3D models, and videos.

## Features

- **Project Display**: Browse and view student projects with rich media support
- **Category System**: Hierarchical parent-child categories for organization
- **Tags**: Flexible tagging system with custom colors
- **Media Viewers**:
  - Image gallery with lightbox
  - PDF viewer with zoom controls
  - 3D model viewer (Three.js) with orbit controls
  - Video player (YouTube, Vimeo, local videos)
- **Admin Panel**: Full CRUD operations for projects, categories, and tags
- **Authentication**: NextAuth.js with credentials and Google OAuth

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **3D Rendering**: Three.js (@react-three/fiber)
- **Video**: react-player

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd student-projects
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database URL and other settings.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed the database:
```bash
npx prisma db seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── auth/            # Authentication pages
│   │   ├── projects/        # Project pages
│   │   └── page.tsx         # Home page
│   └── api/
│       └── admin/           # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── viewers/             # Media viewer components
│   └── ...                  # Other components
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utility functions
└── i18n/                    # Internationalization
```

## Media Types

The platform supports four types of media for each project:

### Images (IMAGE)
- Formats: JPG, JPEG, PNG, GIF, WebP
- Displayed in a responsive gallery with lightbox

### PDF Documents (PDF)
- Embedded PDF viewer with zoom controls
- Download option available

### 3D Models (MODEL_3D)
- Formats: GLB, GLTF, FBX, OBJ
- Interactive viewer with orbit controls
- Auto-rotate feature

### Videos (VIDEO)
- Supports YouTube, Vimeo, and direct video URLs
- Embedded player with controls

## Admin Panel

Access the admin panel at `/admin` (requires ADMIN role).

### Managing Projects
- Create, edit, and delete projects
- Assign categories and tags
- Upload thumbnail images
- Mark projects as featured

### Managing Categories
- Create hierarchical categories (parent-child)
- Assign custom order

### Managing Tags
- Create tags with custom colors
- Tags appear as colored badges on projects

## Database Schema

The main models are:
- **User**: User accounts with roles (USER, ADMIN)
- **Project**: Main project entity
- **Category**: Hierarchical categories
- **Tag**: Project tags with colors
- **ProjectMedia**: Media attachments for projects

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## License

MIT License

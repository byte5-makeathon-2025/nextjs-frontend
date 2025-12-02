# Wish Manager - Makeathon Boilerplate

A modern, clean Next.js application for managing wishes with a Kanban board interface.
Test TEst

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   └── page.tsx        # Kanban board view
│   ├── login/              # Login page
│   └── page.tsx            # Public wish submission page
├── components/             # Reusable components
│   ├── WishCard.tsx        # Individual wish card
│   └── WishDetailsModal.tsx# Modal for viewing/editing wishes
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication context
├── lib/                    # Utilities and services
│   └── api.ts              # API client
└── types/                  # TypeScript types
    └── index.ts            # Type definitions
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## API Configuration

The app connects to the backend API at:
```
https://byte5-makeathon-backend-main-9dpixy.laravel.cloud/api
```

To change the API URL, edit `src/lib/api.ts`:

```typescript
const API_BASE_URL = 'your-api-url-here';
```

## User Flows

### Public Users
1. Visit the home page
2. Fill out the wish form (title, description, priority)
3. Submit the wish
4. Receive confirmation

### Staff Members
1. Click "Staff Login" in the top right
2. Enter email and password
3. View all wishes on the Kanban board
4. Click any wish to view details
5. Edit wish details or change status
6. Delete wishes if needed

## Authentication

The app uses token-based authentication with Laravel:
- Tokens are stored in `localStorage`
- The `AuthContext` manages authentication state
- Protected routes redirect to login if not authenticated

## License

MIT

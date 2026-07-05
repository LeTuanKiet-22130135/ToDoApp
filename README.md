# TaskFlow Web

TaskFlow Web is a modern, full-stack Next.js application designed to help users manage their daily tasks efficiently. It features a clean, responsive interface and robust backend capabilities.

## Tech Stack

- Frontend Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Database ORM: Prisma
- Database: PostgreSQL
- Caching/OTP State: Redis
- Offline Storage: Dexie (IndexedDB)
- Authentication: JWT (`jose`) with HTTP-Only Cookies

## Core Features

- **Real-time Search:** Filter tasks instantly by title via the search bar.
- **Dynamic Sorting & Filtering:** Sort tasks by Priority or Date. Filter by Due Date, Priority (High/Med/Low), and custom Tags instantly on the client side.
- **Offline First:** Fully functional without an internet connection using IndexedDB (Dexie).

## Data Syncing & Authentication

- **Guest Mode:** Unauthenticated users can use the app seamlessly. Tasks are stored locally in their browser using Dexie (IndexedDB).
- **Authentication:** Users can sign up via OTP (managed by Redis + Resend) and receive a secure JWT HTTP-Only session cookie.
- **Offline to Cloud Sync:** Upon signing up or logging in, any locally created Dexie tasks are automatically bulk-synced to their remote PostgreSQL account.
- **Data Security:** The application includes a fully functional logout mechanism. When authenticated, clicking the profile avatar in the header opens a dropdown menu to sign out. Logging out securely destroys the HTTP-Only cookie and instantly wipes all displayed user data from the client state.

## Database Schema

This project relies on Prisma and PostgreSQL for the cloud database.

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   @default("todo")
  priority    String   @default("medium")
  dueDate     DateTime?
  tags        String[]
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Folder Structure

- `prisma/`: Contains the Prisma schema and database configuration.
- `src/`: Main source code directory.
  - `app/`: Next.js App Router pages and layouts.
    - `add-task/`: Page for creating a new task.
    - `auth/`: Authentication pages (Login, Signup, Reset Password).
    - `globals.css`: Global styles and Tailwind configuration.
    - `layout.tsx`: Root layout configuration.
    - `page.tsx`: Main dashboard and task list page.
  - `components/`: Reusable React components (e.g., Modal, Offcanvas).
  - `lib/`: Shared utilities and library configurations.
    - `actions.ts`: Next.js Server Actions serving as the backend API.
    - `prisma.ts`: Prisma client instantiation.
    - `resend.ts`: Utility for sending OTP emails via the Resend API.

## API Information

This project uses Next.js Server Actions instead of traditional REST API routes. These actions are located in `src/lib/actions.ts` and handle database operations securely on the server.

- `createUser(name, email, passwordHash)`: Creates a new user in the database.
- `getTasks(userId)`: Retrieves a list of tasks for a specific user, ordered by creation date.
- `createTask(data)`: Creates a new task associated with a specific user.
- `updateTaskStatus(taskId, status)`: Updates the completion status of a specific task.
- `deleteTask(taskId)`: Deletes a specific task from the database.

All actions include built-in data validation to ensure data integrity before interacting with the database.

## How to Run Locally

1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

2. Configure Environment Variables
Create a `.env` file in the root of your project and add your PostgreSQL connection string along with your Resend API credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskflow?schema=public"

# Resend Mail Configuration for OTPs
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Redis caching for OTP state
REDIS_URL="redis://default:password@localhost:6379"
```

3. Initialize the Database
Run the following commands to push the Prisma schema to your database and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

4. Start the Development Server
Run the Next.js development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser to view the application.

## How to Deploy to Vercel

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log in to Vercel and click "Add New Project".
3. Import your repository from your Git provider.
4. In the "Environment Variables" section, add your `DATABASE_URL` pointing to your production PostgreSQL database. Also, add your `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `REDIS_URL` (from Vercel KV, Upstash, or similar) to enable OTP emails.
5. Vercel will automatically detect that this is a Next.js project. The `package.json` includes a `postinstall` script that will automatically run `prisma generate` during the build process.
6. **Important:** In the "Build & Development Settings", override the "Build Command" to be `npx prisma db push && next build`. This ensures your database schema is pushed before the Next.js build.
7. Click "Deploy". Vercel will build and host your application automatically.

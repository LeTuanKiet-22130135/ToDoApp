# TaskFlow Web

TaskFlow Web is a modern, full-stack Next.js application designed to help users manage their daily tasks efficiently. It features a clean, responsive interface and robust backend capabilities.

## Tech Stack

- Frontend Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Database ORM: Prisma
- Database: PostgreSQL

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
4. In the "Environment Variables" section, add your `DATABASE_URL` pointing to your production PostgreSQL database. Also, add your `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to enable OTP emails.
5. Vercel will automatically detect that this is a Next.js project. The `package.json` includes a `postinstall` script that will automatically run `prisma generate` during the build process.
6. Click "Deploy". Vercel will build and host your application automatically.

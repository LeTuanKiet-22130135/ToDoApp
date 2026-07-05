import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/session";
import { TaskProvider } from "@/components/TaskProvider";

export const metadata: Metadata = {
  title: "TaskFlow - Todo Application",
  description: "A modern todo application built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const isAuth = !!session;

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-800 bg-white">
        <TaskProvider initialIsAuth={isAuth}>
          {children}
        </TaskProvider>
      </body>
    </html>
  );
}

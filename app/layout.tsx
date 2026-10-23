import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { isLoggedIn } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "EmbedVault",
  description: "Personal embedded systems knowledge base",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedIn = await isLoggedIn();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar loggedIn={loggedIn} />
        <main className="min-w-0 flex-1">{children}</main>
      </body>
    </html>
  );
}

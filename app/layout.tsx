import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "../components/Header";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "BMTech - We Handle Your Digital. You Grow Your Business.",
  description: "Digital agency specializing in Graphics, Video, IT Services, and Social Media.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isMaintenance = headersList.get("x-maintenance-mode") === "true";

  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} antialiased`}>
      <body className="font-body bg-background text-foreground overflow-x-hidden">
        {!isMaintenance && <Header />}
        {children}
      </body>
    </html>
  );
}

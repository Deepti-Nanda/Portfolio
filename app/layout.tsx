import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ResumeProvider } from "@/components/resume-context";
import { Navbar } from "@/components/navbar";
import { FaviconAnimation } from "@/components/favicon-animation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deepti Nanda | Full-Stack Developer",
  description:
    "BCA undergraduate at Sarala Birla University (2024-2027). Aspiring Full-Stack Developer focused on modern web & AI applications.",
  openGraph: {
    title: "Deepti Nanda | Full-Stack Developer",
    description:
      "BCA undergraduate at Sarala Birla University. Building technology that solves real-world problems.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <FaviconAnimation />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <ResumeProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </ResumeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { Metadata } from "next";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "JavaScript Practice Game",
  description:
    "Test and improve your JavaScript knowledge with our AI-powered quiz",
  keywords: ["JavaScript", "Quiz", "Learning", "Programming", "Practice"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "JavaScript Practice Game",
    description:
      "Test and improve your JavaScript knowledge with our AI-powered quiz",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <ThemeToggle />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

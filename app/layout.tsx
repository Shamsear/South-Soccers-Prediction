import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Navigation } from "@/components/navigation";
import { LiveMatchBanner } from "@/components/live-match-banner";
import { FooterContent } from "@/components/footer-content";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "South Soccers Prediction League",
  description: "FIFA World Cup 2026 Prediction Competition",
  icons: {
    icon: "/sslogo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[#050509] text-white antialiased">
        {/* Header Stack - LiveMatchBanner + Navigation */}
        <div className="sticky top-0 z-50 flex flex-col w-full">
          <LiveMatchBanner />
          <Navigation />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full pb-24 md:pb-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-gradient-to-b from-[#0A0A0F] to-[#050508] py-16 mt-auto relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F3A81D] to-transparent" />
            <div className="absolute inset-0 bg-cyber-pitch opacity-20" />
          </div>

          <FooterContent />
        </footer>

        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

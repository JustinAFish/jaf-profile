import type { Metadata } from "next";
import { Geist_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import AmplifyProvider from "@/components/AmplifyProvider";
import { AppChrome } from "@/components/AppChrome";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Justin Fish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AmplifyProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <body
          className={`${spaceGrotesk.variable} ${manrope.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AppChrome />
            <div className="relative z-[2] min-h-screen">
              <Navbar />
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </AmplifyProvider>
  );
}

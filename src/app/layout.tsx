import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HostWhere — Know where your code can actually run",
    template: "%s | HostWhere",
  },
  description:
    "Upload your project ZIP and instantly discover which hosting platforms are compatible. HostWhere analyzes your stack, dependencies, and requirements to give you deployment compatibility results.",
  keywords: [
    "hosting",
    "deployment",
    "compatibility",
    "vercel",
    "netlify",
    "railway",
    "render",
    "fly.io",
    "cloudflare",
    "docker",
    "project analyzer",
    "developer tool",
  ],
  authors: [{ name: "HostWhere" }],
  openGraph: {
    title: "HostWhere — Know where your code can actually run",
    description:
      "Upload your project ZIP and instantly discover which hosting platforms are compatible.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HostWhere — Know where your code can actually run",
    description:
      "Upload your project ZIP and instantly discover which hosting platforms are compatible.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
export const metadata: Metadata = {
  title: "Marginalia — style-aware writing assistant",
  description: "Grammar, tone, and translation correction grounded in your own style rules via RAG."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        </body>
    </html>
  );
}
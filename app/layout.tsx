import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WHITE F.P.G. — Showroom",
  description:
    "WHITE F.P.G — showroom digitale di grafica: cover, poster, loghi e opere visive.",
  metadataBase: new URL("https://white-fpg.example"),
  openGraph: {
    title: "WHITE F.P.G. — Showroom",
    description:
      "Showroom digitale di grafica: cover, poster, loghi e opere visive.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="bg-void text-bone font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

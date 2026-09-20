import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bíblia On-line — Projeto L.M. Lemos",
  description: "Bíblia Almeida 1819, dicionário teológico, assuntos e estudos bíblicos.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}

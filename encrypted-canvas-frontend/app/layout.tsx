import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Encrypted Canvas - Premium Creative Platform",
  description: "The premier destination for creative minds seeking absolute privacy. Craft, exhibit, and monetize your digital masterpieces with quantum-grade encryption.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

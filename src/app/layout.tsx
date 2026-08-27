import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ES/HUB — Living Systems Map",
  description:
    "A semantic map of Edward Song's work, systems, projects, and notes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

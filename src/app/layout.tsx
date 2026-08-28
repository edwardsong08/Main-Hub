import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ES/HUB — Living Systems Map",
  description:
    "A semantic map of Edward Song's work, systems, projects, and notes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="signal-garden"
      data-status-visibility="show"
      suppressHydrationWarning
    >
      <body>
        <Script id="hub-theme-init" strategy="beforeInteractive">
          {`try {
            var hubTheme = localStorage.getItem("es-hub:theme:v1");
            if (["signal-garden", "birthday-sprinkles", "silver-noir", "matcha-cappuccino"].includes(hubTheme)) {
              document.documentElement.dataset.theme = hubTheme;
            }
            var hubStatusVisibility = localStorage.getItem("es-hub:status-visibility:v1");
            if (["show", "hide"].includes(hubStatusVisibility)) {
              document.documentElement.dataset.statusVisibility = hubStatusVisibility;
            }
          } catch (error) {}`}
        </Script>
        {children}
      </body>
    </html>
  );
}

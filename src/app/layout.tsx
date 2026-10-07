import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ScoopProvider } from "@/components/providers/ScoopProvider";
import { ExperienceProvider } from "@/components/providers/ExperienceProvider";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import Cursor from "@/components/layout/Cursor";
import Toast from "@/components/layout/Toast";

// Self-hosted fonts (no request to Google at runtime)
const bodoni = localFont({
  variable: "--font-bodoni",
  display: "swap",
  src: [
    { path: "./fonts/bodoni-moda-latin-standard-normal.woff2", style: "normal", weight: "400 900" },
    { path: "./fonts/bodoni-moda-latin-standard-italic.woff2", style: "italic", weight: "400 900" },
  ],
});

const manrope = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: "./fonts/manrope-latin-wght-normal.woff2",
  weight: "200 800",
});

export const metadata: Metadata = {
  title: {
    default: "ATAYA SIGNATURE — Every dress has a taste",
    template: "%s · ATAYA SIGNATURE",
  },
  description: "Ataya Signature makes playful, sophisticated dresses inspired by ice-cream flavours. Choose your flavour.",
};

export const viewport: Viewport = {
  themeColor: "#f7f1e6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodoni.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* pick the look (light or dark) before anything is drawn, so there is no flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("ataya-theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}` }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ExperienceProvider>
          <ScoopProvider>
            <Nav />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <Toast />
            <Cursor />
          </ScoopProvider>
        </ExperienceProvider>
      </body>
    </html>
  );
}

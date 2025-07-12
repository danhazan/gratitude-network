import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ChakraProviderWrapper } from "@/components/ChakraProviderWrapper"; // Import the wrapper
import { AuthProvider } from "../context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gratitude Network - Cultivate Positivity",
  description: "A social platform designed to foster positivity, mindfulness, and community connection through the simple act of sharing daily gratitudes.",
  keywords: ["gratitude", "mindfulness", "positivity", "community", "social network"],
  openGraph: {
    title: "Gratitude Network",
    description: "Share your gratitude, connect with a positive community.",
    url: "https://www.gratitudenetwork.com", // Replace with actual URL
    siteName: "Gratitude Network",
    images: [
      {
        url: "https://www.gratitudenetwork.com/og-image.jpg", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "Gratitude Network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gratitude Network",
    description: "Share your gratitude, connect with a positive community.",
    creator: "@GratitudeNet", // Replace with actual Twitter handle
    images: ["https://www.gratitudenetwork.com/twitter-image.jpg"], // Replace with actual Twitter image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ fontFamily: inter.style.fontFamily }}> {/* Explicitly use fontFamily from inter.style */}
        <ChakraProviderWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ChakraProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
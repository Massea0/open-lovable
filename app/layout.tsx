import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Arcadis Synapse™ - Intelligence Architecturale Augmentée",
  description: "IDE Intelligent avec Architecture Dual-Agent propulsé par Cortex et Neuron",
  keywords: "Arcadis, Synapse, IDE, AI, Development, Cortex, Neuron",
  authors: [{ name: "Arcadis Tech" }],
  icons: {
    icon: "/assets/synapse-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans bg-[#0A0E27] text-white`}>
        {children}
      </body>
    </html>
  );
}

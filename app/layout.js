import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI-Companion Bot",
  description: "Scrape-and-chat with your AI Companion",
  keywords: "AI chatbot, Retrieval-Augmented Generation, RAG, AI search, smart assistant, knowledge retrieval, AI-powered Q&A",
  author: "Deepanshu",
  robots: "index, follow",
  og: {
    title: "AI-Powered RAG Chatbot | Smart Knowledge Retrieval",
    description: "An advanced chatbot that retrieves and generates precise answers with source citations using RAG technology.",
    type: "website",
    url: "https://rag-chatbot-eta.vercel.app",
    image: "/og-image.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers> 
          {children}
        </Providers>
      </body>
    </html>
  );
}
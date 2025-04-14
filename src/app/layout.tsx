import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Floorplan for Renovation",
  description: "Interactive floorplan detailing electrical sockets, switches, IoT sensors and other elements",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script async defer data-website-id="55a0087a-46b1-49c8-81c5-576fe532fa6d" src="https://umami.gumblert.tech/umami.js"></script>
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

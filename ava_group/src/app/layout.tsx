// src/app/layout.tsx

import "../style/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import { getLocale, setRequestLocale } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AVA GROUP",
  description: "Yönetim sayfası",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        {" "}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

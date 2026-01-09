// src/app/[locale]/layout.tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import ContactPanel from "@/components/ContactPanel";
import Navbar from "@/components/Navbar";
import { routing } from "@/i18n/routing";
import getRequestConfig from "@/i18n/request";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const awaitedParams = await params;
  const locale = awaitedParams.locale;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const { messages } = await getRequestConfig({
    requestLocale: Promise.resolve(locale),
  });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <main>{children}</main>
      <ContactPanel />
    </NextIntlClientProvider>
  );
}

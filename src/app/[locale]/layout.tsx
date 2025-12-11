import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import SessionWrapper from "@/src/components/SessionWrapper";
import Navigation from "@/src/components/Navigation";
import { Footer } from "@/src/components/Footer";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale || "en";
  
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    messages = (await import(`../../../messages/en.json`)).default;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SessionWrapper>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
          <Navigation locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </SessionWrapper>
    </NextIntlClientProvider>
  );
}
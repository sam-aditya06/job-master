import "./globals.css";

import { Suspense } from "react";
import Script from 'next/script';

import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/sonner";

import Footer from "@/components/footer";
import Header from "@/components/header";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9977184400515586" />
        {
          process.env.NODE_ENV === 'production' && (
            <>
              <Script async src="https://www.googletagmanager.com/gtag/js?id=G-B4KT3L5PV3" />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-B4KT3L5PV3');
        `}
              </Script>
            </>
          )}
      </head>
      <body
        className='flex flex-col min-h-svh'
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense>
            <Header />
          </Suspense>
          <main className="flex-1 bg-neutral-100 dark:bg-black pt-14">
            {children}
          </main>
          <Footer />
          <Toaster position='top-center' />
        </ThemeProvider>
      </body>
    </html>
  );
}

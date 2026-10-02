import { Suspense } from "react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { MessageProvider } from "@/components/messageProvider";

import { getMessages } from "@/lib/utils";

export default async function langLayout({ children, params }) {
    const { lang } = await params;
    const messages = await getMessages(lang);

    return (
        <MessageProvider messages={messages} lang={lang}>
            <Suspense>
                <Header />
            </Suspense>
            <main className="flex-1 bg-neutral-100 dark:bg-black pt-14">
                {children}
            </main>
            <Footer />
        </MessageProvider>
    )
}
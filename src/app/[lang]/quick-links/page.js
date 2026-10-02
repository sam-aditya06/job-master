import { getQuickLinks } from "@/lib/serverUtils";
import QuickLinks from "./quickLinks";

export async function generateMetadata({ params }) {
    const { lang } = await params;

    const title = {
        en: `Quick Links | ${process.env.NEXT_PUBLIC_NAME}`
    }[lang];

    const description = {
        en: `Quick access to latest government recruitment updates. Find latest recruitments based on your qualification and recently released admit cards, results and scorecards.`
    }[lang];

    return {
        title,
        description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/${lang}/quick-links`
        },
        robots: { index: true, follow: true }
    }
}

export default async function QuickLinksPage({ params }) {

    const { lang } = await params;
    const quickLinks = await getQuickLinks({ lang });

    return (
        <QuickLinks quickLinks={quickLinks} />
    )
}
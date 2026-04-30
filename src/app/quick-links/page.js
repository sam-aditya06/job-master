import { getQuickLinks } from "@/lib/serverUtils";
import { Suspense } from "react";
import QuickLinksHeader from "./quickLinksHeader";
import QuickLinksList from "./quickLinksList";
import { QuickLinkListSkeleton } from "@/components/skeletons";

export async function generateMetadata({ searchParams }) {
    const { search } = await searchParams

    return {
        title: `Quick Links | ${process.env.NEXT_PUBLIC_NAME}`,
        description: `Quick access to popular government job and recruitment searches. Find banking jobs, fresher recruitments, PSU openings, and more in one place.`,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/quick-links`
        },
        robots: search
            ? { index: false, follow: true }
            : { index: true, follow: true }
    }
}

export default function QuickLinksPage({ searchParams }) {
    return (
        <div className="flex flex-col gap-10 p-5">
            <Suspense fallback={null}>
                <MainContent searchParams={searchParams} />
            </Suspense>
        </div>
    )
}

async function MainContent({ searchParams }) {
    const { search } = await searchParams;
    return (
        <>
            <QuickLinksHeader />
            <div className="border w-full"></div>
            <Suspense key={search} fallback={<QuickLinkListSkeleton />}>
                <Content searchParams={searchParams} />
            </Suspense>
        </>
    )
}

async function Content({ searchParams }) {
    const { search } = await searchParams;
    const quickLinks = await getQuickLinks(search);

    await new Promise(resolve => setTimeout(resolve, 2000));

    return (
        <QuickLinksList quickLinks={quickLinks} />
    )
}
import { getQuickLinks } from "@/lib/serverUtils";
import { Suspense } from "react";
import QuickLinksHeader from "./quickLinksHeader";
import QuickLinksList from "./quickLinksList";
import { QuickLinkListSkeleton, QuickLinkMainContentSkeletion } from "@/components/skeletons";
import { FilterProvider } from "@/lib/context/filterContext";

export async function generateMetadata({ searchParams }) {
    const { search } = await searchParams;

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

export default async function QuickLinksPage({ searchParams }) {
    const sp = await searchParams;
    return (
        <FilterProvider initialParams={sp}>
            <Suspense fallback={<QuickLinkMainContentSkeletion />}>
                <MainContent search={sp.search} />
            </Suspense>
        </FilterProvider>
    )
}

async function MainContent({ search }) {

    return (
        <div className="flex flex-col gap-5">
            <QuickLinksHeader />
            <div className="border w-full"></div>
            <Suspense key={search} fallback={<QuickLinkListSkeleton />}>
                <Content search={search} />
            </Suspense>
        </div>
    )
}

async function Content({ search }) {
    const quickLinks = await getQuickLinks(search);

    return (
        <QuickLinksList quickLinks={quickLinks} />
    )
}
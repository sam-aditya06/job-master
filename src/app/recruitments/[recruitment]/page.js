import { Suspense } from "react";
import { notFound } from "next/navigation";

import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getRecruiterFromId, getRecruitmentDetails, getRecruitmentSidebarDetails } from "@/lib/serverUtils";
import Recruitment from "./recruitment";
import { ContentSkeleton, SidebarSkeleton } from "@/components/skeletons";
import { ContentLoadingProvider } from "@/lib/context/paginateContext";

export const generateMetadata = async ({ params, searchParams }) => {
    const { recruitment } = await params
    const { stage: stageSlug, year } = await searchParams;

    const recruitmentDetails = await getRecruitmentDetails('md', recruitment)
    if (!recruitmentDetails)
        return {};

    const recruiter = await getRecruiterFromId(recruitmentDetails.recruiterId)

    // ?year=X — past cycle
    if (year) {
        return {
            title: `${recruitmentDetails.name} ${year} — Overview | ${recruiter.name}`,
            description: `Complete overview of ${recruitmentDetails.name} ${year} recruitment cycle. Check stage-wise cut-offs, and important dates.`,
            alternates: {
                canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/recruitments/${recruitment}?year=${year}`
            },
            robots: { index: true, follow: true }
        }
    }

    // ?stage=X — current cycle stage
    if (stageSlug) {
        const stage = recruitmentDetails.stages.find(s => s.slug === stageSlug)
        if (!stage) return {}

        return {
            title: `${recruitmentDetails.name} ${recruitmentDetails.year} ${stage.name} | ${recruiter.abbr || recruiter.name}`,
            description: `${recruitmentDetails.name} ${recruitmentDetails.year} ${stage.name}. ${stage.status === "pending"
                ? "Check expected release date and steps."
                : "Check direct link, steps, and important details."}`,
            alternates: {
                canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/recruitments/${recruitment}?stage=${stageSlug}`
            },
            robots: { index: true, follow: true }
        }
    }

    // no params — current cycle overview
    const description = recruitmentDetails.status === "pending"
        ? `${recruitmentDetails.name} ${recruitmentDetails.year} notification has not been released yet. Check back for updates on eligibility, stages, and important dates.`
        : `${recruitmentDetails.name} ${recruitmentDetails.year} recruitment is ${recruitmentDetails.status}. Check important dates, stages, and latest updates.`

    return {
        title: `${recruitmentDetails.name} Recruitment ${recruitmentDetails.year} | ${recruiter.name}`,
        description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/recruitments/${recruitment}`
        },
        robots: { index: true, follow: true }
    }
}

export default function RecruitmentPage({ params, searchParams }) {
    return (
        <ContentLoadingProvider>
            <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
                <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                    <div className="p-2 h-full">
                        <Suspense fallback={<SidebarSkeleton />}>
                            <Sidebar screen='desktop' params={params} />
                        </Suspense>
                    </div>
                </aside>
                <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900 overflow-hidden">
                    <div className="p-3 min-h-full h-full overflow-hidden">
                        <div className="p-2 h-full overflow-y-auto">
                            <div className="xl:hidden">
                                <Suspense fallback={null}>
                                    <Sidebar screen='mobile' params={params} />
                                </Suspense>
                            </div>
                            <Suspense fallback={<ContentSkeleton />}>
                                <MainContentWrapper params={params} searchParams={searchParams} />
                            </Suspense>
                        </div>
                    </div>
                </section>
                <aside className="hidden sm:flex-[25] xl:flex-[2] sm:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                    <div className="flex flex-col p-2 h-full">
                        <div className="grow"></div>
                        <p className="justify-end text-center">Advertisement</p>
                    </div>
                </aside>
            </div>
        </ContentLoadingProvider>
    )
}

async function Sidebar({ params, screen }) {
    const { recruitment } = await params;
    const sidebarDetails = await getRecruitmentSidebarDetails(recruitment);
    if (sidebarDetails)
        return (
            <Suspense fallback={<SidebarSkeleton />}>
                {screen === 'desktop' ? <DesktopSidebar details={sidebarDetails} /> : <MobileSidebar details={sidebarDetails} />}
            </Suspense>
        )
    else
        notFound();

}

async function MainContentWrapper({ params, searchParams }) {
    const { recruitment } = await params;
    const sp = await searchParams;
    const { fy, stage } = sp;
    const year = fy && parseInt(fy.substring(0, 4));
    const key = JSON.stringify(sp);
    const recruitmentDetails = await getRecruitmentDetails("content", recruitment, year, stage);
    if (recruitmentDetails)
        return (
            <>
                <Suspense key={key} fallback={<ContentSkeleton />}>
                    <MainContent recruitmentDetails={recruitmentDetails} />
                </Suspense>
            </>
        )
    else
        notFound();
}

async function MainContent({ recruitmentDetails }) {

    const recruiterDetails = await getRecruiterFromId(recruitmentDetails.recruiterId)
    const recruiterName = recruiterDetails.name;
    const location = () => {
        if (recruitmentDetails.location.isAllIndia) return { "@type": "Country", "name": "India" }
        if (recruitmentDetails.location.state) return { "@type": "AdministrativeArea", "name": recruitmentDetails.location.state }
        return null
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": `${recruitmentDetails.name} ${recruitmentDetails.year}`,
        "description": recruitmentDetails.description,
        "organizer": {
            "@type": "Organization",
            "name": recruiterName
        },
        "eventStatus": recruitmentDetails.status === "ongoing"
            ? "https://schema.org/EventScheduled"
            : recruitmentDetails.status === "completed"
                ? "https://schema.org/EventCompleted"
                : "https://schema.org/EventPostponed",
        ...(recruitmentDetails.notificationDate && {
            "startDate": recruitmentDetails.notificationDate
        }),
        ...(location && {
            "location": location
        })
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Recruitment content={recruitmentDetails.content} />
        </>
    )
}
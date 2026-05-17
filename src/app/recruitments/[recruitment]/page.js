import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { XCircle } from "lucide-react";

import Recruitment from "./recruitment";

import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getRecruiterFromId, getRecruitmentDetails, getRecruitmentSidebarDetails } from "@/lib/serverUtils";
import { ContentSkeleton, SidebarSkeleton } from "@/components/skeletons";
import { ContentLoadingProvider } from "@/lib/context/paginateContext";
import ScrollProvider from "@/components/scrollProvider";

import { formatLocationJsonLd, validateFY } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const generateMetadata = async ({ params, searchParams }) => {
    const { recruitment } = await params
    const { stage: stageSlug, fy } = await searchParams;

    const isValidFY = fy && validateFY(fy);
    if (fy && !isValidFY)
        return {};

    const { status, recruitmentDetails } = await getRecruitmentDetails('md', recruitment)
    if (status === 'invalid recruitment')
        return {};

    const recruiter = await getRecruiterFromId(recruitmentDetails.recruiterId);



    // ?year=X — past cycle
    if (fy) {
        return {
            title: `${recruitmentDetails.name} ${fy.substring(0, 4)} — Overview | ${recruiter.abbr || recruiter.name}`,
            description: `Complete overview of ${recruitmentDetails.name} recruitment cycle for FY ${fy}. Check stage-wise cut-offs, and important dates.`,
            alternates: {
                canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/recruitments/${recruitment}?fy=${fy}`
            },
            robots: { index: true, follow: true }
        }
    }

    // ?stage=X — current cycle stage
    if (stageSlug) {
        const stage = recruitmentDetails.stages.find(s => s.slug === stageSlug)
        if (!stage)
            return {
                robots: { index: false, follow: true }
            }

        if (stage.status === 'not-reached')
            return {
                robots: { index: false, follow: true }
            }

        return {
            title: `${recruitmentDetails.name} ${recruitmentDetails.year} — ${stage.name} | ${recruiter.abbr || recruiter.name}`,
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
        title: `${recruitmentDetails.name} Recruitment ${recruitmentDetails.year} | ${recruiter.abbr || recruiter.name}`,
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
                        <ScrollProvider>
                            <div className="xl:hidden">
                                <Suspense fallback={null}>
                                    <Sidebar screen='mobile' params={params} />
                                </Suspense>
                            </div>
                            <Suspense fallback={<ContentSkeleton />}>
                                <MainContentWrapper params={params} searchParams={searchParams} />
                            </Suspense>
                        </ScrollProvider>
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

}

async function MainContentWrapper({ params, searchParams }) {
    const { recruitment } = await params;
    const sp = await searchParams;

    const { fy, stage } = sp;

    const isValidFY = fy && validateFY(fy);
    if (fy && !isValidFY)
        redirect(`/recruitments/${recruitment}`);

    const year = fy && parseInt(fy.substring(0, 4));
    const key = JSON.stringify(sp);
    const { status, recruitmentDetails } = await getRecruitmentDetails("content", recruitment, year, stage);
    switch (status) {
        case 'off year':
            return (
                <div className="flex flex-col items-center gap-5">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-12 h-12 stroke-white fill-red-700" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Data not found
                        </h1>
                    </div>
                    <p className="text-center text-muted-foreground text-sm">
                        Either no recruitment happened in FY {fy} or it has not been added yet.
                    </p>
                </div>
            )
        case 'found':
            return (
                <>
                    <Suspense key={key} fallback={<ContentSkeleton />}>
                        <MainContent recruitmentDetails={recruitmentDetails} />
                    </Suspense>
                </>
            )
        case 'invalid stage':
            return (
                <div className="flex flex-col items-center gap-5">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-12 h-12 stroke-white fill-red-700" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Invalid stage
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        The stage you're looking for doesn't exist.
                    </p>
                </div>
            )
        case 'not reached stage':
            const latestStageIndex = recruitmentDetails.stages.findIndex(stage => stage.status === 'not-reached') - 1;
            return (
                <div className="flex flex-col items-center gap-5">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-12 h-12 stroke-white fill-red-700" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Stage not reached
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        The recruitment hasn't reached this stage yet.
                    </p>
                    <div className="flex gap-3">
                        <Button className="bg-brand hover:bg-brand/90 text-white" asChild>
                            <Link href={`/recruitments/${recruitment}?stage=${recruitmentDetails.stages[latestStageIndex].slug}`}>View Latest Stage</Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={`/recruitments/${recruitment}`}>Go to Overview</Link>
                        </Button>
                    </div>
                </div>
            )
        default:
            notFound();
    }
}

async function MainContent({ recruitmentDetails }) {

    const recruiterDetails = await getRecruiterFromId(recruitmentDetails.recruiterId)
    const recruiterName = recruiterDetails.name;
    const location = formatLocationJsonLd(recruitmentDetails.location);

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
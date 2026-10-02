import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getLocationNameFromSlug, getNameFromSlug, getRecruitments, getRecruitmentsMetadata } from "@/lib/serverUtils";
import { SearchMainSectionSkeleton } from "@/components/skeletons";

import RecruitmentsHeader from "./recruitmentsHeader";
import RecruitmentsList from "./recruitmentsList";
import { getMessages } from "@/lib/utils";


export async function generateMetadata({ params, searchParams }) {
    const [
        { lang },
        { search, org, recruiter, status, cat, qualification, expLvl, location }
    ] = await Promise.all([
        params,
        searchParams
    ])

    const meta = await getRecruitmentsMetadata({ org, recruiter, status, cat, qualification, expLvl, location, lang });

    const isIndexed = !search;

    const buildCanonical = () => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/recruitments`);
        const indexableParams = { org, recruiter, status, cat, qualification, expLvl, location };
        Object.entries(indexableParams).forEach(([key, value]) => {
            if (value) url.searchParams.set(key, value)
        })
        return url.toString();
    }

    return {
        ...meta,
        alternates: {
            canonical: buildCanonical()
        },
        robots: { index: isIndexed, follow: true }
    }
}

export default async function RecruitmentsPage({ params, searchParams }) {
    const [{ lang }, sp] = await Promise.all([params, searchParams]);

    const { page } = sp;

    const pageNum = page ? parseInt(page) : 1;
    if (isNaN(pageNum) || pageNum < 1)
        redirect('/recruitments');

    return (
        <div className="sm:pr-3">
            <Suspense fallback={<SearchMainSectionSkeleton type={'recruitment'} />}>
                <MainContent lang={lang} sp={sp} />
            </Suspense>
        </div>
    )
}

async function MainContent({ lang, sp }) {
    const { search, org, recruiter, status, cat, location, qualification, expLvl, page } = sp;

    const [{ itemCount, recruitments }, orgName, recruiterName, locationName, qualificationName, messages] = await Promise.all([
        getRecruitments({ search, org, recruiter, status, cat, qualification, expLvl, location, lang, page }),
        org ? getNameFromSlug("orgs", org, lang) : undefined,
        recruiter ? getNameFromSlug("orgs", recruiter, lang) : undefined,
        location && location !== 'all-india' ? getLocationNameFromSlug(location, lang) : undefined,
        qualification && qualification !== 'graduate' ? getNameFromSlug('qualifications', qualification, lang) : undefined,
        getMessages(lang)
    ]);

    const displayedParams = {
        search: search ? { value: `${messages.jobs.search}: ${search}`, slug: search } : undefined,
        org: org ? { value: orgName, slug: org } : undefined,
        recruiter: recruiter ? { value: recruiterName, slug: org } : undefined,
        status: status ? { value: messages.jobs.filters.rStatuses[status], slug: status } : undefined,
        cat: cat ? { value: messages.jobs.filters.categories[cat], slug: cat } : undefined,
        location: location ? { value: locationName || messages.jobs.filters.locations[location], slug: location } : undefined,
        qualification: qualification ? { value: qualificationName || messages.jobs.filters.qualifications[qualification], slug: location } : undefined,
        expLvl: expLvl ? { value: messages.jobs.filters.expLvls[expLvl], slug: expLvl } : undefined,
    }

    return (
        <>
            <RecruitmentsHeader displayedParams={displayedParams} />
            <RecruitmentsList itemCount={itemCount} currentPage={page ? parseInt(page) : page} recruitments={recruitments} />
        </>
    )
}
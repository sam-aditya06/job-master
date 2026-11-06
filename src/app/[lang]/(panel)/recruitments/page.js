import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getLocationNameFromSlug, getNameFromSlug, getRecruitmentCount, getRecruitments, getRecruitmentsMetadata } from "@/lib/serverUtils";
import { SearchMainSectionSkeleton } from "@/components/skeletons";

import RecruitmentsHeader from "./recruitmentsHeader";
import RecruitmentsList from "./recruitmentsList";
import { getMessages } from "@/lib/utils";


export async function generateMetadata({ params, searchParams }) {
    const [
        { lang },
        { search, recruiter, status, cat, qualification, expLvl, location }
    ] = await Promise.all([
        params,
        searchParams
    ])

    const [meta, itemCount] = await Promise.all([
        getRecruitmentsMetadata({ recruiter, status, cat, qualification, expLvl, location, lang }),
        !search ? getRecruitmentCount({ recruiter, status, cat, qualification, expLvl, location, lang }) : 0
    ]);

    const buildCanonical = () => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/recruitments`);
        const indexableParams = { recruiter, status, cat, qualification, expLvl, location };
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
        robots: { index: !search && itemCount > 0, follow: true }
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
    const { search, recruiter, status, cat, location, qualification, expLvl, page } = sp;

    const [{ itemCount, recruitments }, recruiterName, locationName, qualificationName, messages] = await Promise.all([
        getRecruitments({ search, recruiter, status, cat, qualification, expLvl, location, lang, page }),
        recruiter ? getNameFromSlug("orgs", recruiter, lang) : undefined,
        location ? getLocationNameFromSlug(location, lang) : undefined,
        qualification ? getNameFromSlug('qualifications', qualification, lang) : undefined,
        getMessages(lang)
    ]);

    const displayedParams = {
        search: search ? { value: `${messages.jobs.search}: ${search}`, slug: search } : undefined,
        recruiter: recruiter ? { value: recruiterName, slug: recruiter } : undefined,
        status: status ? { value: messages.jobs.filters.rStatuses[status], slug: status } : undefined,
        cat: cat ? { value: messages.jobs.filters.categories[cat], slug: cat } : undefined,
        location: location ? { value: locationName || messages.jobs.filters.locations[location], slug: location } : undefined,
        qualification: qualification ? { value: qualificationName, slug: qualification } : undefined,
        expLvl: expLvl ? { value: messages.jobs.filters.expLvls[expLvl], slug: expLvl } : undefined,
    }

    return (
        <>
            <RecruitmentsHeader displayedParams={displayedParams} />
            <RecruitmentsList itemCount={itemCount} currentPage={page ? parseInt(page) : page} recruitments={recruitments} />
        </>
    )
}
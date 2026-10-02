import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SearchMainSectionSkeleton } from "@/components/skeletons";
import { getJobs, getJobsMetadata, getLocationNameFromSlug, getNameFromSlug } from "@/lib/serverUtils";
import JobsHeader from "./jobsHeader";
import JobsList from "./jobsList";
import { getMessages } from "@/lib/utils";

export async function generateMetadata({ params, searchParams }) {
    const [{ lang }, { search, org, rStatus, cat, qualification, expLvl, location }] = await Promise.all([
        params,
        searchParams
    ]);

    const [meta, { itemCount }] = await Promise.all([
        getJobsMetadata({ org, rStatus, cat, qualification, expLvl, location, lang }),
        getJobs({ org, rStatus, cat, qualification, expLvl, location, lang })
    ]);

    const buildCanonical = () => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/jobs`)
        const indexableParams = { org, rStatus, cat, qualification, expLvl, location }
        Object.entries(indexableParams).forEach(([key, value]) => {
            if (value) url.searchParams.set(key, value)
        })
        return url.toString()
    }

    return {
        ...meta,
        alternates: {
            canonical: buildCanonical()
        },
        robots: { index: !search && itemCount > 0, follow: true }
    }
}

export default async function JobsPage({ params, searchParams }) {

    const [{ lang }, sp] = await Promise.all([
        params,
        searchParams
    ]);

    const { page } = sp;

    const pageNum = page ? parseInt(page) : 1;
    if (isNaN(pageNum) || pageNum < 1)
        redirect('/jobs');



    return (
        <div className="sm:pr-3">
            <Suspense fallback={<SearchMainSectionSkeleton type={'job'} />}>
                <MainContentWrapper lang={lang} sp={sp} />
            </Suspense>
        </div>
    )
}

async function MainContentWrapper({ lang, sp }) {
    const { search, org, rStatus, cat, location, qualification, expLvl, page } = sp;
    const [{ itemCount, jobs }, orgName, locationName, qualificationName, messages] = await Promise.all([
        getJobs({ search, org, rStatus, cat, location, qualification, expLvl, page, lang }),
        org ? getNameFromSlug('orgs', org, lang) : undefined,
        location && location !== 'all-india' ? getLocationNameFromSlug(location, lang) : undefined,
        qualification && qualification !== 'graduate' ? getNameFromSlug('qualifications', qualification, lang) : undefined,
        getMessages(lang)
    ]);

    const displayedParams = {
        search: search ? { value: `${messages.jobs.search}: ${search}`, slug: search } : undefined,
        org: org ? { value: orgName, slug: org } : undefined,
        rStatus: rStatus ? { value: messages.jobs.displayedFilters.rStatuses[rStatus], slug: rStatus } : undefined,
        cat: cat ? { value: messages.jobs.filters.categories[cat], slug: cat } : undefined,
        location: location ? { value: locationName || messages.jobs.filters.locations[location], slug: location } : undefined,
        qualification: qualification ? { value: qualificationName || messages.jobs.filters.qualifications[qualification], slug: location } : undefined,
        expLvl: expLvl ? { value: messages.jobs.filters.expLvls[expLvl], slug: expLvl } : undefined,
    }

    return (
        <>
            <JobsHeader displayedParams={displayedParams} />
            <JobsList itemCount={itemCount} currentPage={page ? parseInt(page) : page} jobs={jobs} />
        </>
    )
}
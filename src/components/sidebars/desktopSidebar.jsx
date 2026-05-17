'use client';

import { useParams, usePathname } from "next/navigation";

import RecruitmentSidebar from "./recruitmentSidebar";
import RecruitmentsSidebar from "./recruitmentsSidebar";
import JobsSidebar from "./jobsSidebar";
import OrgsSidebar from "./orgsSidebar";
import JobSidebar from "./jobSidebar";

export default function DesktopSidebar({ jobsFilters, recruitmentsFilters, sectors, fields, details }) {
    const { recruitment } = useParams();
    const pathName = usePathname();

    return (
        <>
            {recruitment && <RecruitmentSidebar details={details} />}
            {pathName === '/recruitments' && <RecruitmentsSidebar recruitmentsFilters={recruitmentsFilters} />}
            {pathName === '/jobs' && <JobsSidebar jobsFilters={jobsFilters} />}
            {pathName.includes('/jobs/') && <JobSidebar fields={fields} />}
            {pathName === '/orgs' && <OrgsSidebar sectors={sectors} />}
        </>
    )

}
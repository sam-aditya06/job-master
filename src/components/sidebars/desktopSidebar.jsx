'use client';

import { useParams, usePathname } from "next/navigation";

import RecruitmentSidebar from "./recruitmentSidebar";
import RecruitmentsSidebar from "./recruitmentsSidebar";
import JobsSidebar from "./jobsSidebar";
import JobSidebar from "./jobSidebar";
import { useMessages } from "../messageProvider";

export default function DesktopSidebar({ jobsFilters, recruitmentsFilters, fields, details }) {
    const { recruitment } = useParams();
    const pathName = usePathname();
    const { lang } = useMessages();

    return (
        <>
            {recruitment && <RecruitmentSidebar details={details} />}
            {pathName === `/${lang}/recruitments` && <RecruitmentsSidebar recruitmentsFilters={recruitmentsFilters} />}
            {pathName === `/${lang}/jobs` && <JobsSidebar jobsFilters={jobsFilters} />}
            {pathName.includes('/jobs/') && <JobSidebar fields={fields} />}
        </>
    )

}
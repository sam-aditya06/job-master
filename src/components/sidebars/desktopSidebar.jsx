'use client';

import { useParams, usePathname } from "next/navigation";
import RecruitmentSidebar from "./recruitmentSidebar";
import RecruitmentsSidebar from "./recruitmentsSidebar";
import JobsSidebar from "./jobsSidebar";
import OrgsSidebar from "./orgsSidebar";
import RecruitmentBodiesSidebar from "./recruitmentBodiesSidebar";
import JobSidebar from "./jobSidebar";

export default function DesktopSidebar({ orgs, states, recruiters, fields, details }) {
    const { recruitment } = useParams();
    const pathName = usePathname();

    return (
        <>
            {recruitment && <RecruitmentSidebar details={details} />}
            {pathName === '/recruitments' && <RecruitmentsSidebar recruiters={recruiters} orgs={orgs} states={states} />}
            {pathName === '/jobs' && <JobsSidebar orgs={orgs} states={states} />}
            {pathName.includes('/jobs/') && <JobSidebar fields={fields} />}
            {pathName === '/orgs' && <OrgsSidebar />}
            {pathName === '/recruitment-bodies' && <RecruitmentBodiesSidebar />}
        </>
    )

}
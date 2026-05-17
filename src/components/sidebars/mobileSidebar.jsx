"use client"

import { useEffect, useState } from "react"
import { useParams, usePathname, useSearchParams } from "next/navigation"

import { List } from "lucide-react"

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import RecruitmentSidebar from "./recruitmentSidebar"
import RecruitmentsSidebar from "./recruitmentsSidebar"
import JobsSidebar from "./jobsSidebar"
import JobSidebar from "./jobSidebar"
import OrgsSidebar from "./orgsSidebar";

export default function MobileSidebar({ jobsFilters, recruitmentsFilters, sectors, fields, details }) {
    const { recruitment } = useParams();
    const sp = useSearchParams();
    const pathName = usePathname()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(false)
    }, [pathName, sp]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className='flex justify-center items-center border rounded-md h-8 w-8'><List /></SheetTrigger>
            <SheetContent side='left'>
                <SheetTitle className='hidden'>Menu</SheetTitle>
                {recruitment && <RecruitmentSidebar details={details} />}
                {pathName === '/recruitments' && <RecruitmentsSidebar recruitmentsFilters={recruitmentsFilters} />}
                {pathName === '/jobs' && <JobsSidebar jobsFilters={jobsFilters} />}
                {pathName.includes('/jobs/') && <JobSidebar fields={fields} />}
                {pathName === '/orgs' && <OrgsSidebar sectors={sectors} />}
            </SheetContent>
        </Sheet>
    )
}

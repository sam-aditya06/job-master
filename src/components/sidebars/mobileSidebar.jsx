"use client"

import { useEffect, useState } from "react"
import { useParams, usePathname, useSearchParams } from "next/navigation"

import { List } from "lucide-react"

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import RecruitmentSidebar from "./recruitmentSidebar"
import RecruitmentsSidebar from "./recruitmentsSidebar"
import JobsSidebar from "./jobsSidebar"
import JobSidebar from "./jobSidebar"

export default function MobileSidebar({ orgs, regions, recruiters, details }) {
    const { recruitment } = useParams();
    const sp = useSearchParams();
    const stage = sp.get('stage');
    const year = sp.get('year');
    const pathName = usePathname()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Close sheet whenever route changes
        setOpen(false)
    }, [pathName, stage, year]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className='flex justify-center items-center border rounded-md h-8 w-8'><List /></SheetTrigger>
            <SheetContent side='left'>
                <SheetTitle className='hidden'>Menu</SheetTitle>
                {recruitment && <RecruitmentSidebar details={details} />}
                {pathName === '/recruitments' && <RecruitmentsSidebar recruiters={recruiters} orgs={orgs} regions={regions} />}
                {pathName === '/jobs' && <JobsSidebar recruiters={recruiters} orgs={orgs} regions={regions} setSidebarOpen={setOpen} />}
                {pathName.includes('/jobs/') && <JobSidebar />}
            </SheetContent>
        </Sheet>
    )
}

'use client';

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";

import { ListFilter, PanelLeftOpen } from "lucide-react";

import JobsSidebar from "@/components/sidebars/jobsSidebar";
import JobSidebar from "@/components/sidebars/jobSidebar";
import RecruitmentsSidebar from "@/components/sidebars/recruitmentsSidebar";
import RecruitmentSidebar from "@/components/sidebars/recruitmentSidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarSkeleton } from "@/components/skeletons";
import { Button } from "../ui/button";

export default function Sidebar({ screen }) {

    const pathName = usePathname();
    const { lang, stage } = useParams();
    const sp = useSearchParams();

    const containerRef = useRef(null);

    const [sidebarData, setSidebarData] = useState(undefined);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (pathName.includes('/jobs/'))
            return;
        const fetchSidebar = async () => {
            try {
                const res = await fetch(`/api/sidebar${pathName}?${sp}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        setSidebarData(null);
                        return;
                    }

                    throw new Error(`Failed to fetch sidebar: ${res.status}`);
                }

                const data = await res.json();
                setSidebarData({ ...data, pathName });
            } catch (error) {
                console.error("Failed to fetch sidebar:", error);
                setSidebarData(null);
            }
        };

        fetchSidebar();
    }, [pathName, sp]);


    useEffect(() => {
        if (open)
            setOpen(false)
    }, [pathName, sp]);

    const handleSheetClose = () => {
        setOpen(false);
    }

    return (
        <>
            {/* {
                (sidebarData && (sidebarData.pathName === pathName || pathName.includes(stage))) || pathName.includes('/jobs/') ?
                    <> */}
            {
                screen === 'desktop' ?
                    <>
                        {pathName === `/${lang}/jobs` && <JobsSidebar jobsFilters={sidebarData} />}
                        {pathName.includes('/jobs/') && <JobSidebar />}
                        {pathName === `/${lang}/recruitments` && <RecruitmentsSidebar recruitmentsFilters={sidebarData} />}
                        {pathName.includes('/recruitments/') && <RecruitmentSidebar details={sidebarData} />}
                    </> :
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            {(pathName === `/${lang}/jobs` || pathName === `/${lang}/recruitments`) ?
                                <Button className='border dark:border-white/15 shadow-sm bg-white dark:bg-white/10 !p-0 w-9 h-9'>
                                    <ListFilter className="!w-6 !h-6 stroke-black dark:stroke-white" />
                                </Button> :
                                <Button className='fixed border border-white/15 shadow-md bg-white dark:bg-neutral-800 !p-0 w-10 h-10'>
                                    <PanelLeftOpen className="!w-6 !h-6 stroke-brand dark:stroke-white" />
                                </Button>
                            }
                        </SheetTrigger>
                        <SheetContent side='left' className='px-3' ref={containerRef}>
                            <SheetTitle className='hidden'>Menu</SheetTitle>
                            {pathName === `/${lang}/jobs` && <JobsSidebar jobsFilters={sidebarData} />}
                            {pathName.includes('/jobs/') && <JobSidebar screen={screen} handleSheetClose={handleSheetClose} />}
                            {pathName === `/${lang}/recruitments` && <RecruitmentsSidebar containerRef={containerRef} />}
                            {pathName.includes('/recruitments/') && <RecruitmentSidebar screen={screen} details={sidebarData} handleSheetClose={handleSheetClose} />}
                        </SheetContent>
                    </Sheet>
            }
            {/* </> :
                    sidebarData !== null && <SidebarSkeleton />
            } */}
        </>
    )
}
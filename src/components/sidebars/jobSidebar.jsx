'use client';

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { useContentLoader } from "@/lib/context/paginateContext";
import { useMessages } from "@/components/messageProvider";
import { JobSidebarSkeleton } from "../skeletons";
import Link from "next/link";

export default function JobSidebar({ screen, handleSheetClose }) {

    const { job, jobNavSlug, lang } = useParams();
    const router = useRouter();
    const pathName = usePathname();
    const { messages } = useMessages();

    const { setIsLoading } = useContentLoader();

    const [selected, setSelected] = useState(() => jobNavSlug || (pathName.includes('/recruitments') && 'recruitments') || 'overview');
    const [linkHeadings, setLinkHeadings] = useState(undefined);

    useEffect(() => {
        const fetchSidebar = async () => {
            try {
                const res = await fetch(`/api/sidebar/${lang}/jobs/${job}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        setLinkHeadings(null);
                        return;
                    }

                    throw new Error(`Failed to fetch sidebar: ${res.status}`);
                }

                const data = await res.json();
                if (data)
                    setLinkHeadings(data);
            } catch (error) {
                console.error("Failed to fetch sidebar:", error);
            }
        };

        fetchSidebar();
    }, []);

    const handleSelect = (slug) => {
        screen === 'mobile' && handleSheetClose();
        setIsLoading(true);
        setSelected(slug);
        slug === 'overview' ? router.replace(`/jobs/${job}`) : router.replace(`/jobs/${job}/${slug}`);
    }

    return (
        <>
            {
                linkHeadings ?
                    <div className="flex flex-col gap-5 mt-12 xl:mt-0 p-2 h-full overflow-y-auto">
                        <p className="text-lg text-muted-foreground">{messages.recruitment.heading}</p>
                        <div className="flex flex-col gap-5 pl-5">
                            {
                                linkHeadings.map(lh => (
                                    <Link key={lh.slug} href={`/${lang}/jobs/${job}#${lh.slug}`} className="font-semibold hover:text-brand cursor-pointer">
                                        {lh.headingName}
                                    </Link>

                                ))
                            }
                            <Link href={`/${lang}/jobs/${job}#recruitments`} className="font-semibold hover:text-brand cursor-pointer">
                                {messages.job.recruitments.heading}
                            </Link>
                        </div>
                    </div> : <JobSidebarSkeleton />
            }
        </>
    )
}
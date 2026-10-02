'use client';

import { useContentLoader } from "@/lib/context/paginateContext";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMessages } from "../messageProvider";

export default function JobSidebar({ screen, handleSheetClose }) {

    const { job, jobNavSlug } = useParams();
    const router = useRouter();
    const pathName = usePathname();
    const { messages } = useMessages();

    const { setIsLoading } = useContentLoader();

    const [selected, setSelected] = useState(() => jobNavSlug || (pathName.includes('/recruitments') && 'recruitments') || 'overview');

    const handleSelect = (slug) => {
        screen === 'mobile' && handleSheetClose();
        setIsLoading(true);
        setSelected(slug);
        slug === 'overview' ? router.replace(`/jobs/${job}`) : router.replace(`/jobs/${job}/${slug}`);
    }

    return (
        <div className="flex flex-col gap-5 mt-12 xl:mt-5 p-2 h-full overflow-y-auto">
            <p className={`flex justify-center border border-transparent rounded-md py-1 w-full${selected === 'overview' ? ' bg-brand text-white' : ' hover:border-brand hover:text-brand'} cursor-pointer`} onClick={() => handleSelect('overview')}>
                {messages.job.overview}
            </p>
            <p className={`flex justify-center border border-transparent rounded-md py-1 w-full${selected === 'eligibility-criteria' ? ' bg-brand text-white' : ' hover:border-brand hover:text-brand'} cursor-pointer`} onClick={() => handleSelect('eligibility-criteria')}>
                {messages.job.eligibilityCriteria}
            </p>
            <p className={`flex justify-center border border-transparent rounded-md py-1 w-full${selected === 'selection-process' ? ' bg-brand text-white' : ' hover:border-brand hover:text-brand'} cursor-pointer`} onClick={() => handleSelect('selection-process')}>
                {messages.job.selectionProcess}
            </p>
            <p className={`flex justify-center border border-transparent rounded-md py-1 w-full${selected === 'recruitments' ? ' bg-brand text-white' : ' hover:border-brand hover:text-brand'} cursor-pointer`} onClick={() => handleSelect('recruitments')}>
                {messages.job.recruitments}
            </p>
        </div>
    )
}
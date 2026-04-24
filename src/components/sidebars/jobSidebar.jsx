'use client';

import { useContentLoader } from "@/lib/context/paginateContext";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function JobSidebar({ fields }) {

    const { job, jobNavSlug } = useParams();
    const router = useRouter();

    const { setIsLoading } = useContentLoader();

    const [selected, setSelected] = useState(() => jobNavSlug || 'overview');

    const handleSelect = (slug) => {
        setIsLoading(true);
        setSelected(slug);
        router.replace(`/jobs/${job}/${slug}`);
    }

    return (
        <div className="flex flex-col gap-5 mt-12 xl:mt-5 p-2 h-full overflow-y-auto">
            <p className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'overview' ? ' bg-brand text-white' : ' hover:bg-brand/40 hover:text-white'} cursor-pointer`} onClick={() => handleSelect('overview')}>
                Overview
            </p>
            {fields.includes('eligibilityCriteria') && <p className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'eligibility-criteria' ? ' bg-brand text-white' : ' hover:bg-brand/40 hover:text-white'} cursor-pointer`} onClick={() => handleSelect('eligibility-criteria')}>
                Eligibility Criteria
            </p>}
            {fields.includes('responsibilities') && <p className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'responsibilities' ? ' bg-brand text-white' : ' hover:bg-brand/40 hover:text-white'} cursor-pointer`} onClick={() => handleSelect('responsibilities')}>
                Responsibilities
            </p>}
            {fields.includes('perks') && <p className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'perks' ? ' bg-brand text-white' : ' hover:bg-brand/40 hover:text-white'} cursor-pointer`} onClick={() => handleSelect('perks')}>
                Perks
            </p>}
            {fields.includes('physicalStandards') && <p className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'physical-standards' ? ' bg-brand text-white' : ' hover:bg-brand/40 hover:text-white'} cursor-pointer`} onClick={() => handleSelect('perks')}>
                Physical Standards
            </p>}
            {fields.includes('medicalStandards') && <p className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'medical-standards' ? ' bg-brand text-white' : ' hover:bg-brand/40 hover:text-white'} cursor-pointer`} onClick={() => handleSelect('perks')}>
                Medical Standards
            </p>}
            <p className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'recruitment-details' ? ' bg-brand text-white' : ' hover:bg-brand/40 hover:text-white'} cursor-pointer`} onClick={() => handleSelect('recruitment-details')}>
                Recruitment Details
            </p>
        </div>
    )
}
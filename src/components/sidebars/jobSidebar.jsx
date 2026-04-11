'use client';

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Hourglass, Lock } from "lucide-react";

export default function JobSidebar({ fields }) {

    const { job, jobNavSlug } = useParams();
    
    const [selected, setSelected] = useState(() => jobNavSlug || 'overview');

    const handleSelect = (slug) => {
        setSelected(slug);
    }

    return (
        <div className="flex flex-col gap-5 mt-12 xl:mt-5 p-2 h-full overflow-y-auto">
            <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'overview' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}`} onClick={() => handleSelect('overview')}>
                Overview
            </Link>
            {fields.includes('eligibilityCriteria') && <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'eligibility-criteria' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/eligibility-criteria`} onClick={() => handleSelect('eligibility-criteria')}>
                Eligibility Criteria
            </Link>}
            {fields.includes('responsibilities') && <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'responsibilities' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/responsibilities`} onClick={() => handleSelect('responsibilities')}>
                Responsibilities
            </Link>}
            {fields.includes('perks') && <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'perks' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/perks`} onClick={() => handleSelect('perks')}>
                Perks
            </Link>}
            {fields.includes('physicalStandards') && <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'physical-standards' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/perks`} onClick={() => handleSelect('perks')}>
                Physical Standards
            </Link>}
            {fields.includes('medicalStandards') && <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'medical-standards' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/perks`} onClick={() => handleSelect('perks')}>
                Medical Standards
            </Link>}
            {fields.includes('recruitmentDetails') && <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'recruitment-details' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/perks`} onClick={() => handleSelect('perks')}>
                Recruitment Details
            </Link>}
        </div>
    )
}
'use client';

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Hourglass, Lock } from "lucide-react";

export default function JobSidebar({ details }) {

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
            <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'eligibility-criteria' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/eligibility-criteria`} onClick={() => handleSelect('eligibility-criteria')}>
                Eligibility Criteria
            </Link>
            <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'responsibilities' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/responsibilities`} onClick={() => handleSelect('responsibilities')}>
                Responsibilities
            </Link>
            <Link className={`flex justify-center rounded-md pl-2 py-1 w-full${selected === 'perks' ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/jobs/${job}/perks`} onClick={() => handleSelect('perks')}>
                Perks
            </Link>
        </div>
    )
}
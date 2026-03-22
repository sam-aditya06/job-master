'use client';

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Hourglass, Lock } from "lucide-react";

export default function RecruitmentSidebar({ details }) {

    const { recruitment } = useParams();
    const sp = useSearchParams();
    const pathName = usePathname();
    const router = useRouter();

    const [isLoading, startTransition] = useTransition();

    const y = sp.get("y");
    const stage = sp.get('stage');
    const currentYear = new Date().getFullYear().toString();
    const year = y ? Number(y) : new Date().getFullYear();

    const [selected, setSelected] = useState(stage);
    const [selectedYear, setSelectedYear] = useState(y || currentYear);

    const handleSelect = (slug) => {
        setSelected(slug);
    }

    const handleYearChange = (year) => {
        const searchParams = new URLSearchParams();
        searchParams.set('y', year);
        setSelectedYear(year);
        startTransition(() => {
            router.push(`${pathName}?${searchParams.toString()}`);
        })
    }

    return (
        <div className="flex flex-col gap-5 mt-12 lg:mt-5 p-2 h-full overflow-y-auto">
            <Select value={selectedYear} onValueChange={(val) => handleYearChange(val)}>
                <SelectTrigger className='w-full'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {
                        details.years.map(yr => (
                            <SelectItem key={yr} value={yr}>{yr}</SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>
            <Link className={`flex justify-center border rounded-md mt-5 pl-2 py-1 w-full${!selected ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/recruitments/${recruitment}`} onClick={() => handleSelect(undefined)}>
                Overview
            </Link>
            <p className="text-muted-foreground">Timeline</p>
            <div className="flex gap-4 pl-3">
                <div className="flex flex-col pt-[2px]">
                    {
                        Array.from({ length: details.stages.length }).map((_, i) => (
                            <div key={i}>
                                {
                                    details.stages[i].status === 'completed' &&
                                    <div className="flex justify-center items-center h-6 w-6 border border-brand rounded-full bg-brand">
                                        {
                                            <Check size={18} className="stroke-white" />
                                        }
                                    </div>
                                }
                                {
                                    details.stages[i].status === 'pending' &&

                                    <div className="flex justify-center items-center h-6 w-6 border border-brand rounded-full">
                                        {
                                            <Hourglass size={15} className="stroke-brand" />
                                        }
                                    </div>
                                }
                                {
                                    details.stages[i].status === 'not-reached' &&
                                    <div className="flex justify-center items-center h-6 w-6 border border-neutral-500 rounded-full bg-neutral-300">
                                        {
                                            <Lock size={15} className="stroke-neutral-500" />
                                        }
                                    </div>
                                }
                                {i !== details.stages.length - 1 && details.stages[i + 1].status === 'completed' && <div className="border border-brand mx-auto w-0 h-6"></div>}
                                {i !== details.stages.length - 1 && details.stages[i + 1].status === 'pending' && <div className="border border-dashed border-brand mx-auto w-0 h-6"></div>}
                                {i !== details.stages.length - 1 && details.stages[i + 1].status === 'not-reached' && <div className="border mx-auto w-0 h-6"></div>}
                            </div>
                        ))
                    }
                </div>
                <ul className="flex flex-col gap-6 w-full">
                    {
                        details?.stages?.map(stage => (
                            <li key={stage.slug} className={`w-fit${selected === stage.slug ? ' text-brand font-bold' : stage.status === 'not-reached' ? ' text-muted-foreground cursor-none' : ' hover:text-brand hover:font-bold'}`}>
                                {
                                    stage.status === 'not-reached' ?
                                        <p className="text-muted-foreground cursor-not-allowed">
                                            {stage.name}
                                        </p> :
                                        <Link href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                            {stage.name}
                                        </Link>
                                }
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}

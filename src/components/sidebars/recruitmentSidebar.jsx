'use client';

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Hourglass, Lock } from "lucide-react";

export default function RecruitmentSidebar({ details }) {

    const { recruitment } = useParams();
    const sp = useSearchParams();
    const pathName = usePathname();
    const router = useRouter();

    const [isLoading, startTransition] = useTransition();

    const paramYear = sp.get("year");
    const stage = sp.get('stage');
    const currentYear = details.years[0];
    const year = paramYear ? Number(y) : currentYear;

    const [selected, setSelected] = useState(stage);
    const [selectedYear, setSelectedYear] = useState(year);

    const handleSelect = (slug) => {
        setSelected(slug);
    }

    const handleYearChange = (year) => {
        const searchParams = new URLSearchParams();
        searchParams.set('year', year);
        setSelectedYear(year);
        startTransition(() => {
            router.push(`${pathName}?${searchParams.toString()}`);
        })
    }

    return (
        <div className="grow flex flex-col gap-5 mt-12 xl:mt-0 h-full p-2 overflow-y-auto">
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
                        details?.stages?.map((stage, i) => (
                            <div key={stage.slug} className="flex flex-col text-sm">
                                {
                                    stage.status === 'completed' &&
                                    <div className="flex gap-2 items-center">
                                        <div className="flex justify-center items-center h-6 w-6 border border-brand rounded-full bg-brand">
                                            <Check size={18} className="stroke-white" />
                                        </div>
                                        <Link className={selected === stage.slug ? 'text-brand font-bold' : 'hover:text-brand hover:font-bold'} href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                            {stage.name}
                                        </Link>
                                    </div>
                                }
                                {
                                    stage.status === 'pending' &&

                                    <div className="flex gap-2 items-center">
                                        <div className="flex gap-2 justify-center items-center h-6 w-6 border border-brand rounded-full">
                                            <Hourglass size={15} className="stroke-brand" />
                                        </div>
                                        <Link className={selected === stage.slug ? 'text-brand font-bold' : 'hover:text-brand hover:font-bold'} href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                            {stage.name}
                                        </Link>
                                    </div>
                                }
                                {
                                    stage.status === 'not-reached' &&
                                    <div className="flex gap-2 items-center">
                                        <div className="flex gap-2 justify-center items-center h-6 w-6 border border-neutral-500 rounded-full bg-neutral-300">
                                            <Lock size={15} className="stroke-neutral-500" />
                                        </div>
                                        <p className="text-muted-foreground cursor-not-allowed cursor-none">
                                            {stage.name}
                                        </p>
                                    </div>
                                }
                                {i !== details.stages.length - 1 && details.stages[i + 1].status === 'completed' && <div className="border border-brand ml-[0.65rem] w-0 h-6"></div>}
                                {i !== details.stages.length - 1 && details.stages[i + 1].status === 'not-reached' && <div className="border ml-[0.65rem] w-0 h-6"></div>}
                                {i !== details.stages.length - 1 && details.stages[i + 1].status === 'pending' && <div className="border border-dashed border-brand ml-[0.65rem] w-0 h-6"></div>}
                            </div>
                        ))
                    }
                </div>
                {/* <ul className="flex flex-col gap-[1.8rem] w-full">
                    {
                        details?.stages?.map(stage => (
                            <li key={stage.slug} className={`w-fit leading-none text-sm${selected === stage.slug ? ' text-brand font-bold' : stage.status === 'not-reached' ? ' text-muted-foreground cursor-none' : ' hover:text-brand hover:font-bold'}`}>
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
                </ul> */}
            </div>
        </div>
    )
}

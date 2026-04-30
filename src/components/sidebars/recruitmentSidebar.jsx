'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import { Check, Clock, Hourglass, Lock } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContentLoader } from "@/lib/context/paginateContext";


export default function RecruitmentSidebar({ details }) {

    const { recruitment } = useParams();
    const sp = useSearchParams();
    const pathName = usePathname();
    const router = useRouter();

    console.log({ details });

    const { setIsLoading } = useContentLoader();

    const paramFY = sp.get("fy");
    const stage = sp.get('stage');
    const currentFY = `${details.years[0]}-${(details.years[0] + 1).toString().slice(-2)}`;
    const fy = paramFY || currentFY;

    const [selected, setSelected] = useState('');
    const [selectedFY, setSelectedFY] = useState('');

    useEffect(() => {
        stage && setSelected(stage);
        fy && setSelectedFY(fy);
    }, [stage, fy]);

    const handleSelect = (slug) => {
        setSelected(slug);
        setIsLoading(true);
        router.replace(`/recruitments/${recruitment}?stage=${slug}`)

    }

    const handleYearChange = (year) => {
        const searchParams = new URLSearchParams();
        if (year !== currentFY) {
            searchParams.set('fy', year);
        }
        else {
            if (paramFY)
                searchParams.delete('fy');
        }
        setSelectedFY(year);
        router.push(`${pathName}?${searchParams.toString()}`);
    }

    const handleClick = () => {

    }

    return (
        <div className="grow flex flex-col gap-5 mt-12 xl:mt-0 h-full p-2 overflow-y-auto">
            <div className="flex flex-col gap-2">
                <Label htmlFor='recruitmentYear' className='text-sm'>Recruitment Cycle</Label>
                <Select id='recruitmentYear' value={selectedFY} onValueChange={(val) => handleYearChange(val)}>
                    <SelectTrigger className='w-full'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            details.years.map(year => {
                                const fy = `${year}-${(year + 1).toString().slice(-2)}`;
                                return <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                            })
                        }
                    </SelectContent>
                </Select>
            </div>
            <Link className={`flex justify-center border rounded-md mt-5 pl-2 py-1 w-full${!selected ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} href={`/recruitments/${recruitment}`} onClick={() => handleSelect(undefined)}>
                Overview
            </Link>
            {
                !paramFY &&
                <>
                    <p className="text-muted-foreground">Timeline</p>
                    <div className="flex gap-4 pl-3">
                        <div className="flex flex-col pt-[2px]">
                            {
                                details?.stages?.map((stage, i) => (
                                    <div key={stage.slug} className="flex flex-col text-sm">
                                        {
                                            stage.status === 'pending' &&

                                            <div className="flex gap-2 items-center">
                                                <div className="flex gap-2 justify-center items-center h-6 w-6 border border-brand rounded-full">
                                                    <Hourglass size={15} className="stroke-brand" />
                                                </div>
                                                <p className={`${selected === stage.slug ? 'text-brand font-bold' : 'hover:text-brand hover:font-bold'} cursor-pointer`} href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                                    {stage.name}
                                                </p>
                                            </div>
                                        }
                                        {
                                            stage.status === 'ongoing' &&

                                            <div className="flex gap-2 items-center">
                                                <div className="flex justify-center items-center h-6 w-6 border border-brand rounded-full">
                                                    <Clock className="rounded-full w-full h-full stroke-brand" />
                                                </div>
                                                <p className={`${selected === stage.slug ? 'text-brand font-bold' : 'hover:text-brand hover:font-bold'} cursor-pointer`} href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                                    {stage.name}
                                                </p>
                                            </div>
                                        }
                                        {
                                            stage.status === 'completed' &&
                                            <div className="flex gap-2 items-center">
                                                <div className="flex justify-center items-center h-6 w-6 border border-brand rounded-full bg-brand">
                                                    <Check size={18} className="stroke-white" />
                                                </div>
                                                <p className={`${selected === stage.slug ? 'text-brand font-bold' : 'hover:text-brand hover:font-bold'} cursor-pointer`} href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                                    {stage.name}
                                                </p>
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
                                        {i !== details.stages.length - 1 && details.stages[i + 1].status === 'pending' && <div className="border border-dashed border-brand ml-[0.65rem] w-0 h-6"></div>}
                                        {i !== details.stages.length - 1 && details.stages[i + 1].status === 'ongoing' && <div className="border border-brand ml-[0.65rem] w-0 h-6"></div>}
                                        {i !== details.stages.length - 1 && details.stages[i + 1].status === 'completed' && <div className="border border-brand ml-[0.65rem] w-0 h-6"></div>}
                                        {i !== details.stages.length - 1 && details.stages[i + 1].status === 'not-reached' && <div className="border ml-[0.65rem] w-0 h-6"></div>}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

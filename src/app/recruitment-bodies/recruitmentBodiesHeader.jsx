'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFilter } from "@/lib/context/filterContext";
import { ChipSkeleton } from "@/components/skeletons";
import { deslugify } from "@/lib/utils";

export default function RecruitmentBodiesHeader() {

    const sp = useSearchParams();

    const { optimisticParams, applyFilter, removeFilter } = useFilter();

    const search = optimisticParams.search;

    const [inputValue, setInputValue] = useState(search ?? '');

    useEffect(() => {
        if (!inputValue) {
            if (search) {
                removeFilter('search');
            }
            return;
        }
        const timoutId = setTimeout(() => {
            applyFilter({ search: inputValue });
        }, 300);
        return () => clearTimeout(timoutId);
    }, [inputValue]);

    useEffect(() => {
        search ? setInputValue(search) : setInputValue('');
    }, [search]);

    return (
        <>
            <div className="relative">
                <Input className='mt-5' placeholder='search an organisation' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                <Button
                    className='absolute right-2 top-7 bg-transparent hover:bg-transparent p-0 w-5 h-5 cursor-pointer'
                    size="icon"
                    onClick={() => removeFilter('search')}
                >
                    <X className="!w-4 !h-4 stroke-muted-foreground" />
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-5">
                <p>Filters:</p>
                {Object.keys(optimisticParams).map(key => {
                    const param = key === 'search' ? sp.get(key) : deslugify(sp.get(key));
                    if (param && (key === 'search' ? param === optimisticParams[key] : param === deslugify(optimisticParams[key])))
                        return (
                            <div key={key} className="flex items-center gap-1 border rounded-full pl-2 pr-1 py-1">
                                <p className="text-sm">{`${key}: ${param}`}</p>
                                <Button
                                    className='rounded-full !h-6 !w-6 cursor-pointer'
                                    size="icon"
                                    onClick={() => removeFilter(key)}
                                >
                                    <X className="!h-4 !w-4" />
                                </Button>
                            </div>
                        )
                    else
                        return <ChipSkeleton key={key} />
                })}
            </div>
        </>
    )
}
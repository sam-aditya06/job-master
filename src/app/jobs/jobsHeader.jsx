'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFilter } from "@/lib/context/filterContext";
import { ChipSkeleton } from "@/components/skeletons";

import { deslugify } from "@/lib/utils";

export default function JobsHeader({ org }) {

    const sp = useSearchParams();

    const { optimisticParams, applyFilter, removeFilter } = useFilter();

    const search = optimisticParams.search;

    const [inputValue, setInputValue] = useState('');

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
        <div className="flex flex-col gap-7">
            <h1 className="text-3xl text-center">Jobs</h1>
            <div className="relative">
                <Input placeholder='Job Title (e.g., SBI PO, IAS Officer, IBPS PO)' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                <Button
                    className='absolute right-2 top-2 bg-transparent hover:bg-transparent p-0 w-5 h-5 cursor-pointer'
                    size="icon"
                    onClick={() => removeFilter('search')}
                >
                    {inputValue ? <X className="!w-4 !h-4 stroke-muted-foreground" /> : <Search className="!w-4 !h-4 stroke-muted-foreground" />}
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <p>Filters:</p>
                {Object.keys(optimisticParams).filter(key => key !== 'page').map(key => {
                    const displayedParam = key === 'org' ? org : key === 'search' ? sp.get(key) : deslugify(sp.get(key));
                    const displayedFilter = key === 'search' ? `${key}: ${displayedParam}` : key === 'rStatus' ? `Recruitment ${displayedParam}` : displayedParam;
                    if (displayedParam && (
                        key === 'org' ?
                            displayedParam === org :
                            key === 'search' ?
                                displayedParam === optimisticParams[key] :
                                displayedParam === deslugify(optimisticParams[key])
                    ))
                        return (
                            <div key={key} className="flex items-center gap-1 border rounded-full pl-2 pr-1 py-1">
                                <p className="text-sm">{displayedFilter}</p>
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
        </div>
    )
}
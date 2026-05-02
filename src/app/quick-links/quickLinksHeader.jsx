'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useFilter } from "@/lib/context/filterContext";

export default function QuickLinksHeader() {

    const sp = useSearchParams();

    const search = sp.get('search');

    const { applyFilter, removeFilter } = useFilter();

    const [inputValue, setInputValue] = useState(search || '');

    useEffect(() => {
        if (!inputValue) {
            search && removeFilter('search');
            return;
        }
        const timoutId = setTimeout(() => {
            applyFilter({ search: inputValue });
        }, 500);
        return () => {
            clearTimeout(timoutId);
        }
    }, [inputValue]);

    useEffect(() => {
        if (search !== inputValue)
            !search ? setInputValue('') : setInputValue(search)
    }, [search]);

    const handleClearSearch = () => {
        setInputValue('')
        removeFilter('search')
    }

    return (
        <>
            <h1 className="text-3xl text-brand">Quick Links</h1>
            <p className="text-justify">Explore verified govt job opportunities across India, all in one place.
                Our Quick Links page helps you quickly navigate to the latest openings, application resources,
                and important updates—so you can easily find and apply to trusted public sector
                and government jobs.
            </p>
            <div className="relative">
                <Input className='mt-5' placeholder='Search' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                <Button
                    className='absolute right-2 top-7 bg-transparent hover:bg-transparent dark:text-white p-0 w-5 h-5 cursor-pointer'
                    size="icon"
                    onClick={handleClearSearch}
                >
                    {inputValue ? <X className="!w-4 !h-4 stroke-muted-foreground" /> : <Search className="!w-4 !h-4 stroke-muted-foreground" />}
                </Button>
            </div>
        </>
    )
}
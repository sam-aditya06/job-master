'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deslugify } from "@/lib/utils";

export default function JobsHeader() {

    const sp = useSearchParams();
    const router = useRouter();
    const pathName = usePathname();

    const org = sp.get('org');
    const search = sp.get('search');
    const sector = sp.get('sector');
    const qualification = sp.get('qualification');
    const expLvl = sp.get('expLvl');
    const rStatus = sp.get('rStatus');
    const location = sp.get('location');

    const activeFilters = [
        org && 'org',
        search && 'search',
        sector && 'sector',
        qualification && 'qualification',
        expLvl && 'expLvl',
        rStatus && 'rStatus',
        location && 'location'
    ].filter(Boolean);

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        console.log("SEARCH PARAMS CHANGED:", sp.toString())
    }, [sp])

    useEffect(() => {
        const sParams = new URLSearchParams(sp);
        if (!inputValue) {
            if (search) {
                sParams.delete('search');
                router.replace(`${pathName}?${sParams.toString()}`);
            }
            return;
        }
        const timoutId = setTimeout(() => {
            sParams.set('search', inputValue);
            router.replace(`${pathName}?${sParams.toString()}`);
        }, 300);
        return () => {
            clearTimeout(timoutId);
        }
    }, [inputValue]);

    useEffect(() => {
        search ? setInputValue(search) : setInputValue('');
    }, [search]);

    const handleClearFilter = (key) => {
        const newSearchParams = new URLSearchParams(sp);
        newSearchParams.delete(key);
        router.replace(`/jobs?${newSearchParams.toString()}`);
    }

    const filterChips = [
        { key: 'search', label: `search: ${search}` },
        { key: 'org', label: `org: ${org}` },
        { key: 'sector', label: `sector: ${sector}` },
        { key: 'qualification', label: `qualification: ${qualification}` },
        { key: 'expLvl', label: expLvl },
        { key: 'rStatus', label: `recruitment status: ${rStatus}` },
        { key: 'location', label: `location: ${deslugify(location)}` },
    ].filter(({ key }) => activeFilters.includes(key));

    return (
        <div className="flex flex-col mt-10 sm:mt-5">
            <Input className='mt-5' placeholder='search a job' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <div className="flex flex-wrap items-center gap-2 mt-5">
                {filterChips.length > 0 && <p>Filters:</p>}
                {filterChips.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1 border rounded-full pl-2 pr-1 py-1">
                        <p className="text-sm">{label}</p>
                        <Button
                            className='rounded-full !h-6 !w-6 cursor-pointer'
                            size="icon"
                            onClick={() => handleClearFilter(key)}
                        >
                            <X className="!h-4 !w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
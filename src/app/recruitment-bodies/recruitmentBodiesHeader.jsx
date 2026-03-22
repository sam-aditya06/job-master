'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RecruitmentBodiesHeader() {

    const sp = useSearchParams();
    const pathName = usePathname();
    const router = useRouter();

    const sector = sp.get('sector');
    const search = sp.get('search');

    const activeFilters = [
        search && 'search',
        sector && 'sector'
    ].filter(Boolean);

    const [inputValue, setInputValue] = useState('');

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
        router.replace(`${pathName}?${newSearchParams.toString()}`);
    }

    const filterChips = [
        { key: 'search', label: `search: ${search}` },
        { key: 'sector', label: `sector: ${sector}` }
    ].filter(({ key }) => activeFilters.includes(key));

    return (
        <div className="flex flex-col mt-10 sm:mt-5">
            <Input className='mt-5' placeholder='search a recruitment body' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
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
'use client';

import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function QuickLinksHeader() {

    const sp = useSearchParams();
    const router = useRouter();
    const pathName = usePathname();

    const search = sp.get('search');

    const [inputValue, setInputValue] = useState(search || '');

    useEffect(() => {
        if (!inputValue) {
            if (search) {
                const sParams = new URLSearchParams(sp);
                sParams.delete('search');
                router.replace(`${pathName}?${sParams.toString()}`);
            }
            return;
        }
        const timoutId = setTimeout(() => {
            const sParams = new URLSearchParams(sp);
            sParams.set('search', inputValue);
            router.replace(`${pathName}?${sParams.toString()}`);
        }, 500);
        return () => {
            clearTimeout(timoutId);
        }
    }, [inputValue]);

    const handleClearSearch = () => {
        setInputValue('');
        router.replace(pathName);
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
                <Input className='mt-5' placeholder='search an organisation' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                <Button
                    className='absolute right-2 top-7 bg-transparent hover:bg-transparent dark:text-white p-0 w-5 h-5 cursor-pointer'
                    size="icon"
                    onClick={handleClearSearch}
                >
                    <X className="!w-4 !h-4" />
                </Button>
            </div>
        </>
    )
}
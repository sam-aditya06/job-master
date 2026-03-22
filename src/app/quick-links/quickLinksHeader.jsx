'use client';

import { useEffect, useState } from "react";

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

    return (
        <>
            <h1 className="text-3xl text-brand">Quick Links</h1>
            <Input placeholder='search' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        </>
    )
}
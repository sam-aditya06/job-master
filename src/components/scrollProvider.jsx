'use client';

import { useEffect, useRef } from "react";

import { useContentLoader } from "@/lib/context/paginateContext";
import { useFilter } from '@/lib/context/filterContext';

export default function ScrollProvider({ children }) {

    const { isLoading } = useContentLoader();
    const { isPending, isPaginating, setIsPaginating, optimisticParams: { page } } = useFilter();

    const scrollRef = useRef();

    useEffect(() => {
        if (isLoading)
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isLoading]);

    useEffect(() => {
        if (isPaginating || isPending)
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isPaginating, isPending]);

    useEffect(() => {
        if (isPaginating)
            setIsPaginating(false);
    }, [page]);

    return (
        <div className="px-2 h-full overflow-y-auto" ref={scrollRef}>
            {children}
        </div>
    )
}
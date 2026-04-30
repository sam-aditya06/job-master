'use client'

import { useEffect, useRef } from 'react';

import { useFilter } from '@/lib/context/filterContext';

export default function ScrollContainer({ children }) {
    const { isPending, isPaginating, setIsPaginating, optimisticParams: { page } } = useFilter();

    const containerRef = useRef();

    useEffect(() => {
        if (isPaginating || isPending)
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isPaginating, isPending]);

    useEffect(() => {
        if (isPaginating)
            setIsPaginating(false);
    }, [page])

    return <div className="flex flex-col gap-10 p-2 h-full overflow-y-auto" ref={containerRef}>{children}</div>
}
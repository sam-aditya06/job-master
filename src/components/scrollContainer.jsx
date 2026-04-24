'use client'

import { useEffect, useRef } from 'react';

import { useFilter } from '@/lib/context/filterContext';

export default function ScrollContainer({ children }) {
    const { isPaginating, setIsPaginating, optimisticParams: { page } } = useFilter();

    const containerRef = useRef();

    useEffect(() => {
        if (isPaginating)
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isPaginating]);

    useEffect(() => {
        if (isPaginating)
            setIsPaginating(false);
    }, [page])

    return <div className="flex flex-col gap-10 p-2 h-full overflow-y-auto" ref={containerRef}>{children}</div>
}
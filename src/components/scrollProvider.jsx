'use client';

import { useContentLoader } from "@/lib/context/paginateContext";
import { useEffect, useRef } from "react";

export default function ScrollProvider({ children }) {

    const { isLoading } = useContentLoader();

    const scrollRef = useRef();

    useEffect(() => {
        if (isLoading)
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isLoading]);

    return (
        <div className="p-2 h-full overflow-y-auto" ref={scrollRef}>
            {children}
        </div>
    )
}
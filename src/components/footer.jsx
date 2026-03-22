'use client';

import { useEffect, useState } from "react";

export default function Footer() {
    const [currentYear, setCurrentYear] = useState(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="shrink-0 border-t bg-white dark:bg-neutral-800 h-[3.5rem] text-sm text-center">
            <div className="flex flex-col sm:flex-row justify-around md:justify-between md:items-center mx-auto max-[1281px]:px-2 max-w-7xl h-full">
                <div className="flex justify-center gap-6">
                    <a href="/privacy" className="hover:underline hover:text-indigo-600">Privacy Policy</a>
                    <a href="/terms" className="hover:underline hover:text-indigo-600">Terms of Use</a>
                    <a href="/sitemap.xml" className="hover:underline hover:text-indigo-600">Sitemap</a>
                </div>
                <p>© {currentYear ?? ""} Job Master</p>
            </div>
        </footer>
    );
}
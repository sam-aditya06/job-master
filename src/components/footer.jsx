'use client';

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function Footer() {
    const [currentYear, setCurrentYear] = useState(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="shrink-0 border-t bg-white dark:bg-neutral-800 text-sm sm:h-[3.5rem]">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mx-auto max-[1281px]:px-2 h-full max-w-7xl py-1 px-4">

                {/* Left — nav links */}
                <div className="flex flex-wrap justify-between sm:justify-start gap-x-4 gap-y-1 max-sm:px-2">
                    <Link href="/about" className="hover:underline hover:text-indigo-600">About</Link>
                    <Link href="/contact" className="hover:underline hover:text-indigo-600">Contact</Link>
                    <Link href="/privacy-policy" className="hover:underline hover:text-indigo-600">Privacy Policy</Link>
                    <Link href="/terms-of-service" className="hover:underline hover:text-indigo-600">Terms</Link>
                    <Link href="/disclaimer" className="hover:underline hover:text-indigo-600">Disclaimer</Link>
                </div>

                {/* Right — social + copyright */}
                <div className="flex max-sm:flex-col items-center justify-center sm:justify-end gap-3">
                    <div className="flex gap-4">
                        <a
                            href="https://instagram.com/xyz"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Follow us on Instagram"
                            className="hover:text-indigo-600 transition-colors"
                        >
                            <Icon icon="mdi:instagram" width={18} height={18} />
                        </a>
                        <a
                            href="https://youtube.com/@xyz"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Subscribe to our YouTube channel"
                            className="hover:text-indigo-600 transition-colors"
                        >
                            <Icon icon="mdi:youtube" width={20} height={20} />
                        </a>
                        <p className="text-center sm:text-right text-muted-foreground">
                            © {currentYear ?? ""} {process.env.NEXT_PUBLIC_NAME}
                        </p>
                    </div>
                </div>

            </div>
        </footer>
    );
}
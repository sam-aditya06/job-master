'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTheme } from "next-themes";
import { Menu, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMessages } from "./messageProvider";

export default function Header() {

    const { lang, messages } = useMessages();

    const pathName = usePathname();
    const isHome = pathName === `/${lang}`

    const { resolvedTheme, setTheme } = useTheme();

    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setScrolled(false);
        if (!isHome) return

        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [isHome, pathName]);

    const isDark = resolvedTheme === 'dark';
    const transparent = isHome && !scrolled;

    return (
        <header
            className={`fixed top-0 z-50 transition-all duration-150 ease-in-out ${transparent ? 'bg-transparent text-white' : 'border-b bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm dark:border-neutral-700'} w-full h-[3.5rem]`}
        >
            <nav className="flex justify-between items-center mx-auto max-[1281px]:px-2 w-full max-w-7xl h-full">
                <Link href='/'><h1 className="text-brand font-bold text-xl">{process.env.NEXT_PUBLIC_NAME}</h1></Link>
                <div className="flex items-center gap-4">
                    <Link className={`hidden lg:block border border-transparent rounded-md ${pathName.includes('quick-links') ? 'bg-brand dark:bg-neutral-700 text-white' : 'hover:border-brand hover:text-brand dark:hover:border-neutral-700 dark:hover:text-white'} px-2 py-1`} href={`/${lang}/quick-links`}>{messages.header.quickLinks}</Link>
                    <Link className={`hidden lg:block border border-transparent rounded-md ${pathName.includes('jobs') ? 'bg-brand dark:bg-neutral-700 text-white' : 'hover:border-brand hover:text-brand dark:hover:border-neutral-700 dark:hover:text-white'} px-2 py-1`} href={`/${lang}/jobs`}>{messages.header.jobs}</Link>
                    <Link className={`hidden lg:block border border-transparent rounded-md ${pathName.includes('recruitments') && !pathName.includes('jobs') ? 'bg-brand dark:bg-neutral-700 text-white' : 'hover:border-brand hover:text-brand dark:hover:border-neutral-700 dark:hover:text-white'} px-2 py-1`} href={`/${lang}/recruitments`}>{messages.header.recruitments}</Link>
                    <Link className={`hidden lg:block border border-transparent rounded-md ${pathName.includes('feedback') ? 'bg-brand dark:bg-neutral-700 text-white' : 'hover:border-brand hover:text-brand dark:hover:border-neutral-700 dark:hover:text-white'} px-2 py-1`} href={`/${lang}/feedback`}>{messages.header.feedback}</Link>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className='hidden lg:flex rounded-full hover:bg-brand dark:hover:bg-neutral-700 text-brand hover:text-white cursor-pointer' onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                            {mounted && isDark ? <Sun className="hidden lg:block !h-5 !w-5 cursor-pointer" /> : <Moon className="hidden lg:block !h-5 !w-5 cursor-pointer" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {mounted && isDark ? 'Light Mode' : 'Dark Mode'}
                    </TooltipContent>
                </Tooltip>
                <div className="lg:hidden flex gap-2">
                    <Button variant="ghost" size="icon" className='flex rounded-full hover:bg-brand dark:hover:bg-neutral-700 hover:text-white cursor-pointer' onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                        {mounted && isDark ? <Sun className="block !h-5 !w-5 cursor-pointer" /> : <Moon className="block !h-5 !w-5 cursor-pointer" />}
                    </Button>
                    <Sheet>
                        <SheetTrigger className="lg:hidden">
                            <Menu className="lg:hidden !h-6 !w-6" />
                        </SheetTrigger>
                        <SheetContent>
                            <SheetTitle className='hidden'>Menu</SheetTitle>
                            <div className='flex flex-col gap-4 mt-12 px-4'>
                                <SheetClose asChild><Link className={`border border-transparent rounded-md ${pathName.includes('quick-links') ? 'bg-brand dark:bg-neutral-700 text-white' : 'hover:border-brand hover:text-brand dark:hover:border-neutral-700 dark:hover:text-white'} px-2 py-1`} href={`/${lang}/quick-links`}>{messages.header.quickLinks}</Link></SheetClose>
                                <SheetClose asChild><Link className={`border border-transparent rounded-md ${pathName.includes('jobs') ? 'bg-brand dark:bg-neutral-700 text-white' : 'hover:border-brand hover:text-brand dark:hover:border-neutral-700 dark:hover:text-white'} px-2 py-1`} href={`/${lang}/jobs`}>{messages.header.jobs}</Link></SheetClose>
                                <SheetClose asChild><Link className={`border border-transparent rounded-md ${pathName.includes('recruitments') && !pathName.includes('jobs') ? 'bg-brand dark:bg-neutral-700 text-white' : 'hover:border-brand hover:text-brand dark:hover:border-neutral-700 dark:hover:text-white'} px-2 py-1`} href={`/${lang}/recruitments`}>{messages.header.recruitments}</Link></SheetClose>
                                <SheetClose asChild><Link className={`border border-transparent rounded-md ${pathName.includes('feedback') ? 'bg-brand dark:bg-neutral-700 text-white' : 'hover:border-brand hover:text-brand dark:hover:border-neutral-700 dark:hover:text-white'} px-2 py-1`} href={`/${lang}/feedback`}>{messages.header.feedback}</Link></SheetClose>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    )
}
'use client';

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QuickLinkListSkeleton } from "@/components/skeletons";

export default function QuickLinksList({ quickLinks = [] }) {

    const sp = useSearchParams();
    const search = sp.get('search');

    return (
        <>
            {search && <p className="text-2xl font-bold"> Search result for "{search}"</p>}
            {
                quickLinks.length === 0 ?
                    <div className="flex justify-center items-center mt-10">
                        <p className="text-4xl text-muted-foreground">No result found</p>
                    </div> :
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex gap-2">
                            {
                                quickLinks.map(quickLink => (
                                    <Link key={quickLink._id} className="border rounded-md hover:bg-brand px-2 py-1 w-full hover:text-white text-center" href={quickLink.relativeUrl} target="_blank">
                                        {quickLink.name}
                                    </Link>
                                ))
                            }
                        </div>
                    </div>  
            }
        </>
    )
}
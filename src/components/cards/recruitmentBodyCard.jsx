"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getLogoStyles } from "@/lib/utils";

export function RecruitmentBodyCard({ recruitmentBody }) {
    const { name } = recruitmentBody;

    let { containerStyles, imgStyles } = getLogoStyles(name, true);

    return (
        <Link className="group" href={`/recruitment-bodies/${recruitmentBody.slug}`}>
            <Card className='border hover:border-brand rounded-xl hover:shadow-md dark:bg-neutral-900 dark:sm:bg-neutral-800 p-5'>
                <CardContent className="flex flex-col gap-4 px-0">
                    <div className="flex items-center gap-2">
                        <div
                            className="shrink-0 flex items-center border rounded-full p-1.5 w-18 h-18"
                        >
                            <div
                                className="rounded-full flex justify-center items-center bg-white w-full h-full overflow-hidden"
                                style={containerStyles}
                            >
                                <img
                                    style={imgStyles}
                                    src={`${process.env.NEXT_PUBLIC_CDN_URL}/${recruitmentBody.logoSrc}`}
                                    alt={`${recruitmentBody.name} logo`}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold line-clamp-1">{recruitmentBody.name}</span>
                            <span className="text-sm text-muted-foreground">{recruitmentBody.sector.join(' / ')}</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{recruitmentBody.description}</p>
                    <div className="flex justify-end pt-3 border-t">
                        <div className='flex items-center gap-1 text-xs font-medium text-sky-500 dark:text-sky-600 group-hover:gap-2 group-hover:!text-brand transition-all'>
                            View Details <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
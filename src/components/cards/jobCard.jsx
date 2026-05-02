'use client';

import { useRef, useState } from "react";
import Link from "next/link";

import { ArrowRight, Briefcase, Info, MapPin } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deslugify, formatLocation } from "@/lib/utils";

export default function JobCard({ job, page }) {
    const bgColor = page === 'home' ? 'dark:bg-neutral-800' : 'dark:bg-neutral-900 dark:sm:bg-neutral-800';

    const displayedLocation = formatLocation(job.location);

    const triggerRef = useRef(null);

    const [open, setOpen] = useState(false);


    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    return (
        <Link className="group" href={`/jobs/${job.slug}`} >
            <Card className={`border hover:border-brand rounded-xl hover:shadow-md ${bgColor} p-5 transition-all cursor-pointer h-full`}>
                <CardTitle className='hidden'>{job.name} ({job.abbr})</CardTitle>
                <CardContent className='flex flex-col gap-3 w-full px-0'>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block">
                                {deslugify(job.sector)}
                            </span>
                            <h3 className="font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {job.abbr || job.name}
                            </h3>
                            <div className="flex items-center gap-1">
                                <div className="border rounded-full h-fit w-fit p-[2px]">
                                    <img className="h-3 w-3" src={`${process.env.NEXT_PUBLIC_CDN_URL}/${job.orgLogo}`} />
                                </div>
                                <p className="text-xs text-muted-foreground leading-none">{job.orgName}</p>
                            </div>
                        </div>
                        {job.recruitmentStatus == 'ongoing' && <div className="h-3 w-3 rounded-full bg-green-700 translate-y-[1.5px]"></div>}
                        {job.recruitmentStatus == 'pending' && <div className="h-3 w-3 rounded-full bg-yellow-600 translate-y-[1.5px]"></div>}
                        {job.recruitmentStatus == 'completed' && <div className="h-3 w-3 rounded-full bg-gray-400 translate-y-[1.5px]"></div>}
                    </div>

                    {/* Salary highlight */}
                    <div className={`flex items-center gap-1.5 border bg-green-50 dark:bg-emerald-700 rounded-lg px-3 py-2`}>
                        <div className="flex items-center gap-1">
                            <span className={`text-brand dark:text-green-100 text-sm font-semibold`}>
                                ₹{job.payScale.min.toLocaleString("en-IN")} – ₹{job.payScale.max.toLocaleString("en-IN")}
                            </span>
                            <Tooltip open={open} onOpenChange={setOpen}>
                                <TooltipTrigger asChild>
                                    <button
                                        ref={triggerRef}
                                        type="button"
                                        onClick={handleClick}
                                        className="inline-flex items-center justify-center focus:outline-none"
                                        aria-label="Salary information"
                                    >
                                        <Info className="stroke-brand dark:stroke-green-100 w-4 h-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Estimated take-home based on standard deductions.
                                        <br />
                                        Actual amount may vary by tax slab and employer benefits.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <span className={`text-brand dark:text-green-100 text-xs ml-auto`}>
                            {job.payScale.abbr || `Pay Level ${job.payScale.level}`}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed"><Briefcase className="w-3 h-3" />
                            {
                                job.experience.minYears === job.experience.maxYears ?
                                    `${job.experience.minYears} years` :
                                    `${job.experience.minYears} - ${job.experience.maxYears} years`}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#f0ece4]">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {displayedLocation}
                        </div>
                        <div className='flex items-center gap-1 text-xs font-medium text-emerald-500 dark:text-emerald-600 group-hover:gap-2 group-hover:!text-brand transition-all'>
                            View Profile <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
'use client';

import { useRef, useState } from "react";
import Link from "next/link";

import { ArrowRight, Briefcase, Info, MapPin, Wallet } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { formatLocation } from "@/lib/utils";

export default function JobCard({ job }) {

    console.log({ job })

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
            <Card className="border hover:border-brand rounded-xl hover:shadow-md dark:sm:bg-neutral-800 p-4 transition-all cursor-pointer h-full">
                <CardTitle className='hidden'>{job.name}</CardTitle>
                <CardContent className='flex flex-col gap-3 w-full px-0'>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block">
                                {job.orgSectors[0] + (job.orgSectors.length > 1 ? ` +${job.orgSectors.length - 1}` : "")}
                            </span>
                            <h3 className="font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {job.name}
                            </h3>
                            <div className="flex items-center gap-1">
                                <div className="border rounded-full h-5 w-5 p-[2px]">
                                    <div className="rounded-full flex justify-center items-center bg-white w-full h-full overflow-hidden">
                                        <img src={`${process.env.NEXT_PUBLIC_CDN_URL}/${job.orgLogo}`} />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-none">{job.orgName}</p>
                            </div>
                        </div>
                        {job.recruitmentStatus == 'ongoing' && <div className="h-3 w-3 rounded-full bg-green-700 translate-y-[1.5px]"></div>}
                        {job.recruitmentStatus == 'pending' && <div className="h-3 w-3 rounded-full bg-yellow-600 translate-y-[1.5px]"></div>}
                        {job.recruitmentStatus == 'completed' && <div className="h-3 w-3 rounded-full bg-gray-400 translate-y-[1.5px]"></div>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {job.categories.slice(0, 3).map(cat => (
                            <span
                                key={cat}
                                className="border border-brand rounded-full px-2 py-0.5 text-xs text-brand"
                            >
                                {cat}
                            </span>
                        ))}
                        {job.categories.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                +{categories.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed"><Briefcase className="w-3 h-3" />
                            {
                                job.experience.maYears ?
                                    `${job.experience.minYears} - ${job.experience.maxYears} years` :
                                    `${job.experience.minYears} years`
                            }
                        </p>
                        <div className="border border-r-muted-foreground h-4"></div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed">
                            <Wallet className="w-3 h-3" />
                            ₹{job.payScale.min.toLocaleString("en-IN")} – ₹{job.payScale.max.toLocaleString("en-IN")}
                            <Tooltip open={open} onOpenChange={setOpen}>
                                <TooltipTrigger asChild>
                                    <button
                                        ref={triggerRef}
                                        type="button"
                                        onClick={handleClick}
                                        className="inline-flex items-center justify-center focus:outline-none"
                                        aria-label="Salary information"
                                    >
                                        <Info className="stroke-brand dark:stroke-green-100 w-3 h-3" />
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
                        </span>
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
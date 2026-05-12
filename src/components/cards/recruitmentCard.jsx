'use client';

import { useRef, useState } from "react";
import Link from "next/link";

import { ArrowRight, Briefcase, CircleQuestionMark, Clock, MapPin } from "lucide-react";
import { format, isAfter, isSameDay, parseISO } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { formatLocation } from "@/lib/utils";

export default function RecruitmentCard({ recruitment, icon }) {

    const { status, location, sectors, categories } = recruitment;

    console.log({ sectors, categories });

    const displayedLocation = formatLocation(location);

    const color = status === 'pending' ?
        'bg-yellow-600 text-white' :
        status === 'ongoing' ?
            "bg-green-700 text-white" :
            "bg-gray-400 text-white"

    const arrowColor = status === 'pending' ?
        'stroke-amber-500' :
        status === 'ongoing' ?
            "stroke-green-700" :
            "stroke-gray-400";
    const borderHoverColor = status === 'pending' ?
        'amber-500' :
        status === 'ongoing' ?
            "green-700" :
            "gray-400";

    const triggerRef = useRef(null);

    const [open, setOpen] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    return (
        <Link className="group" href={`/recruitments/${recruitment.slug}`}>
            <Card
                style={{ '--hover-color': `var(--color-${borderHoverColor})` }}
                className="aspect-auto border rounded-xl p-5 group-hover:border-[var(--hover-color)] hover:shadow-md dark:bg-neutral-800 h-56 transition-all cursor-pointer"
            >
                <CardContent className='flex flex-col gap-2 px-0 w-full h-full'>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 block max-w-1/2 truncate">
                            {sectors[0] + (sectors.length > 1 ? ` +${sectors.length - 1}` : "")}
                        </span>
                        <span className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
                            {icon} {recruitment.stageStatus}
                        </span>
                    </div>
                    <h3 className="font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {recruitment.name}
                    </h3>
                    <div className="grow flex flex-col justify-between">
                        <p className="text-xs text-muted-foreground leading-relaxed truncate">{recruitment.fullName}</p>
                        <div className="flex flex-wrap gap-2">
                            {categories.slice(0, 3).map(cat => (
                                <span
                                    key={cat}
                                    style={{ '--badge-color': `var(--color-${borderHoverColor})` }}
                                    className="border border-[var(--badge-color)] rounded-full px-2 py-0.5 text-xs text-[var(--badge-color)]"
                                >
                                    {cat}
                                </span>
                            ))}
                            {categories.length > 3 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    +{categories.length - 3}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed"><Briefcase className="w-3 h-3" />
                                {
                                    recruitment.experienceRange.maxYears ?
                                        `${recruitment.experienceRange.minYears} - ${recruitment.experienceRange.maxYears} years` :
                                        `${recruitment.experienceRange.minYears} years`
                                }
                            </p>
                            <div className="border border-r-muted-foreground h-4"></div>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed"><MapPin className="w-3 h-3" />
                                {displayedLocation}
                            </p>
                            {
                                (
                                    isAfter(new Date(recruitment.registrationDeadline), new Date()) ||
                                    isSameDay(new Date(recruitment.registrationDeadline), new Date())
                                ) &&
                                (
                                    <>
                                        <div className="border border-r-muted-foreground h-4"></div>
                                        <div className="flex items-center gap-1">
                                            <span className="flex items-center gap-1 text-xs text-amber-600">
                                                <Clock className="w-3 h-3" /> {format(parseISO(recruitment.registrationDeadline), "dd MMM, yyyy")}
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
                                                        <CircleQuestionMark className="w-4 h-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Registration Deadline
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-[#f0ece4]  text-xs text-muted-foreground">
                            <div className="flex gap-1">
                                <span className="font-semibold text-foreground">{recruitment.vacancies}</span>
                                <span>vacancies</span>

                            </div>
                            <ArrowRight className={`w-4 h-4 ${arrowColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
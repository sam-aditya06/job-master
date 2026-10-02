'use client';

import { useRef, useState } from "react";
import Link from "next/link";

import { ArrowRight, Briefcase, CircleQuestionMark, Clock, MapPin } from "lucide-react";
import { format, isAfter, isSameDay, parseISO } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useMessages } from "@/components/messageProvider";

export function RecruitmentCardV1({ recruitment }) {

    const { lang } = useMessages();

    const triggerRef = useRef(null);

    const [open, setOpen] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    return (
        <Link className="group" href={`/${lang}/recruitments/${recruitment.slug}`}>
            <Card className="border hover:border-brand rounded-xl hover:shadow-md dark:sm:bg-neutral-800 p-4 transition-all duration-250 cursor-pointer h-full">
                <CardContent className='flex flex-col gap-3 px-0 w-full'>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block max-w-1/2 truncate">
                                {recruitment.categories[0] + (recruitment.categories.length > 1 ? ` +${recruitment.categories.length - 1}` : "")}
                            </span>
                            <h3 className="font-bold text-lg dark:text-gray-100" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {recruitment.name}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed truncate">{recruitment.fullName}</p>
                        </div>
                        {recruitment.status == 'upcoming' && <div className="flex rounded-full bg-yellow-100 dark:bg-amber-400/20 px-3 py-2 h-fit leading-none text-xs text-yellow-700 dark:text-amber-400">{recruitment.stageStatus}</div>}
                        {recruitment.status == 'ongoing' && <div className="flex rounded-full bg-green-100 dark:bg-emerald-400/20 px-3 py-2 h-fit leading-none text-xs text-green-700 dark:text-emerald-400">{recruitment.stageStatus}</div>}
                        {recruitment.status == 'completed' && <div className="flex rounded-full bg-gray-100 dark:bg-gray-400/40 px-3 py-2 h-fit leading-none text-xs text-gray-700 dark:text-gray-300">{recruitment.stageStatus}</div>}
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 grid grid-cols-6 gap-2">
                            {recruitment.qualifications.slice(0, 6).map(qualification => (
                                <Tooltip key={qualification.name}>
                                    <TooltipTrigger asChild>
                                        <span
                                            className="rounded-full bg-sky-100 dark:bg-blue-400/20 px-2 py-1 text-xs text-center text-sky-700 dark:text-blue-400 truncate cursor-default"
                                        >
                                            {qualification.shortForm || qualification.name}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>{qualification.name}</TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                        {recruitment.qualifications.length > 6 && (
                            <span className="text-sm text-sky-700 dark:text-blue-400 px-2 leading-relaxed">
                                +{recruitment.qualifications.length - 6}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed">
                            <Briefcase className="w-3 h-3" />
                            {
                                recruitment.maximumExperience ?
                                    `${recruitment.minimumExperience} - ${recruitment.maximumExperience} years` :
                                    `${recruitment.minimumExperience} years`
                            }
                        </p>
                        <div className="border-r border-r-muted-foreground h-4"></div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground font-semibold leading-relaxed">
                            {recruitment.vacancies} vacancies
                        </p>
                        {
                            (
                                isAfter(new Date(recruitment.registrationEndDate), new Date()) ||
                                isSameDay(new Date(recruitment.registrationEndDate), new Date())
                            ) &&
                            (
                                <>
                                    <div className="border-r border-r-muted-foreground h-4"></div>
                                    <div className="flex items-center gap-1">
                                        <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                            <Clock className="w-3 h-3" /> {format(parseISO(recruitment.registrationEndDate), "dd MMM, yyyy")}
                                        </span>
                                        <Tooltip open={open} onOpenChange={setOpen}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    ref={triggerRef}
                                                    type="button"
                                                    onClick={handleClick}
                                                    className="inline-flex items-center justify-center focus:outline-none"
                                                    aria-label="Registration Deadline information"
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
                    <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                            <MapPin className="w-3 h-3" />
                            {recruitment.location[0] + (recruitment.location.length > 1 ? ` +${recruitment.location.length - 1}` : "")}
                        </div>
                        <div className='flex items-center gap-1 text-xs font-medium group-hover:gap-2 group-hover:!text-brand transition-all'>
                            View Details <ArrowRight className="w-3 h-3 mt-1" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export function RecruitmentCardV2({ recruitment }) {

    const { lang } = useMessages();

    const triggerRef = useRef(null);

    const [open, setOpen] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    return (
        <Link className="group" href={`/${lang}/recruitments/${recruitment.slug}`}>
            <Card
                className="border hover:border-brand rounded-xl hover:shadow-md dark:sm:bg-neutral-800 p-4 transition-all duration-250 cursor-pointer h-full"
            >
                <CardContent className='flex flex-col gap-3 w-full px-0'>
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block max-w-1/2 truncate">
                                    {recruitment.categories[0] + (recruitment.categories.length > 1 ? ` +${recruitment.categories.length - 1}` : "")}
                                </span>
                                {recruitment.status == 'upcoming' && <div className="h-3 w-3 rounded-full bg-yellow-600"></div>}
                                {recruitment.status == 'ongoing' && <div className="h-3 w-3 rounded-full bg-green-700"></div>}
                                {recruitment.status == 'completed' && <div className="h-3 w-3 rounded-full bg-gray-400"></div>}
                            </div>
                            <h3 className="shrink-0 font-bold truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {recruitment.name}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed truncate">{recruitment.fullName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            {recruitment.qualifications.slice(0, 2).map(qualification => (
                                <Tooltip key={qualification.name}>
                                    <TooltipTrigger asChild>
                                        <span
                                            className="rounded-full bg-sky-100 dark:bg-blue-400/20 px-2 py-1 text-xs text-center text-sky-700 dark:text-blue-400 truncate cursor-default"
                                        >
                                            {qualification.shortForm || qualification.name}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>{qualification.name}</TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                        {recruitment.qualifications.length > 2 && (
                            <span className="text-sm text-sky-700 dark:text-blue-400 leading-relaxed">
                                +{recruitment.qualifications.length - 2}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed"><Briefcase className="w-3 h-3" />
                            {
                                recruitment.maximumExperience ?
                                    `${recruitment.minimumExperience} - ${recruitment.maximumExperience} years` :
                                    `${recruitment.minimumExperience} years`
                            }
                        </p>
                        <div className="border-r border-r-muted-foreground h-4"></div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground font-semibold leading-relaxed">
                            {recruitment.vacancies} vacancies
                        </p>
                        {
                            (
                                isAfter(new Date(recruitment.registrationEndDate), new Date()) ||
                                isSameDay(new Date(recruitment.registrationEndDate), new Date())
                            ) &&
                            (
                                <>
                                    <div className="border-r border-r-muted-foreground h-4"></div>
                                    <div className="flex items-center gap-1">
                                        <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                            <Clock className="w-3 h-3" /> {format(parseISO(recruitment.registrationEndDate), "dd MMM, yyyy")}
                                        </span>
                                        <Tooltip open={open} onOpenChange={setOpen}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    ref={triggerRef}
                                                    type="button"
                                                    onClick={handleClick}
                                                    className="inline-flex items-center justify-center focus:outline-none"
                                                    aria-label="Registration Deadline information"
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
                    <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                            <MapPin className="w-3 h-3" />
                            {recruitment.location[0] + (recruitment.location.length > 1 ? ` +${recruitment.location.length - 1}` : "")}
                        </div>
                        <div className='flex items-center gap-1 text-xs font-medium group-hover:gap-2 group-hover:!text-brand transition-all'>
                            View Details <ArrowRight className="w-3 h-3 mt-1" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
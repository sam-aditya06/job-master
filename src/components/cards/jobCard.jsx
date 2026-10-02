'use client';

import { useRef, useState } from "react";
import Link from "next/link";

import { ArrowRight, Briefcase, Info, MapPin, Wallet } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { formatAmount } from "@/lib/utils";

export function JobCardV1({ job }) {

    const triggerRef = useRef(null);

    const [open, setOpen] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    const upcomingRecruitments = job.recruitments.filter(rec => rec.status === 'upcoming');
    const ongoingRecruitments = job.recruitments.filter(rec => rec.status === 'ongoing');
    const completedRecruitments = job.recruitments.filter(rec => rec.status === 'completed');
    const isRecruitmentInactive = job.recruitments.filter(rec => rec.status !== 'inactive').length === 0;

    return (
        <Link className="group" href={`/jobs/${job.slug}`} >
            <Card className="border hover:border-brand rounded-xl hover:shadow-md dark:sm:bg-neutral-800 p-4 transition-all duration-250 cursor-pointer h-full">
                <CardTitle className='hidden'>{job.name}</CardTitle>
                <CardContent className='flex flex-col gap-3 px-0 w-full'>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block">
                                {job.categories[0] + (job.categories.length > 1 ? ` +${job.categories.length - 1}` : "")}
                            </span>
                            <h3 className="font-bold text-lg dark:text-gray-100" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {job.name}
                            </h3>
                            <div className="flex items-center gap-1">
                                <div className="border rounded-full h-6 w-6 p-[2px]">
                                    <div className="rounded-full flex justify-center items-center bg-white w-full h-full overflow-hidden">
                                        <img src={`${process.env.NEXT_PUBLIC_CDN_URL}/${job.orgLogo}`} />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-400 leading-none">{job.orgName}</p>
                            </div>
                        </div>
                        {
                            upcomingRecruitments.length > 0 &&
                            <div className="flex rounded-full bg-yellow-100 dark:bg-amber-400/20 px-3 py-2 h-fit leading-none text-xs text-yellow-700 dark:text-amber-400">
                                {upcomingRecruitments.length} Upcoming Recruitment
                            </div>
                        }
                        {
                            ongoingRecruitments.length > 0 &&
                            <div className="flex rounded-full bg-green-100 dark:bg-emerald-400/20 px-3 py-2 h-fit leading-none text-xs text-green-700 dark:text-emerald-400">
                                {ongoingRecruitments.length} Ongoing Recruitment{ongoingRecruitments.length > 1 ? 's' : ''}</div>
                        }
                        {
                            completedRecruitments.length > 0 &&
                            <div className="flex rounded-full bg-gray-100 dark:bg-gray-400/40 px-3 py-2 h-fit leading-none text-xs text-gray-700 dark:text-gray-300">
                                {completedRecruitments.length} Completed Recruitment
                            </div>
                        }
                        {
                            isRecruitmentInactive &&
                            <div className="flex rounded-full bg-red-100 dark:bg-red-400/20 px-3 py-2 h-fit leading-none text-xs text-red-700 dark:text-red-400">
                                No Active Recruitments
                            </div>
                        }
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 grid grid-cols-6 gap-2">
                            {job.qualifications.slice(0, 6).map(qualification => (
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
                        {job.qualifications.length > 6 && (
                            <span className="text-sm text-sky-700 dark:text-blue-400 px-2 leading-relaxed">
                                +{job.qualifications.length - 6}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <p className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            <Briefcase className="w-3 h-3" />
                            {
                                job.maximumExperience ?
                                    `${job.minimumExperience} - ${job.maximumExperience} years` :
                                    `${job.minimumExperience} years`
                            }
                        </p>
                        <div className="border-r border-r-muted-foreground h-4"></div>
                        <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            <Wallet className="w-3 h-3" />
                            ₹{job.minimumSalary.toLocaleString("en-IN")} – ₹{job.maximumSalary.toLocaleString("en-IN")}
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
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                            <MapPin className="w-3 h-3" />
                            {job.location[0] + (job.location.length > 1 ? ` +${job.location.length - 1}` : "")}
                        </div>
                        <div className='flex items-center gap-1 group-hover:gap-2 text-xs font-medium group-hover:!text-brand transition-all'>
                            View Profile <ArrowRight className="w-3 h-3 mt-1" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export function JobCardV2({ job }) {

    const triggerRef = useRef(null);

    const [open, setOpen] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    const upcomingRecruitments = job.recruitments.filter(rec => rec.status === 'upcoming');
    const ongoingRecruitments = job.recruitments.filter(rec => rec.status === 'ongoing');
    const completedRecruitments = job.recruitments.filter(rec => rec.status === 'completed');
    const isRecruitmentInactive = job.recruitments.filter(rec => rec.status !== 'inactive').length === 0;

    return (
        <Link className="group" href={`/jobs/${job.slug}`} >
            <Card className="border hover:border-brand rounded-xl hover:shadow-md dark:sm:bg-neutral-800 p-3 transition-all cursor-pointer h-full">
                <CardTitle className='hidden'>{job.name}</CardTitle>
                <CardContent className='flex flex-col gap-3 w-full px-0'>
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block">
                                    {job.categories[0] + (job.categories.length > 1 ? ` +${job.categories.length - 1}` : "")}
                                </span>
                                {upcomingRecruitments.length > 0 && <div className="h-3 w-3 rounded-full bg-yellow-600"></div>}
                                {ongoingRecruitments.length > 0 && <div className="h-3 w-3 rounded-full bg-green-700"></div>}
                                {completedRecruitments.length > 0 && <div className="h-3 w-3 rounded-full bg-gray-400"></div>}
                                {isRecruitmentInactive && <div className="h-3 w-3 rounded-full bg-red-400"></div>}
                            </div>
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
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            {job.qualifications.slice(0, 2).map(qualification => (
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
                        {job.qualifications.length > 2 && (
                            <span className="text-sm text-sky-700 dark:text-blue-400 leading-relaxed">
                                +{job.qualifications.length - 2}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed"><Briefcase className="w-3 h-3" />
                            {
                                job.maximumExperience ?
                                    `${job.minimumExperience} - ${job.maximumExperience} years` :
                                    `${job.minimumExperience} years`
                            }
                        </p>
                        <div className="border-r border-r-muted-foreground h-4"></div>
                        <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            <Wallet className="w-3 h-3" />
                            ₹{formatAmount(job.minimumSalary)} – ₹{formatAmount(job.maximumSalary)}
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
                            {job.location[0] + (job.location.length > 1 ? ` +${job.location.length - 1}` : "")}
                        </div>
                        <div className='flex items-center gap-1 text-xs font-medium text-emerald-500 dark:text-emerald-600 group-hover:gap-2 group-hover:!text-brand transition-all'>
                            View Profile <ArrowRight className="w-3.5 h-3.5 mt-1" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
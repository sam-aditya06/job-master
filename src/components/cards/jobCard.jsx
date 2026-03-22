import Link from "next/link";

import { ArrowRight, Briefcase, MapPin } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function JobCard({ job, page }) {
    const bgColor = page === 'home' ? 'dark:bg-slate-800' : 'dark:bg-neutral-900 dark:sm:bg-neutral-800';

    console.log({job});
    
    return (
        <Link className="group" href={`/jobs/${job.slug}`} >
            <Card className={`border hover:border-brand rounded-xl hover:shadow-md ${bgColor} p-5 transition-all cursor-pointer h-full`}>
                <CardTitle className='hidden'>{job.name} ({job.abbr})</CardTitle>
                <CardContent className='flex justify-between items-center gap-2 px-0'>
                    <div className='flex flex-col w-full'>
                        <div className="mb-3">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 block">
                                {job.sector}
                            </span>
                            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {job.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-3">
                                <img className="h-3 w-3" src={`${process.env.NEXT_PUBLIC_CDN_URL}/${job.orgLogo}`} />
                                <p className="text-xs text-muted-foreground leading-none">{job.orgName}</p>
                            </div>
                        </div>

                        {/* Salary highlight */}
                        <div className={`flex items-center gap-1.5 border bg-blue-50 dark:bg-sky-700 rounded-lg px-3 py-2 mb-4`}>
                            <span className={`text-brand dark:text-blue-100 text-sm font-semibold`}>
                                ₹{job.payScale.min.toLocaleString("en-IN")} – ₹{job.payScale.max.toLocaleString("en-IN")}
                            </span>
                            <span className={`text-brand dark:text-blue-100 text-xs ml-auto`}>
                                {job.payScale.abbr}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
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
                                {
                                    job.location.isAllIndia === true ?
                                        `All India${job.location.isStateWise === true ? ' (State-wise)' : job.location.isCircleWise === true ? ' (Circle-wise)' : ''}` :
                                        job.location.state
                                }
                            </div>
                            <div className='flex items-center gap-1 text-xs font-medium text-sky-500 dark:text-sky-600 group-hover:gap-2 group-hover:!text-brand transition-all'>
                                View Profile <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
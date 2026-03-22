import Link from "next/link";

import { ArrowRight, Briefcase, Clock, MapPin } from "lucide-react";
import { format, isAfter, isSameDay, parseISO } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";

export default function RecruitmentCard({ recruitment, color, icon, page }) {

    const bgColor = page === 'home' ? 'dark:bg-neutral-800' : 'dark:bg-neutral-900 dark:sm:bg-neutral-800';
    const arrowColor = color.split(' ')[2];
    const borderHoverColor = arrowColor.substring(5);

    return (
        <Link className="group" href={`/recruitments/${recruitment.slug}`}>
            <Card
                style={{ '--hover-color': `var(--color-${borderHoverColor})` }}
                className={`border rounded-xl p-5 group-hover:border-[var(--hover-color)] hover:shadow-md ${bgColor} h-full transition-all cursor-pointer`}
            >
                <CardContent className='flex flex-col px-0 w-full h-full'>
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 block">
                                {recruitment.sector}
                            </span>
                            <h3 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {recruitment.name}
                            </h3>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${color}`}>
                            {icon} {recruitment.stageStatus}
                        </span>
                    </div>
                    <div className="grow flex flex-col justify-between">
                        <p className="text-xs text-muted-foreground mb-2 leading-relaxed flex-1">{recruitment.fullName}</p>
                        <div className="flex items-center gap-3 mb-4">
                            <p className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed"><Briefcase className="w-3 h-3" />
                                {
                                    recruitment.experienceRange.minYears === recruitment.experienceRange.maxYears ?
                                        `${recruitment.experienceRange.minYears} years` :
                                        `${recruitment.experienceRange.minYears} - ${recruitment.experienceRange.maxYears} years`
                                }
                            </p>
                            <div className="border border-r-muted-foreground h-4"></div>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground leading-relaxed"><MapPin className="w-3 h-3" />
                                {
                                    recruitment.location.isAllIndia === true ?
                                        `All India${recruitment.location.isStateWise === true ? ' (State-wise)' : recruitment.location.isCircleWise === true ? ' (Circle-wise)' : ''}` :
                                        recruitment.location.state
                                }
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[#f0ece4]">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <div className="flex gap-1">
                                    <span className="font-semibold text-foreground">{recruitment.vacancies}</span> vacancies
                                </div>
                                {
                                    (
                                        isAfter(new Date(recruitment.registrationDeadline), new Date()) ||
                                        isSameDay(new Date(recruitment.registrationDeadline), new Date())
                                    ) &&
                                    (
                                        <span className="flex items-center gap-1 text-amber-600">
                                            <Clock className="w-3 h-3" /> {format(parseISO(recruitment.registrationDeadline), "MMM dd, yyyy")}
                                        </span>
                                    )}
                            </div>
                            <ArrowRight className={`w-4 h-4 ${arrowColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
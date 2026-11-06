'use client';

import { useEffect } from "react";
import { useParams } from "next/navigation";

import parse from 'html-react-parser';

import { useContentLoader } from "@/lib/context/paginateContext"
import { ContentSkeleton } from "@/components/skeletons";
import { PanelLeftOpen } from "lucide-react";
import Sidebar from "@/components/sidebars/sidebar";
import { useMessages } from "@/components/messageProvider";
import scrollToHash from "@/lib/hashScroll";
import { capitalize } from "@/lib/utils";

export default function Job({ content, recruitments = [] }) {
    const { isLoading, setIsLoading } = useContentLoader();
    const { messages } = useMessages();
    const { jobNavSlug } = useParams();

    useEffect(() => {
        if (!jobNavSlug)
            setIsLoading(false);
    }, [jobNavSlug]);

    useEffect(() => {
        scrollToHash()
    }, []);

    return (
        <>
            <div className="lg:hidden">
                <Sidebar screen={'mobile'} />
            </div>
            <div className="cms-content mt-14 lg:mt-0 sm:pr-3">
                <article>
                        {parse(content)}
                    <section>
                        <h2 id="recruitments">{messages.job.recruitments.heading}</h2>
                        <p>
                            {
                                recruitments.length > 0 ?
                                    messages.job.recruitments.haveRecruitmentsIntro :
                                    messages.job.recruitments.noRecruitmentsIntro
                            }
                        </p>
                        {
                            recruitments.map(rec => {
                                const textColor = rec.status === 'upcoming' ?
                                    "text-yellow-700 dark:text-amber-400" :
                                    rec.status === 'ongoing' ?
                                        "text-green-700 dark:text-emerald-400" :
                                        "text-gray-700 dark:text-gray-300"
                                return (
                                    < div key={rec._id} className="border rounded-md p-3" >
                                        <p className="font-bold text-xl">{rec.name}</p>
                                        <div className="flex flex-col gap-1 mt-3">
                                            <div className="flex items-center gap-1">
                                                <b>{messages.job.recruitments.statusLabel}:</b>
                                                <p className={textColor}>{capitalize(rec.status)}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start md:gap-1">
                                                <p className="min-w-fit"><b>{messages.job.recruitments.currentStatusLabel}:</b></p>
                                                <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: rec.currentStatus }} />
                                            </div>
                                            {
                                                rec.whatsNext &&
                                                <div className="flex flex-col sm:flex-row items-start md:gap-1">
                                                    <p className="min-w-fit"><b>{messages.job.recruitments.whatsNextLabel}:</b></p>
                                                    <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: rec.whatsNext }} />
                                                </div>
                                            }
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3">
                                            <a href={rec.overviewLink} target="_blank" className="link-btn !w-full">View Overview</a>
                                            <a href={rec.currentStageLink} target="_blank" className="link-btn !w-full">View Current Stage</a>
                                            <a href={rec.upcomingStageLink} target="_blank" className="link-btn !w-full">View Next Stage</a>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </section>
                </article>
            </div>
        </>
    )
}
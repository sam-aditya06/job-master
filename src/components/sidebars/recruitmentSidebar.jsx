'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Check, Clock, Hourglass } from "lucide-react";

import { RecruitmentSidebarSkeleton } from "../skeletons";
import { useMessages } from "../messageProvider";

export default function RecruitmentSidebar() {

    const { lang, recruitment } = useParams();
    const { messages } = useMessages();
    const router = useRouter();

    const [stages, setStages] = useState(undefined);

    useEffect(() => {
        const fetchSidebar = async () => {
            try {
                const res = await fetch(`/api/sidebar/${lang}/recruitments/${recruitment}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        setStages(null);
                        return;
                    }

                    throw new Error(`Failed to fetch sidebar: ${res.status}`);
                }

                const { stages } = await res.json();
                if (stages)
                    setStages(stages);
            } catch (error) {
                console.error("Failed to fetch sidebar:", error);
            }
        };

        fetchSidebar();
    }, []);

    const handleSelect = (slug) => {
        slug ?
            router.push(`/${lang}/recruitments/${recruitment}#${slug}`) :
            router.push(`/${lang}/recruitments/${recruitment}#overview`)
    }

    return (
        <>
            {
                stages ?
                    <div className="grow flex flex-col gap-4 mt-12 lg:mt-0 h-full p-2 overflow-y-auto">
                        <p className="text-lg text-muted-foreground">{messages.recruitment.heading}</p>
                        <div className="flex items-center gap-2">
                            <div className="flex justify-center items-center h-4 w-4 border border-brand rounded-full bg-brand p-[0.1rem]">
                                <Check className="stroke-white stroke-3" />
                            </div>
                            <Link href={`/${lang}/recruitments/${recruitment}#overview`} className="flex text-sm font-semibold hover:text-brand cursor-pointer" onClick={() => handleSelect(undefined)}>
                                {messages.recruitment.overview}
                            </Link>
                        </div>
                        {
                            stages.map((stage) => (
                                <div key={stage.slug} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        {
                                            stage.status === 'upcoming' &&
                                            <div className="flex gap-2 justify-center items-center h-4 w-4 border border-brand rounded-full p-[0.2rem]">
                                                <Hourglass className="stroke-brand" />
                                            </div>
                                        }
                                        {
                                            stage.status === 'ongoing' &&
                                            <div className="flex justify-center items-center h-4 w-4 border border-brand rounded-full p-[0.1rem]">
                                                <Clock className="rounded-full w-full h-full stroke-brand" />
                                            </div>
                                        }
                                        {
                                            stage.status === 'completed' &&
                                            <div className="flex justify-center items-center h-4 w-4 border border-brand rounded-full bg-brand p-[0.1rem]">
                                                <Check className="stroke-white stroke-3" />
                                            </div>
                                        }
                                        <Link href={`/${lang}/recruitments/${recruitment}#${stage.slug}`} className="text-sm font-semibold hover:text-brand cursor-pointer" onClick={() => handleSelect(stage.slug)}>
                                            {stage.name}
                                        </Link>
                                    </div>
                                    {
                                        stage.linkHeadings?.length > 0 &&
                                        <div className="flex flex-col gap-2 pl-10">
                                            {
                                                stage.linkHeadings?.map(lh => (
                                                    <Link key={lh.slug} href={`/${lang}/recruitments/${recruitment}#${lh.slug}`} className="text-sm hover:text-brand cursor-pointer">
                                                        {lh.headingName}
                                                    </Link>
                                                ))
                                            }
                                        </div>
                                    }
                                </div>
                            ))
                        }

                    </div> :
                    <RecruitmentSidebarSkeleton />
            }
        </>
    )
}

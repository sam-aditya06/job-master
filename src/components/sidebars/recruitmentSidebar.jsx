'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Check, Clock, Hourglass } from "lucide-react";

import { useContentLoader } from "@/lib/context/paginateContext";
import { RecruitmentSidebarSkeleton } from "../skeletons";
import { useMessages } from "../messageProvider";

export default function RecruitmentSidebar({ screen, handleSheetClose }) {

    const { lang, recruitment, stage } = useParams();
    const { messages } = useMessages();
    const router = useRouter();

    const { setIsLoading } = useContentLoader();

    const [stages, setStages] = useState(undefined);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        const fetchSidebar = async () => {
            try {
                const res = await fetch(`/api/sidebar/${lang}/recruitments/${recruitment}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        setSidebarData(null);
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

    useEffect(() => {
        stage && setSelected(stage);
    }, [stage]);

    const handleSelect = (slug) => {
        screen === 'mobile' && handleSheetClose();
        setIsLoading(true);
        setSelected(slug);
        slug ?
            router.replace(`/${lang}/recruitments/${recruitment}/${slug}`) :
            router.replace(`/${lang}/recruitments/${recruitment}`);

    }

    return (
        <>
            {
                stages ?
                    <div className="grow flex flex-col gap-5 mt-12 lg:mt-0 h-full p-2 overflow-y-auto">
                        <div className={`flex justify-center border rounded-md mt-5 pl-2 py-1 w-full cursor-pointer${!selected ? ' bg-brand text-white' : ' hover:bg-brand hover:text-white'}`} onClick={() => handleSelect(undefined)}>
                            {messages.recruitment.overview}
                        </div>
                        <p className="text-muted-foreground">{messages.recruitment.timeline}</p>
                        <div className="flex flex-col">
                            {
                                stages.map((stage, i) => (
                                    <div key={stage.slug} className="flex flex-col text-sm">
                                        {
                                            stage.status === 'upcoming' &&

                                            <div className="flex gap-2 items-center">
                                                <div className="flex gap-2 justify-center items-center h-5 w-5 border border-brand rounded-full p-[0.2rem]">
                                                    <Hourglass size={15} className="stroke-brand" />
                                                </div>
                                                <p className={`${selected === stage.slug ? 'text-brand font-bold' : 'hover:text-brand hover:font-bold'} cursor-pointer`} href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                                    {stage.name}
                                                </p>
                                            </div>
                                        }
                                        {
                                            stage.status === 'ongoing' &&

                                            <div className="flex gap-2 items-center">
                                                <div className="flex justify-center items-center h-5 w-5 border border-brand rounded-full p-[0.1rem]">
                                                    <Clock className="rounded-full w-full h-full stroke-brand" />
                                                </div>
                                                <p className={`${selected === stage.slug ? 'text-brand font-bold' : 'hover:text-brand hover:font-bold'} cursor-pointer`} href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                                    {stage.name}
                                                </p>
                                            </div>
                                        }
                                        {
                                            stage.status === 'completed' &&
                                            <div className="flex gap-2 items-center">
                                                <div className="flex justify-center items-center h-5 w-5 border border-brand rounded-full bg-brand p-[0.1rem]">
                                                    <Check size={18} className="stroke-white stroke-3" />
                                                </div>
                                                <p className={`${selected === stage.slug ? 'text-brand font-bold' : 'hover:text-brand hover:font-bold'} cursor-pointer`} href={`/recruitments/${recruitment}?stage=${stage.slug}`} onClick={() => handleSelect(stage.slug)}>
                                                    {stage.name}
                                                </p>
                                            </div>
                                        }
                                        {i !== stages.length - 1 && stages[i + 1].status === 'upcoming' && <div className="border border-dashed border-brand ml-[0.6rem] w-0 h-6"></div>}
                                        {i !== stages.length - 1 && stages[i + 1].status === 'ongoing' && <div className="border border-brand ml-[0.6rem] w-0 h-6"></div>}
                                        {i !== stages.length - 1 && stages[i + 1].status === 'completed' && <div className="border border-brand ml-[0.6rem] w-0 h-6"></div>}
                                    </div>
                                ))
                            }
                        </div>
                    </div> :
                    <RecruitmentSidebarSkeleton />
            }
        </>
    )
}

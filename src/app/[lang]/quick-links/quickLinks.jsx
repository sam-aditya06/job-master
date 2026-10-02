'use client';

import Link from "next/link";

import { useMessages } from "@/components/messageProvider";

export default function QuickLinks({ quickLinks }) {

    const { recruitments, latestAdmitCards, latestResults, latestScorecards } = quickLinks;

    const { tenthPassRecruitments, twelfthPassRecruitments, graduateRecruitments } = recruitments;

    const { lang, messages } = useMessages();

    return (
        <div className="flex flex-col gap-10">
            <section>
                <h1 className="text-4xl text-brand">{messages.quickLinks.heading}</h1>
                <p className="text-justify mt-5">{messages.quickLinks.description}</p>
            </section>
            {
                tenthPassRecruitments?.length > 0 &&
                <section>
                    <h2 className="text-lg font-bold">{messages.quickLinks.tenthPassRecruitmentHeading}</h2>
                    <ul className="flex-flex-col gap-1 mt-2 pl-6 !list-disc">
                        {
                            tenthPassRecruitments.map(rec => (
                                <li key={rec.slug}>
                                    <Link className="text-brand underline" href={`/${lang}/recruitments/${rec.slug}`} target="_blank">
                                        {rec.name}
                                    </Link>
                                    {" " + `(${rec.stageStatus})`}
                                </li>
                            ))
                        }
                    </ul>
                </section>
            }
            {
                twelfthPassRecruitments?.length > 0 &&
                <section>
                    <h2 className="text-lg font-bold">{messages.quickLinks.twelfthPassRecruitmentHeading}</h2>
                    <ul className="flex-flex-col gap-1 mt-2 pl-6 !list-disc">
                        {
                            twelfthPassRecruitments.map(rec => (
                                <li key={rec.slug}>
                                    <Link className="text-brand underline" href={`/${lang}/recruitments/${rec.slug}`} target="_blank">
                                        {rec.name}
                                    </Link>
                                    {" " + `(${rec.stageStatus})`}
                                </li>
                            ))
                        }
                    </ul>
                </section>
            }
            {
                graduateRecruitments?.length > 0 &&
                <section>
                    <h2 className="text-lg font-bold">{messages.quickLinks.graduateRecruitmentHeading}</h2>
                    <ul className="flex-flex-col gap-1 mt-2 pl-6 !list-disc">
                        {
                            graduateRecruitments.map(rec => (
                                <li key={rec.slug}>
                                    <Link className="text-brand underline" href={`/${lang}/recruitments/${rec.slug}`} target="_blank">
                                        {rec.name}
                                    </Link>
                                    {" " + `(${rec.stageStatus})`}
                                </li>
                            ))
                        }
                    </ul>
                </section>
            }
            <section>
                <h2 className="text-lg font-bold">{messages.quickLinks.admitCardHeading}</h2>
                {
                    latestAdmitCards?.length > 0 ?
                        <ul className="flex-flex-col gap-1 mt-2 pl-6 !list-disc">
                            {
                                latestAdmitCards.map(rec => (
                                    <li key={rec.slug}>
                                        <Link className="text-brand underline" href={`/${lang}/recruitments/${rec.slug}/${rec.stageSlug}`} target="_blank">
                                            {rec.stageName}
                                        </Link>
                                        {" " + `(${rec.recName})`}
                                    </li>
                                ))
                            }
                        </ul> :
                        <p className="ml-2 mt-2 text-muted-foreground">No admit cards found</p>
                }
            </section>
            <section>
                <h2 className="text-lg font-bold">{messages.quickLinks.resultHeading}</h2>
                {
                    latestResults?.length > 0 ?
                        <ul className="flex-flex-col gap-1 mt-2 pl-6 !list-disc">
                            {
                                latestResults.map(rec => (
                                    <li key={rec.slug}>
                                        <Link className="text-brand underline" href={`/${lang}/recruitments/${rec.slug}/${rec.stageSlug}`} target="_blank">
                                            {rec.stageName}
                                        </Link>
                                        {" " + `(${rec.recName})`}
                                    </li>
                                ))
                            }
                        </ul> :
                        <p className="ml-2 mt-2 text-muted-foreground">No results found</p>
                }
            </section>
            <section>
                <h2 className="text-lg font-bold">{messages.quickLinks.scorecardHeading}</h2>
                {
                    latestScorecards?.length > 0 ?
                        <ul className="flex-flex-col gap-1 mt-2 pl-6 !list-disc">
                            {
                                latestScorecards.map(rec => (
                                    <li key={rec.slug}>
                                        <Link className="text-brand underline" href={`/${lang}/recruitments/${rec.slug}/${rec.stageSlug}`} target="_blank">
                                            {rec.stageName}
                                        </Link>
                                        {" " + `(${rec.recName})`}
                                    </li>
                                ))
                            }
                        </ul> :
                        <p className="ml-2 mt-2 text-muted-foreground">No scorecards found</p>
                }
            </section>
        </div>
    )
}
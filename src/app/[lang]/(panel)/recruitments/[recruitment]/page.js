import { notFound } from "next/navigation";

import { getRecruitmentContent, getRecruitmentMetadata } from "@/lib/serverUtils";

import RecruitmentOverview from "./overview";

export const generateMetadata = async ({ params }) => {
    const { lang, recruitment, year } = await params;

    const recruitmentDetails = await getRecruitmentMetadata(lang, recruitment, year);

    if (!recruitmentDetails)
        notFound();

    const { title, description } = recruitmentDetails;
    return {
        title,
        description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/${lang}/recruitments/${recruitment}`
        },
        robots: { index: true, follow: true }
    }
}


export default async function RecruitmentPage({ params }) {
    const { lang, recruitment } = await params;
    const content = await getRecruitmentContent(lang, recruitment);

    if (content)
        return (
            <RecruitmentOverview content={content} />
        )
    else
        notFound();
}
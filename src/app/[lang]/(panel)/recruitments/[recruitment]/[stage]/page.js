import { notFound } from "next/navigation";

import { getRecruitmentMetadata, getRecruitmentContent, getRecruitmentJsonLd } from "@/lib/serverUtils";
import getStageDescription from "@/lib/getStageDescription";

import RecruitmentStage from "./stage";

export const generateMetadata = async ({ params }) => {
    const { lang, recruitment, stage } = await params;

    const recruitmentDetails = await getRecruitmentMetadata(lang, recruitment, stage);
    if (!recruitmentDetails)
        return {};

    const { title, description } = recruitmentDetails;

    return {
        title,
        description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/${lang}/recruitments/${recruitment}/${stage}`
        },
        robots: { index: true, follow: true }
    }
}

export default async function RecruitmentPage({ params }) {
    const { lang, recruitment, stage } = await params;
    const [jsonLd, content] = await Promise.all([
        stage === 'notification' ? getRecruitmentJsonLd(lang, recruitment) : null,
        getRecruitmentContent(lang, recruitment, stage)
    ])

    if (content)
        return (
            <>
                {
                    jsonLd &&
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                }
                <RecruitmentStage content={content} />
            </>
        );
    else
        notFound();
}
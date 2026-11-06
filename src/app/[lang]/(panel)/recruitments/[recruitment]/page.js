import { notFound } from "next/navigation";

import { getRecruitmentContent, getRecruitmentJsonLd, getRecruitmentMetadata } from "@/lib/serverUtils";

import Recruitment from "./recruitment";

export const generateMetadata = async ({ params }) => {
    const { lang, recruitment, year } = await params;

    const recruitmentDetails = await getRecruitmentMetadata(lang, recruitment, year);

    if (!recruitmentDetails)
        return {
            title: 'Recruitment not found',
            robots: { index: false, follow: false }
        };

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
    const [jsonLd, content] = await Promise.all([
        getRecruitmentJsonLd(lang, recruitment),
        getRecruitmentContent(lang, recruitment)
    ]);

    if (content)
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <Recruitment content={content} />
            </>
        )
    else
        notFound();
}
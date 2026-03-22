import { getOrgDetails, getRecruitmentBodyDetails } from "@/lib/serverUtils";
import RecruitmentBody from "./recruitmentBody";
import { notFound } from "next/navigation";

export default async function RecruitmentBodyPage({ params }) {
    const { rBody } = await params;
    const recruitmentBodyDetails = await getRecruitmentBodyDetails(rBody);

    // await new Promise(resolve => setTimeout(resolve, 12000));
    
    if (recruitmentBodyDetails)
        return <RecruitmentBody recruitmentBodyDetails={recruitmentBodyDetails} />
    else
        notFound();
}
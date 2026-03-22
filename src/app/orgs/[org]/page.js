import { getOrgDetails } from "@/lib/serverUtils";
import Org from "./org";
import { notFound } from "next/navigation";

export default async function OrgPage({ params }) {
    const { org } = await params;
    const orgDetails = await getOrgDetails(org);

    await new Promise(resolve => setTimeout(resolve, 12000));

    if (orgDetails)
        return <Org orgDetails={orgDetails} />
    else
        notFound();
}
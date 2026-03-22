
import { Suspense } from "react";
import DesktopSidebar from "./sidebars/desktopSidebar";
import MobileSidebar from "./sidebars/mobileSidebar";
import { getRecruitmentSidebarDetails, validateRecruitmentRoute } from "@/lib/serverUtils";

export default async function SidebarWrapper({ screen, params }) {
    const { recruitment } = await params;
    const isValid = validateRecruitmentRoute()
    const sidebarDetails = await getRecruitmentSidebarDetails(recruitment);
    return (
        <Suspense fallback={<p>Loading...</p>}>
            {screen === 'desktop' ? <DesktopSidebar details={sidebarDetails} /> : <MobileSidebar details={sidebarDetails} />}
        </Suspense>
    );
}
import { getJobsFilters, getJobSidebarFields, getRecruitmentsFilters, getRecruitmentSidebarDetails } from "@/lib/serverUtils";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { slug } = await params;

    const { searchParams } = new URL(req.url);

    const sp = Object.fromEntries(searchParams.entries());

    const lang = slug[0];
    let data = {};
    if (slug[1] === 'jobs') {
        if (slug.length > 2) {
            data = await getJobSidebarFields(slug[2]);
        }
        else {
            data = await getJobsFilters({ lang, sp });
        }
    }
    else if (slug[1] === 'recruitments') {
        if (slug.length > 2) {
            data = await getRecruitmentSidebarDetails(lang, slug[2], slug[3]);
        }
        else {
            data = await getRecruitmentsFilters({ lang, sp });
        }
    }
    if (data)
        return NextResponse.json(data, { status: 200 });
    else
        return new NextResponse(null, { status: 404 });
}
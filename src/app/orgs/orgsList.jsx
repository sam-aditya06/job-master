'use client';

import { OrgCard } from "@/components/cards/orgCard";

export default function OrgsList({ orgs = [] }) {

    return (
        <div className="flex flex-col gap-5 mt-5">
            <h2 className="text-2xl font-bold">Results ({orgs.length})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {
                    orgs?.map(org => (
                        <OrgCard key={org._id} org={org} />
                    ))
                }
            </div>
        </div>
    )
}
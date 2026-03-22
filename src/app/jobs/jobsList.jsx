'use client';

import JobCard from "@/components/cards/jobCard";

export default function JobsList({ jobs = [] }) {

    return (
        <div className="flex flex-col gap-5 mt-5">
            <h2 className="text-2xl font-bold">Results ({jobs.length})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {
                    jobs?.map(job => (
                        <JobCard key={job._id} job={job} />
                    ))
                }
            </div>
        </div>
    )
}
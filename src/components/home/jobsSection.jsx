"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import JobCard from "@/components/cards/jobCard";
import { slugify } from "@/lib/utils";

const categories = ["All", "Central Govt", "State Govt", "PSU", "Banking", "Defence", "Railways", "Judiciary", "Police"];

export default function JobsSection({ popularJobs = [] }) {
  const [displayedJobs, setDisplayedJobs] = useState(popularJobs);
  const [currentCategory, setCurrentCategory] = useState('All');

  useEffect(() => {
    currentCategory === 'All' ?
      setDisplayedJobs(popularJobs.sort((a, b) => b.popularityScore - a.popularityScore)) :
      setDisplayedJobs(popularJobs.filter(job => job.sector === slugify(currentCategory)).sort((a, b) => b.popularityScore - a.popularityScore));
  }, [currentCategory]);

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-brand" style={{ fontFamily: "'Syne', sans-serif" }}>
              Popular Jobs
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Detailed breakdowns of roles, responsibilities, pay scales, perks & career growth — before you prepare.
            </p>
          </div>
          <Link href="/jobs" className="link-btn group">
            All Job Profiles <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category filter pills */}
        {/* <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors font-medium ${cat === currentCategory
                ? "bg-brand text-white"
                : "border hover:border-black dark:hover:border-white bg-white dark:bg-transparent text-black dark:text-white"
                }`}
                onClick={() => setCurrentCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div> */}

        {/* Job profile cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedJobs.map((job) => (
            <JobCard key={job.slug} job={job} page={'home'} />
          ))}
        </div>
      </div>
    </section>
  );
}
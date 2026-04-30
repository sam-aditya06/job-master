"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import RecruitmentCard from "@/components/cards/recruitmentCard";

import statusConfig from "@/lib/statusConfig";



export default function RecruitmentsSection({ recentRecruitments = [] }) {

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold text-brand" style={{ fontFamily: "'Syne', sans-serif" }}>
              Ongoing Recruitments
            </h2>
            <p className="text-muted-foreground text-sm">
              Exam schedules, eligibility criteria, application links, admit cards & results — all in one place.
            </p>
          </div>
          <Link href="/recruitments" className="link-btn group">
            All Recruitments <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Recruitment cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRecruitments.map((r) => {
            const matchedKey = Object.keys(statusConfig).find(status => r.stageStatus.includes(status));
            const { icon } = statusConfig[matchedKey] ?? {};
            return (
              <RecruitmentCard key={r._id} recruitment={r} icon={icon} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
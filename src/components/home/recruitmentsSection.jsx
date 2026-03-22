"use client";

import { Bell, Calendar, FileText, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RecruitmentCard from "../cards/recruitmentCard";
import { useEffect, useState } from "react";
import { slugify } from "@/lib/utils";
import statusConfig from "@/lib/statusConfig";



const categories = ["All", "Central Govt", "State Govt", "PSU", "Banking", "Defence", "Railways", "Judiciary", "Police"];

export default function RecruitmentsSection({ recentRecruitments = [] }) {
  const [displayedRecruitments, setDisplayedRecruitments] = useState(recentRecruitments);
  const [currentCategory, setCurrentCategory] = useState('All');

  console.log({keys: Object.keys(statusConfig)});

  useEffect(() => {
    currentCategory === 'All' ?
      setDisplayedRecruitments(recentRecruitments.sort((a, b) => new Date(b.date) - new Date(a.date))) :
      setDisplayedRecruitments(recentRecruitments.filter(rec => rec.sector === slugify(currentCategory)).sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [currentCategory]);

  return (
    <section className="py-16 bg-white dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col items-center sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-brand" style={{ fontFamily: "'Syne', sans-serif" }}>
              Recent Recruitments
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Exam schedules, eligibility criteria, application links, admit cards & results — all in one place.
            </p>
          </div>
          <Link href="/recruitments">
            <Button variant="outline" className="shrink-0 border text-white !bg-brand dark:hover:bg-brand hover:text-white cursor-pointer">
              All Recruitments <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors font-medium cursor-pointer ${cat === currentCategory
                ? "bg-brand text-white"
                : "border hover:border-black dark:hover:border-white bg-white dark:bg-transparent text-black dark:text-white"
                }`}
              onClick={() => setCurrentCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recruitment cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRecruitments.map((r) => {
            const key = Object.keys(statusConfig).filter(status => r.stageStatus.includes(status));
            const { color, icon } = statusConfig[key];
            return (
              <RecruitmentCard key={r._id} recruitment={r} color={color} icon={icon} page={'home'} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
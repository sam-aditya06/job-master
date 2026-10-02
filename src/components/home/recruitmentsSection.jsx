"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { RecruitmentCardV2 } from "@/components/cards/recruitmentCard";
import { useMessages } from "../messageProvider";

export default function RecruitmentsSection({ recentRecruitments = [] }) {

  const { lang, messages } = useMessages();

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-brand" style={{ fontFamily: "'Syne', sans-serif" }}>
              {messages.home.ongoingRecruitments.heading}
            </h2>
            <p className="text-muted-foreground text-sm">
              {messages.home.ongoingRecruitments.intro}
            </p>
          </div>
          <Link href={`/${lang}/recruitments`} className="max-sm:!hidden flex items-center gap-1 border border-brand rounded-md hover:bg-brand px-3 py-2 text-sm text-brand hover:text-white leading-none transition duration-150">
            {messages.home.ongoingRecruitments.ctaBtnTxt}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {
            recentRecruitments.map((r) => (
              <RecruitmentCardV2 key={r._id} recruitment={r} />
            ))
          }
        </div>
        <Link href={`/${lang}/recruitments`} className="sm:!hidden flex items-center gap-1 border border-brand rounded-md hover:bg-brand mt-5 mx-auto px-3 py-2 w-fit text-sm text-brand hover:text-white leading-none transition duration-150">
          {messages.home.ongoingRecruitments.ctaBtnTxt}
        </Link>
      </div>
    </section>
  );
}
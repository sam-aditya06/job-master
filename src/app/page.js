import { getJobs, getPopularJobs, getOngoingRecruitments } from "@/lib/serverUtils";
import Home from "./home";
import HeroSection from "@/components/home/heroSection";
import { Suspense } from "react";
import RecruitmentsSection from "@/components/home/recruitmentsSection";
import JobsSection from "@/components/home/jobsSection";
import { HomeSectionSkeleton } from "@/components/skeletons";

export default function HomePage() {

  return (
    <div className="flex flex-col gap-10 bg-white dark:bg-neutral-900 pb-10">
      <HeroSection />
      <Suspense fallback={<HomeSectionSkeleton type='recruitment' />}>
        <RecruitmentsSectionWrapper />
      </Suspense>
      <Suspense fallback={<HomeSectionSkeleton type='job' />}>
        <JobsSectionWrapper />
      </Suspense>
    </div>
  );
}

async function RecruitmentsSectionWrapper() {
  const recentRecruitments = await getOngoingRecruitments('home');

  return (
    <RecruitmentsSection recentRecruitments={recentRecruitments} />
  )

}

async function JobsSectionWrapper() {
  const popularJobs = await getPopularJobs();
  return (
    <JobsSection popularJobs={popularJobs} />
  )

}

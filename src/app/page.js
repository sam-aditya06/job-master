import { getPopularJobs, getOngoingRecruitments } from "@/lib/serverUtils";
import HeroSection from "@/components/home/heroSection";
import { Suspense } from "react";
import RecruitmentsSection from "@/components/home/recruitmentsSection";
import JobsSection from "@/components/home/jobsSection";
import { HomeSectionSkeleton } from "@/components/skeletons";

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_NAME} | Government Jobs & Recruitment Tracker`,
  description: `Discover government jobs and track recruitment cycles across banking, PSU, defence, railways, judiciary, and more. Find eligibility, responsibilities, and stay updated on every stage of every recruitment.`,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_DOMAIN}`
  },
  // placeholder for when you have an og image
  // openGraph: {
  //   images: [`${process.env.NEXT_PUBLIC_DOMAIN}/og-image.png`]
  // }
}

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

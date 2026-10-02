import { getPopularJobs, getOngoingRecruitments } from "@/lib/serverUtils";
import HeroSection from "@/components/home/heroSection";
import { Suspense } from "react";
import RecruitmentsSection from "@/components/home/recruitmentsSection";
import JobsSection from "@/components/home/jobsSection";
import { HomeSectionSkeleton } from "@/components/skeletons";

export async function generateMetadata({ params }) {
  const { lang } = await params;

  const title = {
    en: `${process.env.NEXT_PUBLIC_NAME} | Government Jobs & Recruitment Tracker`
  }[lang];

  const description = {
    en: `Discover government jobs and track recruitment cycles across banking, PSU, defence, railways, judiciary, and more. Find eligibility, responsibilities, and stay updated on every stage of every recruitment.`
  }[lang];

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/${lang}`
    }
  }

}

export default function HomePage({ params }) {

  return (
    <div className="flex flex-col gap-10 bg-white dark:bg-neutral-900 pb-10">
      <HeroSection />
      <Suspense fallback={<HomeSectionSkeleton type={'recruitment'} />}>
        <RecruitmentsSectionWrapper params={params} />
      </Suspense>
      <Suspense fallback={<HomeSectionSkeleton type={'job'} />}>
        <JobsSectionWrapper params={params} />
      </Suspense>
    </div>
  );
}

async function RecruitmentsSectionWrapper({ params }) {
  await new Promise(resolve => setTimeout(resolve, 4000));
  const { lang } = await params;
  const recentRecruitments = await getOngoingRecruitments({ lang });

  return (
    <RecruitmentsSection recentRecruitments={recentRecruitments} />
  )

}

async function JobsSectionWrapper({ params }) {
  await new Promise(resolve => setTimeout(resolve, 4000));
  const { lang } = await params;
  const popularJobs = await getPopularJobs({ lang });
  return (
    <JobsSection popularJobs={popularJobs} />
  )

}

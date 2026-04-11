import { getJobs, getPopularJobs, getOngoingRecruitments } from "@/lib/serverUtils";
import Home from "./home";
import HeroSection from "@/components/home/heroSection";
import { Suspense } from "react";
import RecruitmentsSection from "@/components/home/recruitmentsSection";
import JobsSection from "@/components/home/jobsSection";

export default function HomePage() {

  return (
    <>
      <HeroSection />
      <Suspense fallback={<p>Loading...</p>}>
        <RecruitmentsSectionWrapper />
      </Suspense>
      <Suspense fallback={<p>Loading...</p>}>
        <JobsSectionWrapper />
      </Suspense>
    </>
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

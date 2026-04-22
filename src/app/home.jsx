import HeroSection from "@/components/home/heroSection";
import JobsSection from "@/components/home/jobsSection";
import RecruitmentsSection from "@/components/home/recruitmentsSection";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Home({ jobs, recentRecruitments }) {

    return (
        <div className="flex flex-col gap-20">
            <HeroSection />
            <RecruitmentsSection recentRecruitments={recentRecruitments} />
            <JobsSection jobs={jobs} />
            {/* <section className="grid grid-cols-2 bg-orange-100 h-[calc(100dvh-3.5rem)]">
                <div className="flex flex-col justify-center gap-5 px-5">
                    <p className="text-5xl font-semibold">Thousands of job awaits you</p>
                    <Link href='/jobs' className='rounded-md bg-foreground px-3 py-2 w-fit text-white'>Start Searching</Link>
                </div>
                <div>Home</div>
            </section>
            <section className="mx-auto py-10 lg:w-3xl">
                <h2 className="text-2xl text-brand">Job Categories</h2>
                <div className="flex flex-col gap-10 mt-5">
                    <div className="grid grid-cols-4 gap-2">
                        <Card className='py-2'>
                            <CardContent className='flex flex-col justify-between items-center p-2 h-24'>
                                <p>Govt Jobs</p>
                                <Link className="border border-brand rounded-md hover:bg-brand px-2 py-1 text-brand hover:text-white" href='/jobs?sector=govt'>Explore</Link>
                            </CardContent>
                        </Card>
                        <Card className='py-2'>
                            <CardContent className='flex flex-col justify-between items-center p-2 h-24'>
                                <p>Banking Jobs</p>
                                <Link className="border border-brand rounded-md hover:bg-brand px-2 py-1 text-brand hover:text-white" href='/jobs?sector=banking'>Explore</Link>
                            </CardContent>
                        </Card>
                        <Card className='py-2'>
                            <CardContent className='flex flex-col justify-between items-center p-2 h-24'>
                                <p>PSU Jobs</p>
                                <Link className="border border-brand rounded-md hover:bg-brand px-2 py-1 text-brand hover:text-white" href='/jobs?sector=psu'>Explore</Link>
                            </CardContent>
                        </Card>
                        <Card className='py-2'>
                            <CardContent className='flex flex-col justify-between items-center p-2 h-24'>
                                <p>Defence Jobs</p>
                                <Link className="border border-brand rounded-md hover:bg-brand px-2 py-1 text-brand hover:text-white" href='/jobs?sector=defence'>Explore</Link>
                            </CardContent>
                        </Card>
                    </div>
                    <Link className="rounded-md bg-brand hover:bg-brand/70 px-3 py-2 mx-auto w-fit text-white" href='/jobs'>See All Jobs</Link>
                </div>
            </section>
            <section className="mx-auto py-10 lg:w-3xl">
                <h2 className="text-2xl text-brand">Recruitment Categories</h2>
                <div className="flex flex-col gap-10 mt-5">
                    <div className="grid grid-cols-4 gap-2">
                        <Card className='py-2'>
                            <CardContent className='flex flex-col justify-between items-center p-2 h-24'>
                                <p>Govt Recruitments</p>
                                <Link className="border border-brand rounded-md hover:bg-brand px-2 py-1 text-brand hover:text-white" href='/recruitments?sector=govt'>Explore</Link>
                            </CardContent>
                        </Card>
                        <Card className='py-2'>
                            <CardContent className='flex flex-col justify-between items-center p-2 h-24'>
                                <p>Banking Recruitments</p>
                                <Link className="border border-brand rounded-md hover:bg-brand px-2 py-1 text-brand hover:text-white" href='/recruitments?sector=banking'>Explore</Link>
                            </CardContent>
                        </Card>
                        <Card className='py-2'>
                            <CardContent className='flex flex-col justify-between items-center p-2 h-24'>
                                <p>PSU Recruitments</p>
                                <Link className="border border-brand rounded-md hover:bg-brand px-2 py-1 text-brand hover:text-white" href='/recruitments?sector=psu'>Explore</Link>
                            </CardContent>
                        </Card>
                        <Card className='py-2'>
                            <CardContent className='flex flex-col justify-between items-center p-2 h-24'>
                                <p>Defence Recruitments</p>
                                <Link className="border border-brand rounded-md hover:bg-brand px-2 py-1 text-brand hover:text-white" href='/recruitments?sector=defence'>Explore</Link>
                            </CardContent>
                        </Card>
                    </div>
                    <Link className="rounded-md bg-brand hover:bg-brand/70 px-3 py-2 mx-auto w-fit text-white" href='/recruitments'>See All Recruitments</Link>
                </div>
            </section> */}
        </div>
    )
}
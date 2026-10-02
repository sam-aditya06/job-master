import Sidebar from "@/components/sidebars/sidebar";
import { capitalize } from "@/lib/utils";

export default function Recruitments({ details }) {
    const { pageHeading, recruitments } = details;
    const intro = recruitments.length > 0 ?
        "Browse the latest recruitments for this job below:" :
        "There are currently no recruitments available for this job."
    return (
        <>
            <div className="lg:hidden">
                <Sidebar screen={'mobile'} />
            </div>
            <div className="cms-content mt-14 lg:mt-0 sm:pr-3">
                <article id="recruitments">
                    <header>
                        <h1>{pageHeading}</h1>
                        <p>{intro}</p>
                    </header>

                    <section>
                        {
                            recruitments.map(rec => {
                                const textColor = rec.status === 'upcoming' ?
                                    "text-yellow-700 dark:text-amber-400" :
                                    rec.status === 'ongoing' ?
                                        "text-green-700 dark:text-emerald-400" :
                                        "text-gray-700 dark:text-gray-300"
                                return (
                                    < div key={rec._id} className="border rounded-md p-3" >
                                        <p className="font-bold text-xl">{rec.name}</p>
                                        <div className="flex flex-col gap-1 mt-3">
                                            <div className="flex items-center gap-1">
                                                <b>Status:</b>
                                                <p className={textColor}>{capitalize(rec.status)}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start md:gap-1">
                                                <p className="min-w-fit"><b>Current Status:</b></p>
                                                <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: rec.currentStatus }} />
                                            </div>
                                            {
                                                rec.whatsNext &&
                                                <div className="flex flex-col sm:flex-row items-start md:gap-1">
                                                    <p className="min-w-fit"><b>What's Next:</b></p>
                                                    <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: rec.whatsNext }} />
                                                </div>
                                            }
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3">
                                            <a href={rec.overviewLink} target="_blank" className="link-btn !w-full">View Overview</a>
                                            <a href={rec.currentStageLink} target="_blank" className="link-btn !w-full">View Current Stage</a>
                                            <a href={rec.upcomingStageLink} target="_blank" className="link-btn !w-full">View Next Stage</a>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </section>
                </article>
            </div >
        </>
    )
}
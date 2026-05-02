import Link from 'next/link';

export default function RecruitmentDetails({ job }) {
    return (
        <div className="cms-content">
            <article id="recruitment-details">

                <h1>{job.abbr || job.name} – Recruitment Details</h1>

                <section className="recruitment-intro">
                    <p>
                        The recruitment for the post of {job.name} in {job.orgName} is conducted periodically.
                        Candidates can check the latest recruitment cycle, important updates, and apply through the recruitment page.
                    </p>
                </section>

                <section className="recruitment-summary">
                    <h2>Recruitment Overview</h2>

                    <div className="table-wrapper">
                        <table>
                            <tbody>
                                <tr>
                                    <th scope="row">Recruitment Name</th>
                                    <td>{job.recName}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Conducting Body</th>
                                    <td>{job.recruiterName}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Frequency</th>
                                    <td>{job.frequency || "Typically once a year"}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Job Location</th>
                                    <td>{job.location || "Across India"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="recruitment-cta">
                    <h2>Latest Recruitment</h2>

                    <p className="cta-helper">
                        Check application dates, admit cards, results, and complete recruitment details for the latest cycle.
                    </p>

                    <Link href={`/recruitments/${job.recSlug}`} className="link-btn btn-primary">
                        View Latest Recruitment →
                    </Link>
                </section>

                {
                    job.pastCycles.length > 0 &&
                    <section className="recruitment-history">
                        <h2>Previous Recruitment Cycles</h2>

                        <ul>
                            <li>
                                <Link href="/recruitment/{this.slug}">
                                    {job.abbr || job.name} {job.recYear}
                                </Link> – Completed
                            </li>
                        </ul>
                    </section>
                }

            </article>
        </div>
    )
}
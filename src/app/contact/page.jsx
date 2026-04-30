// app/contact/page.jsx

export const metadata = {
    title: `Contact Us | ${process.env.NEXT_PUBLIC_NAME}`,
    description: `Get in touch with the ${process.env.NEXT_PUBLIC_NAME} team. Report issues, share feedback, or follow us on social media.`,
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/contact`
    }
}

export default function ContactPage() {
    return (
        <section className="cms-content bg-background min-h-[calc(100svh-7rem)]">
            <div className="flex flex-col gap-5 mx-auto max-w-7xl p-5">
                <h1>Contact Us</h1>
                <p>
                    Have a question or want to get in touch? Here is how you can reach us.
                </p>

                <section>
                    <h2>Email</h2>
                    <p>
                        For general enquiries, reach us at{' '}
                        <a href={`mailto:$${process.env.NEXT_PUBLIC_EMAIL}`}>{process.env.NEXT_PUBLIC_EMAIL}</a>.
                        We try to respond within 2 working days.
                    </p>
                </section>

                <section>
                    <h2>Report an Issue</h2>
                    <p>
                        Found wrong information, a missing job, or a website bug? Use our{' '}
                        <a href="/feedback" className="underline">feedback form</a> to let us know. We review every
                        submission and fix issues as quickly as possible.
                    </p>
                </section>

                    {/* <section>
                        <h2>Follow Us</h2>
                        <p>
                            Stay updated with the latest government jobs and recruitments by following
                            us on social media.
                        </p>
                        <ul>
                            <li>
                                <a
                                    href="https://instagram.com/xyz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Instagram — job updates in reels and posts
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://youtube.com/@xyz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    YouTube — detailed recruitment videos
                                </a>
                            </li>
                        </ul>
                    </section > */}
            </div>
        </section >
    )
}
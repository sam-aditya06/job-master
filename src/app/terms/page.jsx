export const metadata = {
    title: `Terms of Service | ${process.env.NEXT_PUBLIC_NAME}`,
    description: `Read the terms of service of ${process.env.NEXT_PUBLIC_NAME}. Understand your rights and responsibilities when using our platform.`,
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/terms-of-service`
    }
}

export default function TermsOfServicePage() {
    return (
        <section className="cms-content bg-background min-h-[calc(100svh-7rem)]">
            <div className="flex flex-col gap-5 mx-auto max-w-7xl p-5">
                <h1>Terms of Service</h1>
                <p className="text-muted-foreground italic">Last updated: April 25, 2026</p>
                <div className="flex flex-col gap-5">
                    <p>
                        These Terms of Service ("Terms") govern your use of {process.env.NEXT_PUBLIC_NAME} ("we", "our", or "us"), 
                        accessible at {process.env.NEXT_PUBLIC_DOMAIN}. By
                        accessing or using our website, you agree to be bound by these Terms. If you
                        do not agree, please do not use our website.
                    </p>
                </div>
                <section className="flex flex-col gap-3">
                    <h2>1. About Our Platform</h2>
                    <p>
                        {process.env.NEXT_PUBLIC_NAME} is a free information platform that aggregates
                        publicly available information about government jobs and recruitment processes
                        in India. We help aspirants discover job roles and track recruitment cycles
                        by presenting this information in a clear and accessible format.
                    </p>
                    <p>
                        We are an independent platform and are not affiliated with, endorsed by, or
                        officially connected to any government body, ministry, department, public
                        sector undertaking, recruitment authority, or any other official entity
                        mentioned on this website. All official names, logos, and trademarks belong
                        to their respective owners.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>2. Use of Our Website</h2>
                    <p>
                        You may use {process.env.NEXT_PUBLIC_NAME} for personal, non-commercial
                        purposes only. By using our website, you agree to:
                    </p>
                    <p>
                        <strong>Use it lawfully —</strong> You will not use our website for any
                        purpose that is unlawful or prohibited by these Terms or applicable Indian law.
                    </p>
                    <p>
                        <strong>Not misuse our services —</strong> You will not attempt to gain
                        unauthorised access to any part of our website, interfere with its
                        functioning, or attempt to reverse engineer any part of the platform.
                    </p>
                    <p>
                        <strong>Not scrape our content —</strong> You will not use automated tools,
                        bots, or scripts to scrape, crawl, or extract content from our website
                        without our prior written permission.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>3. Feedback and User Submissions</h2>
                    <p>
                        We welcome feedback, issue reports, and suggestions through our feedback
                        form. When submitting feedback, you agree not to:
                    </p>
                    <p>
                        <strong>Spam —</strong> Submit multiple identical or meaningless messages,
                        or use the feedback form for any purpose other than genuine feedback or
                        issue reporting.
                    </p>
                    <p>
                        <strong>Submit harmful content —</strong> Submit content that is abusive,
                        offensive, defamatory, or contains personal attacks against any individual
                        or organisation.
                    </p>
                    <p>
                        <strong>Misrepresent —</strong> Provide false information or impersonate
                        any person or organisation in your submission.
                    </p>
                    <p>
                        We reserve the right to ignore, delete, or take action on any submission
                        that violates these Terms.
                    </p>
                    {/* TODO: update this section when user accounts are added */}
                </section>

                <section className="flex flex-col gap-3">
                    <h2>4. Intellectual Property</h2>
                    <p>
                        All content on {process.env.NEXT_PUBLIC_NAME} — including but not limited
                        to job descriptions, recruitment summaries, eligibility writeups,
                        responsibilities, perks, and any other original content — is the intellectual
                        property of {process.env.NEXT_PUBLIC_NAME} and is protected under applicable
                        Indian copyright law.
                    </p>
                    <p>
                        You may not copy, reproduce, republish, upload, post, transmit, or distribute
                        any content from our website without our prior written permission. This
                        includes scraping our content for use in other platforms, applications,
                        or datasets.
                    </p>
                    <p>
                        Information sourced from official government notifications and public
                        documents remains the property of the respective government authorities.
                        Our original presentation, curation, and organisation of this information
                        is our intellectual property.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>5. Third Party Links</h2>
                    <p>
                        Our website contains links to official government websites and other third
                        party platforms for the purpose of redirecting you to apply for jobs or
                        access official notifications. We are not responsible for the content,
                        accuracy, or privacy practices of these external websites.
                    </p>
                    <p>
                        Clicking on a third party link takes you away from {process.env.NEXT_PUBLIC_NAME}.
                        We encourage you to read the terms and privacy policies of any external
                        website you visit.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>6. Disclaimer of Warranties</h2>
                    <p>
                        {process.env.NEXT_PUBLIC_NAME} is provided on an "as is" and "as available"
                        basis without any warranties of any kind, express or implied. We do not
                        warrant that:
                    </p>
                    <p>
                        <strong>Information is always accurate or current —</strong> While we make
                        every effort to keep information up to date, government job details,
                        recruitment dates, eligibility criteria, and other information may change
                        without notice. Always verify details from the official notification or
                        website before making any decisions.
                    </p>
                    <p>
                        <strong>The website will be uninterrupted —</strong> We do not guarantee
                        that our website will be available at all times or free from errors or
                        technical issues.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>7. Limitation of Liability</h2>
                    <p>
                        To the fullest extent permitted by applicable law, {process.env.NEXT_PUBLIC_NAME}
                        and its owners shall not be liable for any direct, indirect, incidental,
                        or consequential damages arising from:
                    </p>
                    <p>
                        Your reliance on any information provided on our website, including missed
                        application deadlines, incorrect eligibility assumptions, or any decision
                        made based on information found on our platform.
                    </p>
                    <p>
                        Any interruption, suspension, or termination of our website or any of its
                        features.
                    </p>
                    <p>
                        We always recommend verifying all information from the official source
                        before taking any action.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>8. Governing Law</h2>
                    <p>
                        These Terms are governed by and construed in accordance with the laws of
                        India. Any disputes arising from these Terms or your use of our website
                        shall be subject to the exclusive jurisdiction of the courts of Puri, India.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>9. Changes to These Terms</h2>
                    <p>
                        We may update these Terms from time to time. Any changes will be posted on
                        this page with an updated date at the top. Continued use of our website
                        after any changes constitutes your acceptance of the updated Terms.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>10. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at{' '}
                        <a href={`mailto:$${process.env.NEXT_PUBLIC_EMAIL}`}>{process.env.NEXT_PUBLIC_EMAIL}</a>.
                    </p>
                </section>
            </div>
        </section >
    )
}
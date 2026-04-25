export const metadata = {
    title: `Disclaimer | ${process.env.NEXT_PUBLIC_NAME}`,
    description: `Read the disclaimer of ${process.env.NEXT_PUBLIC_NAME}. Understand the limitations of the information provided on our platform.`,
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/disclaimer`
    }
}

export default function DisclaimerPage() {
    return (
        <section className="cms-content bg-background min-h-[calc(100svh-7rem)]">
            <div className="flex flex-col gap-5 mx-auto max-w-7xl p-5">
                <h1>Disclaimer</h1>
                <p className="text-muted-foreground italic">Last updated: April 25, 2026</p>
                <p>
                    Please read this Disclaimer carefully before using {process.env.NEXT_PUBLIC_NAME},
                    accessible at {process.env.NEXT_PUBLIC_DOMAIN}.
                </p>

                <section className="flex flex-col gap-3">
                    <h2>1. Information Purpose</h2>
                    <p>
                        All information provided on {process.env.NEXT_PUBLIC_NAME} — including job
                        descriptions, eligibility criteria, recruitment stages, important dates,
                        vacancies, salary details, and any other content — is for general
                        informational purposes only.
                    </p>
                    <p>
                        While we make every effort to ensure the accuracy and completeness of the
                        information on our platform, we do not guarantee that all information is
                        current, accurate, or complete at all times. Government job notifications,
                        recruitment timelines, eligibility conditions, and other details are subject
                        to change by the respective authorities without prior notice.
                    </p>
                    <p>
                        We always recommend verifying all information directly from the official
                        notification or the official website of the concerned government body or
                        recruitment authority before making any decisions or taking any action.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>2. No Official Affiliation</h2>
                    <p>
                        {process.env.NEXT_PUBLIC_NAME} is an independent information platform. We
                        are not affiliated with, endorsed by, or officially connected to any
                        government body, ministry, department, public sector undertaking, recruitment
                        authority, or any other official entity mentioned on this website.
                    </p>
                    <p>
                        Any reference to government organisations, recruitment bodies, job roles,
                        or recruitment processes is purely for informational purposes. The use of
                        official names is purely for identification and does not imply any
                        association or endorsement.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>3. No Responsibility for External Links</h2>
                    <p>
                        Our website contains links to official government websites and third party
                        platforms. These links are provided for your convenience to access official
                        information and complete your application. We have no control over the
                        content, availability, or accuracy of these external websites.
                    </p>
                    <p>
                        We are not responsible for any loss, damage, or inconvenience caused by
                        accessing or relying on information from external websites linked on our
                        platform.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>4. No Responsibility for Missed Deadlines or Incorrect Applications</h2>
                    <p>
                        {process.env.NEXT_PUBLIC_NAME} shall not be held responsible for any missed
                        application deadlines, rejected applications, or any other consequences
                        arising from your reliance on information provided on our platform.
                    </p>
                    <p>
                        It is your sole responsibility to verify all recruitment details — including
                        application dates, eligibility conditions, fee details, and exam schedules —
                        from the official notification before applying. We strongly advise against
                        making any decisions based solely on information found on our platform.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>5. Advertising</h2>
                    <p>
                        {process.env.NEXT_PUBLIC_NAME} displays advertisements served by Ezoic, a
                        Google Certified Publishing Partner. These advertisements help us keep the
                        platform free for all users. We do not endorse any product, service, or
                        organisation advertised on our platform. The advertisers are solely
                        responsible for the content of their advertisements.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>6. Changes to This Disclaimer</h2>
                    <p>
                        We may update this Disclaimer from time to time. Any changes will be posted
                        on this page with an updated date at the top. Continued use of our website
                        after any changes constitutes your acceptance of the updated Disclaimer.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>7. Contact Us</h2>
                    <p>
                        If you have any questions about this Disclaimer, please contact us at{' '}
                        <a href={`mailto:$${process.env.NEXT_PUBLIC_EMAIL}`}>{process.env.NEXT_PUBLIC_EMAIL}</a>.
                    </p>
                </section>
            </div>
        </section >
    )
}
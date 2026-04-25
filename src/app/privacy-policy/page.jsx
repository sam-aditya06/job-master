// app/privacy-policy/page.jsx

export const metadata = {
    title: `Privacy Policy | ${process.env.NEXT_PUBLIC_NAME}`,
    description: `Read the privacy policy of ${process.env.NEXT_PUBLIC_NAME}. Learn how we collect, use, and protect your personal data.`,
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/privacy-policy`
    }
}

export default function PrivacyPolicyPage() {
    return (
        <section className="cms-content bg-background min-h-[calc(100svh-7rem)]">
            <div className="flex flex-col gap-10 mx-auto max-w-7xl p-5">
                <div>
                    <h1>Privacy Policy</h1>
                    <p className="text-muted-foreground italic">Last updated: April 25, 2026</p>
                </div>
                <div className="flex flex-col gap-5">
                    <p>
                        This Privacy Policy explains how {process.env.NEXT_PUBLIC_NAME} ("we", "our",
                        or "us") collects, uses, and protects your personal data when you visit our
                        website at {process.env.NEXT_PUBLIC_DOMAIN}. We are committed to protecting
                        your privacy in accordance with India's Digital Personal Data Protection Act,
                        2023 (DPDPA).
                    </p>
                    <p>
                        By using our website, you agree to the collection and use of information as
                        described in this policy.
                    </p>
                </div>

                <section className="flex flex-col gap-3">
                    <h2>1. Information We Collect</h2>
                    <p>We collect two types of information:</p>

                    <h3>a. Information You Provide</h3>
                    <p>
                        When you submit our feedback form, you may optionally provide your name
                        and email address along with your message. This information is stored
                        securely in our database and is used only to respond to your feedback
                        or improve our platform.
                    </p>

                    <h3>b. Information Collected Automatically</h3>
                    <p>
                        When you visit our website, certain information is collected automatically
                        through cookies and similar tracking technologies. This includes:
                    </p>
                    <p>
                        <strong>Google Analytics (GA4) —</strong> We use Google Analytics to
                        understand how visitors use our website. Google Analytics collects
                        information such as your device type, browser, operating system, approximate
                        location, pages visited, and time spent on the site. This data is anonymised
                        and aggregated. Google's privacy policy is available at{' '}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            policies.google.com/privacy
                        </a>.
                    </p>
                    <p>
                        <strong>Ezoic —</strong> We use Ezoic, a Google Certified Publishing Partner,
                        to serve advertisements on our website. Ezoic and its partners use cookies
                        and similar technologies to collect data about your browsing behaviour and
                        device to show you relevant advertisements. This may include personalised
                        ads based on your interests. Ezoic's privacy policy is available at{' '}
                        <a
                            href="https://www.ezoic.com/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ezoic.com/privacy-policy
                        </a>.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect for the following purposes:</p>
                    <p>
                        <strong>Feedback submissions —</strong> To review and respond to issues,
                        suggestions, or reports you submit through our feedback form.
                    </p>
                    <p>
                        <strong>Analytics —</strong> To understand how our website is used, identify
                        areas for improvement, and improve the overall user experience.
                    </p>
                    <p>
                        <strong>Advertising —</strong> To serve advertisements that help us keep
                        {process.env.NEXT_PUBLIC_NAME} free for all users.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>3. Cookies</h2>
                    <p>
                        Our website uses cookies — small text files stored on your device — to
                        enable analytics and advertising functionality. You can control or disable
                        cookies through your browser settings. Please note that disabling cookies
                        may affect the functionality of some parts of our website.
                    </p>
                    <p>
                        Cookies used on our website include:
                    </p>
                    <p>
                        <strong>Analytics cookies —</strong> Set by Google Analytics to track
                        page visits and user behaviour in an anonymised form.
                    </p>
                    <p>
                        <strong>Advertising cookies —</strong> Set by Ezoic and its advertising
                        partners to serve relevant ads and measure ad performance.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>4. Data Sharing</h2>
                    <p>
                        We do not sell your personal data to any third party. We share data only
                        in the following limited circumstances:
                    </p>
                    <p>
                        <strong>Service providers —</strong> We share data with Google Analytics
                        and Ezoic solely to provide analytics and advertising services as described
                        above. These providers are bound by their own privacy policies and data
                        protection obligations.
                    </p>
                    <p>
                        <strong>Legal requirements —</strong> We may disclose your information if
                        required to do so by law or in response to a valid request by a government
                        authority under applicable Indian law.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>5. Data Retention</h2>
                    <p>
                        Feedback submissions are retained for as long as necessary to address the
                        issue reported and improve our platform. Analytics and advertising data is
                        retained as per the policies of Google Analytics and Ezoic respectively.
                    </p>
                    <p>
                        You may request deletion of any personal data you have provided to us by
                        contacting us at{' '}
                        <a href="mailto:contact@xyz.com">contact@xyz.com</a>.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>6. Your Rights Under the DPDPA 2023</h2>
                    <p>
                        Under India's Digital Personal Data Protection Act, 2023, you have the
                        following rights regarding your personal data:
                    </p>
                    <p>
                        <strong>Right to access —</strong> You can request a summary of the personal
                        data we hold about you.
                    </p>
                    <p>
                        <strong>Right to correction —</strong> You can request correction of any
                        inaccurate or incomplete personal data we hold about you.
                    </p>
                    <p>
                        <strong>Right to erasure —</strong> You can request deletion of your personal
                        data, subject to any legal obligations we may have to retain it.
                    </p>
                    <p>
                        <strong>Right to grievance redressal —</strong> You can raise a grievance
                        with us regarding the processing of your personal data. We will respond
                        within a reasonable time.
                    </p>
                    <p>
                        To exercise any of these rights, contact us at{' '}
                        <a href="mailto:contact@xyz.com">contact@xyz.com</a>.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>7. Children's Privacy</h2>
                    <p>
                        Our website is not directed at children under the age of 18. We do not
                        knowingly collect personal data from children. If you believe a child has
                        provided us with personal data, please contact us and we will delete it
                        promptly.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>8. Third Party Links</h2>
                    <p>
                        Our website contains links to official government websites and other third
                        party sites. We are not responsible for the privacy practices of these
                        websites. We encourage you to read their privacy policies before providing
                        any personal data.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>9. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. Any changes will be
                        posted on this page with an updated date at the top. We encourage you to
                        review this page periodically. Continued use of our website after any
                        changes constitutes your acceptance of the updated policy.
                    </p>
                </section>

                <section className="flex flex-col gap-3">
                    <h2>10. Contact Us</h2>
                    <p>
                        If you have any questions, concerns, or requests regarding this Privacy
                        Policy or your personal data, please contact us at{' '}
                        <a href={`mailto:$${process.env.NEXT_PUBLIC_EMAIL}`}>{process.env.NEXT_PUBLIC_EMAIL}</a>.
                    </p>
                </section>
            </div >
        </section>
    )
}
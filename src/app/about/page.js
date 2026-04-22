export const metadata = {
  title: `About Us | ${process.env.NEXT_PUBLIC_NAME}`,
  description: `Learn about ${process.env.NEXT_PUBLIC_NAME} — why we built it, what we offer, and how we help government job aspirants across India.`,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/about`
  }
}

export default function AboutPage() {
  return (
    <main className="cms-content flex flex-col gap-5 mx-auto max-w-7xl p-5">
      <h1>About {process.env.NEXT_PUBLIC_NAME}</h1>

      <section>
        <h2>Why We Built This</h2>
        <p>
          If you have ever searched for a government job online, you know the pain. 
          The websites are cluttered, the filters are broken, and half the time you 
          cannot even find basic information about the role you are applying for. 
          You spend more time navigating the site than actually researching the job.
        </p>
        <p>
          We built {process.env.NEXT_PUBLIC_NAME} because we believed there had to be 
          a better way. A clean, simple platform where every government job in India 
          is listed in one place — with proper filters, clear role information, and 
          up-to-date recruitment tracking.
        </p>
      </section>

      <section>
        <h2>What We Do</h2>
        <p>
          {process.env.NEXT_PUBLIC_NAME} is a free platform that helps government job 
          aspirants across India in two ways:
        </p>
        <p>
          <strong>Discover Jobs —</strong> We maintain a comprehensive directory of 
          government job roles across central government, state government, PSUs, banking, 
          defence, railways, judiciary, police, and more. Each job page tells you everything 
          about the role — what the responsibilities are, what the eligibility criteria is, 
          what perks come with it, and what physical or medical standards are required.
        </p>
        <p>
          <strong>Track Recruitments —</strong> We track every active and upcoming 
          government recruitment cycle in India. From the initial notification to the 
          admit card, exam, result, and final selection — we keep you updated at every 
          stage so you never miss an important date.
        </p>
      </section>

      <section>
        <h2>Who Is This For</h2>
        <p>
          {process.env.NEXT_PUBLIC_NAME} is for anyone looking for a government job in 
          India — whether you are a fresh graduate exploring your options, an experienced 
          candidate looking for a specific role, or someone who just wants to stay updated 
          on the latest govt recruitments.
        </p>
      </section>

      <section>
        <h2>How It Works</h2>
        <p>
          We aggregate information about government jobs and recruitments from official 
          sources. When you find a recruitment you want to apply for, we redirect you to 
          the official website to complete your application. We do not process any 
          applications on our platform.
        </p>
        <p>
          All information on {process.env.NEXT_PUBLIC_NAME} is for reference purposes. 
          We always recommend verifying details from the official notification before 
          making any decisions.
        </p>
      </section>

      <section>
        <h2>Get In Touch</h2>
        <p>
          Have a suggestion, found an error, or want to report outdated information? 
          We would love to hear from you. Reach out to us at{" "}
          <a href="mailto:contact@xyz.com">contact@xyz.com</a>.
        </p>
      </section>
    </main>
  )
}
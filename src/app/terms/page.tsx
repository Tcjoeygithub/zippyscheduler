import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Zippy Scheduler.",
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl text-brand-dark">
              Zippy Scheduler
            </span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-brand-dark mb-4">
          Terms of Service
        </h1>
        <p className="text-brand-gray text-sm mb-8">
          Last updated: April 5, 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-brand-dark leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              Agreement to Terms
            </h2>
            <p>
              By using Zippy Scheduler (the &ldquo;Service&rdquo;) at{" "}
              <strong>zippyscheduler.com</strong>, you agree to these Terms of
              Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              Account Registration
            </h2>
            <p>
              You must provide accurate and complete information when creating
              an account. You are responsible for maintaining the security of
              your account credentials and for all activity that occurs under
              your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Pinterest Integration</h2>
            <p>
              Zippy Scheduler connects to Pinterest via the official Pinterest
              API using OAuth 2.0. By connecting your Pinterest account, you
              authorize us to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Read your Pinterest account information</li>
              <li>Create and manage boards on your behalf</li>
              <li>Create and publish pins on your behalf</li>
            </ul>
            <p className="mt-3">
              You can revoke this access at any time through your Pinterest
              settings or within our dashboard.
            </p>
            <p className="mt-3">
              You must comply with Pinterest&rsquo;s{" "}
              <a
                href="https://policy.pinterest.com/en/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://policy.pinterest.com/en/community-guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline"
              >
                Community Guidelines
              </a>{" "}
              when using Zippy Scheduler.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Acceptable Use</h2>
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Post spam, misleading content, or content that violates
                Pinterest&rsquo;s policies
              </li>
              <li>Engage in coordinated inauthentic behavior</li>
              <li>Violate any laws or third-party rights</li>
              <li>Attempt to reverse engineer or disrupt the Service</li>
              <li>Use the Service to harass, abuse, or harm others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Your Content</h2>
            <p>
              You retain ownership of all content you create and schedule
              through the Service. You grant us a limited license to store,
              display, and transmit your content solely for the purpose of
              operating the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              Service Availability
            </h2>
            <p>
              We strive to keep the Service available 24/7 but do not
              guarantee uninterrupted access. We may perform maintenance,
              updates, or modifications at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Disclaimers</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties
              of any kind. We do not guarantee that scheduled pins will always
              publish successfully (Pinterest API errors, rate limits, or
              service outages may cause failures).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, Zippy Scheduler shall
              not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Termination</h2>
            <p>
              We may suspend or terminate your account at any time for
              violation of these terms. You may delete your account at any
              time from your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the
              Service after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              Third-Party Affiliation
            </h2>
            <p>
              Zippy Scheduler is not affiliated with, endorsed by, or
              sponsored by Pinterest, Inc. We are an independent tool that
              uses Pinterest&rsquo;s official API.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Contact</h2>
            <p>
              Questions about these terms? Contact us at{" "}
              <a
                href="mailto:hello@zippyscheduler.com"
                className="text-brand-red hover:underline"
              >
                hello@zippyscheduler.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

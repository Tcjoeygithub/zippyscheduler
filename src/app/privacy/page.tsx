import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Zippy Scheduler Pinterest scheduling tool.",
};

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="text-brand-gray text-sm mb-8">
          Last updated: April 5, 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-brand-dark leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Introduction</h2>
            <p>
              Zippy Scheduler (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) operates the website at{" "}
              <strong>zippyscheduler.com</strong> (the &ldquo;Service&rdquo;).
              This Privacy Policy explains how we collect, use, store, and
              protect your information when you use our Pinterest scheduling
              tool.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              Information We Collect
            </h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">Account Information</h3>
            <p>
              When you create an account, we collect your email address and a
              hashed password. Authentication is handled by Supabase.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">
              Pinterest OAuth Data
            </h3>
            <p>
              When you connect your Pinterest account, Pinterest provides us
              with an access token and refresh token via OAuth 2.0. We store
              these tokens securely and use them only to perform actions you
              explicitly authorize (creating boards, creating pins, reading
              account data). We never receive your Pinterest password.
            </p>
            <p className="mt-2">
              The Pinterest data we access is limited to the scopes you
              approve: boards, pins, and basic account information.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">
              Content You Create
            </h3>
            <p>
              Pins and boards you create through our Service are stored in our
              database along with their images, titles, descriptions, and
              scheduled publish times.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">Usage Data</h3>
            <p>
              We may collect standard web analytics data such as IP address,
              browser type, pages viewed, and timestamps. This is used only to
              improve our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain the Service</li>
              <li>
                To publish pins and manage boards on your behalf via the
                Pinterest API
              </li>
              <li>To communicate with you about your account or the Service</li>
              <li>To improve and develop the Service</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Data Sharing</h2>
            <p>
              We do <strong>not</strong> sell your personal information. We
              share data only with:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Pinterest</strong>: We send pin and board data to
                Pinterest on your behalf via their official API.
              </li>
              <li>
                <strong>Supabase</strong>: Our database and authentication
                provider stores your account and content data.
              </li>
              <li>
                <strong>Vercel</strong>: Our hosting provider handles website
                traffic.
              </li>
              <li>
                <strong>Legal authorities</strong>: When required by law or to
                protect our rights.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Data Security</h2>
            <p>
              We take reasonable measures to protect your data, including
              encryption in transit (HTTPS), secure password hashing, and
              encrypted storage of OAuth tokens. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and all associated data</li>
              <li>Disconnect your Pinterest account at any time</li>
              <li>Export your data</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:hello@zippyscheduler.com"
                className="text-brand-red hover:underline"
              >
                hello@zippyscheduler.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              Pinterest Data Revocation
            </h2>
            <p>
              You can revoke Zippy Scheduler&rsquo;s access to your Pinterest
              account at any time by visiting your Pinterest account settings
              or by disconnecting from within our dashboard. When you revoke
              access, we delete the associated OAuth tokens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">
              Children&rsquo;s Privacy
            </h2>
            <p>
              Our Service is not intended for users under 13 years of age. We
              do not knowingly collect personal information from children
              under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">GDPR &amp; CCPA</h2>
            <p>
              If you are a resident of the European Economic Area (EEA) or
              California, you have specific rights under GDPR and CCPA
              respectively. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by email or through the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-8 mb-3">Contact Us</h2>
            <p>
              Questions about this Privacy Policy? Contact us at{" "}
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

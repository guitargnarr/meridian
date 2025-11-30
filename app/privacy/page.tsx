import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <Link
          href="/"
          className="text-red-400 hover:text-red-300 mb-8 inline-block"
        >
          &larr; Back to PhishGuard
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-slate max-w-none space-y-6">
          <p className="text-slate-300 text-lg">
            Last updated: November 30, 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Overview</h2>
            <p className="text-slate-300">
              PhishGuard is committed to protecting your privacy. This policy explains how we handle
              data when you use our email security analysis service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Data We Process</h2>
            <p className="text-slate-300">
              When you submit email text for analysis, we process:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>The email content you paste into the analysis form</li>
              <li>Basic request metadata (timestamp, request origin)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Data Retention</h2>
            <p className="text-slate-300">
              <strong className="text-white">We do not store your email content.</strong> Email text
              submitted for analysis is processed in real-time and immediately discarded after
              generating the classification result. We maintain aggregate statistics (total
              classifications, accuracy metrics) but these contain no personally identifiable information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Contact Form Data</h2>
            <p className="text-slate-300">
              If you submit the demo request form, we collect:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Name</li>
              <li>Work email address</li>
              <li>Company name</li>
              <li>Message content</li>
            </ul>
            <p className="text-slate-300">
              This information is used solely to respond to your inquiry and will not be shared
              with third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Third-Party Services</h2>
            <p className="text-slate-300">
              Our service is hosted on:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong className="text-white">Vercel</strong> - Frontend hosting</li>
              <li><strong className="text-white">Railway</strong> - API backend hosting</li>
            </ul>
            <p className="text-slate-300">
              These providers may collect standard server logs. Please refer to their respective
              privacy policies for details.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Security</h2>
            <p className="text-slate-300">
              All data transmission occurs over HTTPS. Our ML model runs locally on our servers
              and does not send your data to external AI services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p className="text-slate-300">
              For privacy questions, contact:{' '}
              <a
                href="mailto:matthewdscott7@gmail.com"
                className="text-red-400 hover:text-red-300"
              >
                matthewdscott7@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Built by Matthew Scott | Louisville, KY
          </p>
        </div>
      </div>
    </div>
  )
}

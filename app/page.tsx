'use client'

import { PhishGuardForm } from './components/PhishGuardForm'
import { ContactForm } from './components/ContactForm'
import { ApiStatus } from './components/ApiStatus'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="max-w-3xl w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="inline-block px-4 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-4">
              Enterprise Email Security
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
              PhishGuard
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
              ML-powered phishing detection. Protect your organization from email threats with 87% accuracy.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">87%</div>
              <div className="text-sm text-slate-400">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">2,039</div>
              <div className="text-sm text-slate-400">ML Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">&lt;15ms</div>
              <div className="text-sm text-slate-400">Response Time</div>
            </div>
          </div>

          <PhishGuardForm />

          {/* API Status */}
          <div className="flex justify-center">
            <ApiStatus />
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-slate-800/50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Enterprise Teams Choose PhishGuard
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="text-4xl">$4.9M</div>
              <div className="text-slate-300">Average cost of a data breach in 2024</div>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">91%</div>
              <div className="text-slate-300">Of cyberattacks start with phishing</div>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">3.4B</div>
              <div className="text-slate-300">Phishing emails sent daily</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-16 px-4" id="contact">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold text-white">
            Request Enterprise Demo
          </h2>
          <p className="text-slate-300">
            See how PhishGuard can protect your organization. Get a personalized demo and security assessment.
          </p>
          <ContactForm />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-400">
          <p>Built by Matthew Scott | ML Engineer | Louisville, KY</p>
          <p className="mt-2 space-x-4">
            <a href="mailto:matthewdscott7@gmail.com" className="hover:text-white transition">
              matthewdscott7@gmail.com
            </a>
            <span>|</span>
            <a href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

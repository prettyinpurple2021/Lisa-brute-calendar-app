import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | VibeOS',
  description: 'Terms of Service for VibeOS - Solo Founder Command Center',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="neo-card p-8 bg-card">
          <h1 className="text-3xl font-black mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using VibeOS (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                VibeOS is a productivity platform designed for solo founders and entrepreneurs. The Service includes task management, calendar scheduling, note-taking, habit tracking, file storage, AI chat assistance, and project management features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">To use the Service, you must:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Create an account with accurate information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 18 years old or have parental consent</li>
                <li>Not share your account with others</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Use the Service for any illegal purpose</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with other users&apos; use of the Service</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. User Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of all content you create using the Service. By using the Service, you grant us a limited license to store, process, and display your content solely for the purpose of providing the Service to you. We do not claim ownership of your content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service, including its design, features, and functionality, is owned by VibeOS and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the Service without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Certain features of the Service may require payment. By subscribing to a paid plan, you agree to pay all applicable fees. Fees are non-refundable except as required by law. We reserve the right to modify pricing with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue features with reasonable notice. We are not liable for any interruptions or data loss.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIBEOS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account at any time for violations of these Terms. You may terminate your account at any time through the Settings page. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which VibeOS operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, please contact us at legal@vibeos.app
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/privacy" className="text-sm font-bold text-primary hover:underline">
            View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | FIRST CLIENT AI",
  description: "Terms of Service for FIRST CLIENT AI",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none text-[var(--foreground)] space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using FIRST CLIENT AI, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. AI-Generated Content</h2>
            <p>FIRST CLIENT AI provides tools that use artificial intelligence to generate content (such as proposals and outreach messages). You acknowledge that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>You are solely responsible for reviewing and verifying any AI-generated content before using it or sending it to clients.</li>
              <li>We make no guarantees regarding the accuracy, completeness, or effectiveness of the generated content.</li>
              <li>The content generated is for your use, and we do not claim ownership of your specific generations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
            <p>You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Subscriptions and Payments</h2>
            <p>Certain features are available on a paid subscription basis (PRO plan). By subscribing, you agree to pay all applicable fees. Subscriptions renew automatically unless cancelled prior to the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, FIRST CLIENT AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at support@example.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

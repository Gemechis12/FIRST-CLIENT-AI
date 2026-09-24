import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | FIRST CLIENT AI",
  description: "Privacy Policy for FIRST CLIENT AI",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none text-[var(--foreground)] space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include your name, email address, payment information, and any data you input into our AI tools (such as services, niches, or prospects).</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send related information</li>
              <li>Generate AI-powered content based on your inputs</li>
              <li>Send you technical notices, updates, and support messages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. AI Data Processing</h2>
            <p>When you use our AI tools, your inputs are processed by third-party AI providers to generate responses. We do not use your personal data to train our own public models, but data is transmitted securely to our AI partners for the sole purpose of fulfilling your request.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@example.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

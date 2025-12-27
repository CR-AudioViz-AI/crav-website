import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | CRAIverse',
  description: 'Privacy Policy for CRAIverse - CR AudioViz AI LLC',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last Updated: December 26, 2025</p>
      
      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>We collect email, display name, content you create, and usage data. Payment info is processed by Stripe and PayPal directly.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. AI Data Processing</h2>
          <p>AI inputs are processed by OpenAI, Anthropic, Google, Mistral, and other providers. We do NOT sell your data or use it to train AI models without consent.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Service Providers</h2>
          <p>We use Supabase (database), Vercel (hosting), Stripe and PayPal (payments), and Resend (email).</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
          <p>You can access, correct, and delete your data. California (CCPA) and EU (GDPR) rights apply.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
          <p>Privacy: privacy@craudiovizai.com</p>
          <p>GDPR: dpo@craudiovizai.com</p>
        </section>
      </div>
    </div>
  );
}

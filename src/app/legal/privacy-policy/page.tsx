export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <p>We collect information you provide directly to us when you:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Create an account</li>
          <li>Use our services</li>
          <li>Subscribe to notifications</li>
          <li>Contact us</li>
          <li>Submit or bookmark events</li>
          <li>Update your profile information</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide and improve our services</li>
          <li>Send you updates about events</li>
          <li>Respond to your requests</li>
          <li>Prevent fraud and abuse</li>
          <li>Personalize your experience</li>
          <li>Process event submissions and bookmarks</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">3. Location Information</h2>
        <p className="mb-4">
          With your consent, we collect and process location information to show you relevant events in your area. You can control location permissions through your browser settings.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. Information Sharing</h2>
        <p className="mb-4">
          We do not sell your personal information. We may share your information with:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Event organizers when you register for events</li>
          <li>Service providers who assist our operations</li>
          <li>Law enforcement when required by law</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Your Rights</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access your personal information</li>
          <li>Update or correct your information</li>
          <li>Delete your account and data</li>
          <li>Opt-out of marketing communications</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">7. Cookies</h2>
        <p className="mb-4">
          We use cookies and similar technologies to improve your experience, understand site usage, and deliver relevant content.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">8. Changes to Privacy Policy</h2>
        <p className="mb-4">
          We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">9. Contact Us</h2>
        <p className="mb-4">
          If you have questions about this privacy policy, please contact us at privacy@findmyrave.com
        </p>
      </div>
    </div>
  );
} 